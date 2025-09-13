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
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { supabase } from '../../lib/supabase';
import { PlaceCategory, PlaceSpec, HotelSpec, TourPlanPlace, ArtisanData } from '../../shared/types';
import ArtifactsNearby from '@/components/Artifacts/ArtifactsNearby';

const { width, height } = Dimensions.get('window');

const JHARKHAND_BOUNDS = {
  northEast: { latitude: 25.6, longitude: 88.2 },
  southWest: { latitude: 21.8, longitude: 83.5 }
};

const ICON_MAP: Record<PlaceCategory, any> = {
  Heritage: require('../../assets/icons/heritage.png'),
  Temple: require('../../assets/icons/temple.png'),
  Museum: require('../../assets/icons/museum.png'),
  Nature: require('../../assets/icons/nature.png'),
  Fort: require('../../assets/icons/fort.png'),
  Beach: require('../../assets/icons/beach.png'),
  Market: require('../../assets/icons/market.png'),
  Park: require('../../assets/icons/park.png'),
  Transport: require('../../assets/icons/transport.png'),
  Wildlife: require('../../assets/icons/wildlife.png'),
  'National Park': require('../../assets/icons/national-park.png'),
  Village: require('../../assets/icons/village.png'),
  Town: require('../../assets/icons/town.png'),
  Viewpoint: require('../../assets/icons/viewpoint.png'),
  'Cultural Site': require('../../assets/icons/cultural-site.png'),
  Pilgrimage: require('../../assets/icons/pilgrimage.png'),
  Archaeological: require('../../assets/icons/a.png'),
  Hillstation: require('../../assets/icons/mountain.png'),
  Engineering: require('../../assets/icons/engineering.png'),
  Religious: require('../../assets/icons/religious.png'),
  Lake: require('../../assets/icons/lake.png'),
  Shopping: require('../../assets/icons/shopping.png'),
};

export default function JHMap() {
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
    latitude: 23.8,
    longitude: 85.3,
    latitudeDelta: 5,
    longitudeDelta: 5,
  });
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const visitedRef = useRef<Set<string>>(new Set());

  // Get user location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

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

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      const { data: placesData } = await supabase.from('places').select('*');
      const { data: hotelsData } = await supabase.from('hotels').select('*');
      const { data: artisansData } = await supabase.from('artifacts').select('*');
      
      if (placesData) setPlaces(placesData as PlaceSpec[]);
      if (hotelsData) setHotels(hotelsData as HotelSpec[]);
      if (artisansData) setArtisans(artisansData as ArtisanData[]);

      // Start from Birsa Munda Airport, Ranchi
      setActiveId('dea514b4-4fed-40d5-852f-9dea8adb8f49');
    }
    fetchData();
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
  useEffect(() => {
    if (!activeId) return;
    const place = places.find((p) => p.id === activeId);
    if (!place) return;

    visitedRef.current.add(place.id);

    // Animate map to the place
    mapRef.current?.animateToRegion({
      latitude: place.lat,
      longitude: place.lon,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    }, 1000);
  }, [activeId, places]);

  // Tour Mode: fly to nearest unvisited
  useEffect(() => {
    if (!tourMode || !places.length || !activeId) return;

    let timeout: NodeJS.Timeout;
    const current = places.find((p) => p.id === activeId);
    if (!current) return;

    const flyNext = () => {
      if (tourPaused) return;
      const candidates = places.filter((p) => !visitedRef.current.has(p.id));
      if (!candidates.length) return;

      // find nearest unvisited
      let nearest = candidates[0];
      let minDist = haversine(current.lat, current.lon, nearest.lat, nearest.lon);
      for (const p of candidates) {
        const d = haversine(current.lat, current.lon, p.lat, p.lon);
        if (d < minDist) {
          nearest = p;
          minDist = d;
        }
      }

      setActiveId(nearest.id);
      timeout = setTimeout(flyNext, 7000);
    };

    timeout = setTimeout(flyNext, 7000);
    return () => clearTimeout(timeout);
  }, [tourMode, tourPaused, activeId, places]);

  const toggleDescription = (placeId: string) => {
    const newExpanded = new Set(expandedDescriptions);
    if (newExpanded.has(placeId)) {
      newExpanded.delete(placeId);
    } else {
      newExpanded.add(placeId);
    }
    setExpandedDescriptions(newExpanded);
  };

  const truncateWords = (text: string, maxWords: number) => {
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  const addToTourPlan = async (place: PlaceSpec) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      if (tourPlan.some(p => p.id === place.id)) {
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
        Alert.alert('Error', 'Failed to add to tour plan');
        return;
      }

      setTourPlan(updatedTourPlan);
      Alert.alert('Success', 'Added to tour plan');
    } catch (error) {
      console.error('Error adding to tour plan:', error);
      Alert.alert('Error', 'Failed to add to tour plan');
    }
  };

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
        Alert.alert('Error', 'Failed to remove from tour plan');
        return;
      }

      setTourPlan(updatedTourPlan);
      Alert.alert('Success', 'Removed from tour plan');
    } catch (error) {
      console.error('Error removing from tour plan:', error);
      Alert.alert('Error', 'Failed to remove from tour plan');
    }
  };

  const activePlace = places.find((p) => p.id === activeId);
  const hotelsWithinRadius = hotels.filter((h) => {
    if (!activePlace) return false;
    return haversine(activePlace.lat, activePlace.lon, h.lat, h.lon) <= distanceSetting;
  });

  return (
    <View style={styles.container}>
      {/* Login Prompt Modal */}
      <Modal
        visible={showLoginPrompt}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLoginPrompt(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Login Required</Text>
            <Text style={styles.modalText}>
              You need to be logged in to add places to your tour plan.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLoginPrompt(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  setShowLoginPrompt(false);
                  // Navigate to login screen - you'll need to implement navigation
                }}
              >
                <Text style={styles.confirmButtonText}>Go to Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Tour Plan Modal */}
      <Modal
        visible={showTourPlan}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTourPlan(false)}
      >
        <View style={styles.tourPlanModal}>
          <View style={styles.tourPlanContent}>
            <View style={styles.tourPlanHeader}>
              <Text style={styles.tourPlanTitle}>Your Tour Plan</Text>
              <TouchableOpacity onPress={() => setShowTourPlan(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {tourPlan.length === 0 ? (
              <Text style={styles.emptyTourPlan}>No places in your tour plan yet.</Text>
            ) : (
              <ScrollView style={styles.tourPlanList}>
                {tourPlan.map((place) => (
                  <View key={place.id} style={styles.tourPlanItem}>
                    <View style={styles.tourPlanInfo}>
                      <Text style={styles.tourPlanName}>{place.name}</Text>
                      {place.city && <Text style={styles.tourPlanCity}>{place.city}</Text>}
                    </View>
                    <TouchableOpacity 
                      onPress={() => removeFromTourPlan(place.id)}
                      style={styles.removeButton}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
            
            <TouchableOpacity
              style={styles.buildPlanButton}
              onPress={() => {
                // Navigate to MyTourPlan screen
              }}
            >
              <Text style={styles.buildPlanButtonText}>Build Plan with AI</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            pinColor="blue"
          />
        )}
        
        {/* Place markers */}
        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.lat, longitude: place.lon }}
            title={place.name}
            onPress={() => setActiveId(place.id)}
          >
            <Image 
              source={ICON_MAP[place.category] || ICON_MAP.Heritage} 
              style={[
                styles.marker, 
                activeId === place.id && styles.activeMarker
              ]} 
            />
          </Marker>
        ))}
        
        {/* Hotel markers within radius */}
        {activePlace && hotelsWithinRadius.map((hotel) => (
          <Marker
            key={hotel.id}
            coordinate={{ latitude: hotel.lat, longitude: hotel.lon }}
            title={hotel.name}
            onPress={() => {
              // Open Google Maps or other navigation app
            }}
          >
            <Image 
              source={require('../../assets/icons/hotel.png')} 
              style={styles.hotelMarker} 
            />
          </Marker>
        ))}
      </MapView>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.controlGroup}>
          <Text style={styles.controlLabel}>Radius:</Text>
          <View style={styles.pickerContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[0.3, 1, 2, 3, 5].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.radiusOption,
                    distanceSetting === value && styles.radiusOptionSelected
                  ]}
                  onPress={() => setDistanceSetting(value)}
                >
                  <Text style={[
                    styles.radiusText,
                    distanceSetting === value && styles.radiusTextSelected
                  ]}>
                    {value === 0.3 ? '300 m' : `${value} km`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
        
        <View style={styles.tourControl}>
          <Text style={styles.controlLabel}>Tour Guide</Text>
          <TouchableOpacity 
            style={[styles.toggle, tourMode && styles.toggleActive]}
            onPress={() => setTourMode(!tourMode)}
          >
            <View style={[styles.toggleButton, tourMode && styles.toggleButtonActive]} />
          </TouchableOpacity>
          
          {tourMode && (
            <TouchableOpacity
              style={styles.playPauseButton}
              onPress={() => setTourPaused((p) => !p)}
            >
              <Text style={styles.playPauseText}>
                {tourPaused ? '▶️ Play' : '⏸️ Pause'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tour Plan Button */}
      <TouchableOpacity 
        style={styles.tourPlanButton}
        onPress={() => setShowTourPlan(true)}
      >
        <Image 
          source={require('../../assets/icons/ai.png')} 
          style={styles.tourPlanIcon} 
        />
        <Text style={styles.tourPlanButtonText}>Your Tour Plan</Text>
        {tourPlan.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{tourPlan.length}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Info Panel */}
      {activePlace && (
        <View style={styles.infoPanel}>
          <ScrollView>
            <TouchableOpacity 
              style={styles.closeInfoButton}
              onPress={() => setActiveId(null)}
            >
              <Text style={styles.closeInfoText}>✕ Close</Text>
            </TouchableOpacity>

            <Text style={styles.placeName}>{activePlace.name}</Text>
            <Text style={styles.placeDetails}>
              {activePlace.city} • {activePlace.category}
            </Text>
            
            <TouchableOpacity
              style={styles.addToTourButton}
              onPress={() => addToTourPlan(activePlace)}
            >
              <Text style={styles.addToTourText}>Add to Tour Plan</Text>
            </TouchableOpacity>

            {/* Images */}
            {activePlace.images && activePlace.images.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                {activePlace.images.map((imgSrc, idx) => (
                  <Image
                    key={idx}
                    source={{ uri: imgSrc.startsWith('http') ? imgSrc : imgSrc }}
                    style={styles.placeImage}
                  />
                ))}
              </ScrollView>
            )}
            
            {/* Description */}
            {activePlace.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.description}>
                  {expandedDescriptions.has(activePlace.id) 
                    ? activePlace.description 
                    : truncateWords(activePlace.description, 20)}
                </Text>
                {activePlace.description.split(' ').length > 20 && (
                  <TouchableOpacity 
                    onPress={() => toggleDescription(activePlace.id)}
                    style={styles.readMoreButton}
                  >
                    <Text style={styles.readMoreText}>
                      {expandedDescriptions.has(activePlace.id) ? 'Read less' : 'Read more'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            
            {activePlace.google_map_link && (
              <TouchableOpacity
                style={styles.navigateButton}
                onPress={() => {
                  // Open in maps app
                }}
              >
                <Text style={styles.navigateText}>Navigate in Google Maps</Text>
              </TouchableOpacity>
            )}
            
            {/* Artifacts Nearby */}
            <ArtifactsNearby 
              activePlace={activePlace} 
              distanceSetting={distanceSetting} 
              shops={artisans}
            />

            {/* Hotels within radius */}
            <Text style={styles.sectionTitle}>
              Hotels within {distanceSetting} km
            </Text>
            
            {!hotelsWithinRadius.length ? (
              <Text style={styles.noHotels}>No hotels in range.</Text>
            ) : (
              <ScrollView style={styles.hotelsList}>
                {hotelsWithinRadius.map((h) => (
                  <TouchableOpacity
                    key={h.id}
                    style={styles.hotelItem}
                    onPress={() => {
                      // Open in maps app
                    }}
                  >
                    <View style={styles.hotelInfo}>
                      <Text style={styles.hotelName}>{h.name}</Text>
                      {h.rating && (
                        <Text style={styles.hotelRating}>Rating: {h.rating}★</Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.addHotelButton}
                      onPress={() => addToTourPlan({
                        id: h.id,
                        name: h.name,
                        category: 'Hotel' as PlaceCategory,
                        lat: h.lat,
                        lon: h.lon
                      })}
                    >
                      <Text style={styles.addHotelText}>Add to Tour</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1929', // Dark blue background
  },
  map: {
    width: '100%',
    height: '100%',
  },
  controls: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(10, 25, 41, 0.8)',
    borderRadius: 12,
    padding: 12,
    width: '60%',
  },
  controlGroup: {
    marginBottom: 12,
  },
  controlLabel: {
    color: '#a0d2ff', // Light blue
    fontSize: 14,
    marginBottom: 6,
  },
  pickerContainer: {
    flexDirection: 'row',
  },
  radiusOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'rgba(160, 210, 255, 0.2)',
  },
  radiusOptionSelected: {
    backgroundColor: '#7b2cbf', // Purple
  },
  radiusText: {
    color: '#a0d2ff', // Light blue
    fontSize: 12,
  },
  radiusTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  tourControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggle: {
    width: 50,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ccc',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#4caf50', // Green
  },
  toggleButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'white',
    transform: [{ translateX: 0 }],
  },
  toggleButtonActive: {
    transform: [{ translateX: 24 }],
  },
  playPauseButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(123, 44, 191, 0.7)', // Purple
  },
  playPauseText: {
    color: 'white',
    fontSize: 12,
  },
  tourPlanButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(123, 44, 191, 0.9)', // Purple
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  tourPlanIcon: {
    width: 20,
    height: 20,
    marginRight: 6,
    tintColor: 'white',
  },
  tourPlanButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: '#4caf50', // Green
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: '#0a1929', // Dark blue
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
  },
  closeInfoButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  closeInfoText: {
    color: '#ff6b6b', // Red
    fontSize: 14,
  },
  placeName: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  placeDetails: {
    color: '#a0d2ff', // Light blue
    fontSize: 14,
    marginBottom: 12,
  },
  addToTourButton: {
    backgroundColor: '#7b2cbf', // Purple
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  addToTourText: {
    color: 'white',
    fontWeight: 'bold',
  },
  imageScroll: {
    marginBottom: 16,
  },
  placeImage: {
    width: 150,
    height: 100,
    borderRadius: 12,
    marginRight: 10,
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  description: {
    color: '#e0e0e0',
    fontSize: 14,
    lineHeight: 20,
  },
  readMoreButton: {
    marginTop: 6,
  },
  readMoreText: {
    color: '#4caf50', // Green
    fontSize: 14,
  },
  navigateButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)', // Green with transparency
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  navigateText: {
    color: '#4caf50', // Green
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  noHotels: {
    color: '#a0d2ff', // Light blue
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 16,
  },
  hotelsList: {
    maxHeight: 120,
  },
  hotelItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(160, 210, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  hotelInfo: {
    flex: 1,
  },
  hotelName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  hotelRating: {
    color: '#a0d2ff', // Light blue
    fontSize: 12,
  },
  addHotelButton: {
    backgroundColor: '#7b2cbf', // Purple
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  addHotelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  marker: {
    width: 30,
    height: 30,
  },
  activeMarker: {
    width: 40,
    height: 40,
    tintColor: '#7b2cbf', // Purple
  },
  hotelMarker: {
    width: 24,
    height: 24,
    tintColor: '#4caf50', // Green
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#0a1929', // Dark blue
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    color: '#a0d2ff', // Light blue
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: 'rgba(160, 210, 255, 0.2)',
  },
  cancelButtonText: {
    color: '#a0d2ff', // Light blue
    textAlign: 'center',
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#7b2cbf', // Purple
  },
  confirmButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tourPlanModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tourPlanContent: {
    backgroundColor: '#0a1929', // Dark blue
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  tourPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(160, 210, 255, 0.3)',
  },
  tourPlanTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    color: '#ff6b6b', // Red
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyTourPlan: {
    color: '#a0d2ff', // Light blue
    textAlign: 'center',
    marginVertical: 24,
    fontSize: 16,
  },
  tourPlanList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  tourPlanItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(160, 210, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  tourPlanInfo: {
    flex: 1,
  },
  tourPlanName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  tourPlanCity: {
    color: '#a0d2ff', // Light blue
    fontSize: 14,
  },
  removeButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  removeButtonText: {
    color: '#ff6b6b', // Red
    fontSize: 12,
    fontWeight: '500',
  },
  buildPlanButton: {
    backgroundColor: '#7b2cbf', // Purple
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buildPlanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});