import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  Image,
  Alert,
  Platform
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, LatLng, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase'; // Assuming you have supabase configured
import { PlaceCategory, PlaceSpec, HotelSpec, TourPlanPlace, ArtisanData } from '../types'; // Your types

const { width, height } = Dimensions.get('window');

// Theme colors
const COLORS = {
  primary: '#6366f1',    // Indigo (purple-ish)
  secondary: '#10b981',  // Emerald (green)
  accent: '#3b82f6',     // Blue
  dark: '#1f2937',       // Dark gray
  light: '#f8fafc',      // Light background
  danger: '#ef4444',     // Red for errors/close
};

const JHMapExpo = () => {
  const mapRef = useRef<MapView>(null);
  const [places, setPlaces] = useState<PlaceSpec[]>([]);
  const [hotels, setHotels] = useState<HotelSpec[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [distanceSetting, setDistanceSetting] = useState<number>(2);
  const [tourMode, setTourMode] = useState(true);
  const [tourPaused, setTourPaused] = useState(false);
  const [showTourPlan, setShowTourPlan] = useState(false);
  const [tourPlan, setTourPlan] = useState<TourPlanPlace[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [artisans, setArtisans] = useState<ArtisanData[]>([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  const [region, setRegion] = useState<Region>({
    latitude: 23.8,  // Central Jharkhand
    longitude: 85.3,
    latitudeDelta: 7,
    longitudeDelta: 7,
  });

  // Icons mapping - using require for local images
  const ICON_MAP: Record<PlaceCategory, any> = {
    Heritage: require('../assets/icons/heritage.png'),
    Temple: require('../assets/icons/temple.png'),
    Museum: require('../assets/icons/museum.png'),
    Nature: require('../assets/icons/nature.png'),
    Fort: require('../assets/icons/fort.png'),
    Beach: require('../assets/icons/beach.png'),
    Market: require('../assets/icons/market.png'),
    Park: require('../assets/icons/park.png'),
    Transport: require('../assets/icons/transport.png'),
    Wildlife: require('../assets/icons/wildlife.png'),
    'National Park': require('../assets/icons/national-park.png'),
    Village: require('../assets/icons/village.png'),
    Town: require('../assets/icons/town.png'),
    Viewpoint: require('../assets/icons/viewpoint.png'),
    'Cultural Site': require('../assets/icons/cultural-site.png'),
    Pilgrimage: require('../assets/icons/pilgrimage.png'),
    Archaeological: require('../assets/icons/archaeological.png'),
    Hillstation: require('../assets/icons/mountain.png'),
    Engineering: require('../assets/icons/engineering.png'),
    Religious: require('../assets/icons/religious.png'),
    Lake: require('../assets/icons/lake.png'),
    Shopping: require('../assets/icons/shopping.png'),
  };

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Fetch places + hotels from Supabase
  useEffect(() => {
    async function fetchData() {
      const { data: placesData } = await supabase.from('places').select('*');
      const { data: hotelsData } = await supabase.from('hotels').select('*');
      if (placesData) setPlaces(placesData as PlaceSpec[]);
      if (hotelsData) setHotels(hotelsData as HotelSpec[]);

      // start from Birsa Munda Airport, Ranchi (example ID)
      setActiveId('dea514b4-4fed-40d5-852f-9dea8adb8f49');
    }
    fetchData();
  }, []);

  // Fetch artisans
  useEffect(() => {
    async function fetchArtisans() {
      const { data: artisansData } = await supabase.from('artifacts').select('*');
      if (artisansData) setArtisans(artisansData as ArtisanData[]);
    }
    fetchArtisans();
  }, []);

  // Fetch user's tour plan
  useEffect(() => {
    const fetchTourPlan = async () => {
      if (!user) {
        setTourPlan([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('consumer_profiles')
          .select('visit_places')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching tour plan:', error);
          return;
        }

        if (data?.visit_places) {
          const validPlaces = data.visit_places.filter((place: any) => place !== null) as TourPlanPlace[];
          setTourPlan(validPlaces);
        } else {
          setTourPlan([]);
        }
      } catch (error) {
        console.error('Error fetching tour plan:', error);
      }
    };

    fetchTourPlan();
  }, [user]);

  const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Handle active place selection
  const handleMarkerPress = (placeId: string) => {
    setActiveId(placeId);
    const place = places.find((p) => p.id === placeId);
    if (place && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: place.lat,
        longitude: place.lon,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }, 1000);
    }
  };

  // Toggle description expansion
  const toggleDescription = (placeId: string) => {
    const newExpanded = new Set(expandedDescriptions);
    if (newExpanded.has(placeId)) {
      newExpanded.delete(placeId);
    } else {
      newExpanded.add(placeId);
    }
    setExpandedDescriptions(newExpanded);
  };

  // Truncate text helper
  const truncateWords = (text: string, maxWords: number) => {
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  // Add place to tour plan
  const addToTourPlan = async (place: PlaceSpec) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      if (tourPlan.some(p => p.id === place.id)) {
        Alert.alert('Already in Tour Plan', 'This place is already in your tour plan.');
        return;
      }

      const newPlace: TourPlanPlace = {
        id: place.id,
        name: place.name,
        city: place.city
      };

      const updatedTourPlan = [...tourPlan, newPlace];
      
      const { error } = await supabase
        .from('consumer_profiles')
        .upsert({
          id: user.id,
          visit_places: updatedTourPlan,
          updated_at: new Date().toISOString()
        },
        { onConflict: "id" }
      );

      if (error) {
        console.error('Error updating tour plan:', error);
        Alert.alert('Error', 'Could not add to tour plan.');
        return;
      }

      setTourPlan(updatedTourPlan);
      Alert.alert('Success', 'Added to your tour plan!');
    } catch (error) {
      console.error('Error adding to tour plan:', error);
      Alert.alert('Error', 'Could not add to tour plan.');
    }
  };

  // Remove place from tour plan
  const removeFromTourPlan = async (placeId: string) => {
    if (!user) return;

    try {
      const updatedTourPlan = tourPlan.filter(p => p.id !== placeId);
      
      const { error } = await supabase
        .from('consumer_profiles')
        .upsert({
          id: user.id,
          visit_places: updatedTourPlan,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating tour plan:', error);
        Alert.alert('Error', 'Could not remove from tour plan.');
        return;
      }

      setTourPlan(updatedTourPlan);
      Alert.alert('Removed', 'Place removed from your tour plan.');
    } catch (error) {
      console.error('Error removing from tour plan:', error);
      Alert.alert('Error', 'Could not remove from tour plan.');
    }
  };

  const activePlace = places.find((p) => p.id === activeId);
  const hotelsWithinRadius = hotels.filter((h) => {
    if (!activePlace) return false;
    return haversine(activePlace.lat, activePlace.lon, h.lat, h.lon) <= distanceSetting;
  });

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
      >
        {/* Place Markers */}
        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.lat, longitude: place.lon }}
            onPress={() => handleMarkerPress(place.id)}
          >
            <View style={[
              styles.markerContainer,
              activeId === place.id && styles.activeMarker
            ]}>
              <Image 
                source={ICON_MAP[place.category] || ICON_MAP.Heritage} 
                style={styles.markerIcon}
              />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.controlGroup}>
          <Text style={styles.controlLabel}>Radius:</Text>
          <View style={styles.selector}>
            <TouchableOpacity 
              style={[
                styles.selectorButton, 
                distanceSetting === 0.3 && styles.selectorButtonActive
              ]}
              onPress={() => setDistanceSetting(0.3)}
            >
              <Text style={styles.selectorButtonText}>300m</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.selectorButton, 
                distanceSetting === 1 && styles.selectorButtonActive
              ]}
              onPress={() => setDistanceSetting(1)}
            >
              <Text style={styles.selectorButtonText}>1km</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.selectorButton, 
                distanceSetting === 2 && styles.selectorButtonActive
              ]}
              onPress={() => setDistanceSetting(2)}
            >
              <Text style={styles.selectorButtonText}>2km</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.controlGroup}>
          <Text style={styles.controlLabel}>Tour Guide:</Text>
          <TouchableOpacity 
            style={[
              styles.toggleButton,
              tourMode && styles.toggleButtonActive
            ]}
            onPress={() => setTourMode(!tourMode)}
          >
            <Text style={styles.toggleButtonText}>
              {tourMode ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>

        {tourMode && (
          <TouchableOpacity
            style={styles.pauseButton}
            onPress={() => setTourPaused((p) => !p)}
          >
            <Text style={styles.pauseButtonText}>
              {tourPaused ?