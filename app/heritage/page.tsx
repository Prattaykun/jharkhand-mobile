import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  Share,
  Linking,
  Alert,
  Platform,
} from "react-native";
import { createClient } from "@supabase/supabase-js";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type EventItem = {
  id: string;
  title: string;
  category: string;
  start_date: string;
  end_date?: string;
  venue: string;
  city: string;
  description: string;
  image_url?: string;
  ticket_price?: string;
  contact_info?: string;
  featured?: boolean;
};

function getEventStatus(event: EventItem) {
  const now = new Date();
  const start = new Date(event.start_date);
  const end = event.end_date ? new Date(event.end_date) : start;

  if (now < start) return "Upcoming";
  if (now >= start && now <= end) return "Ongoing";
  return "Completed";
}

export default function EventsPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showOngoingOnly, setShowOngoingOnly] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const handleShare = async () => {
    if (!selectedEvent) return;
    
    try {
      const result = await Share.share({
        title: selectedEvent.title,
        message: `${selectedEvent.title} - ${selectedEvent.description}\n\nCheck out this event in the West Bengal Events app!`,
        url: "https://westbengalevents.com", // Replace with your app's URL
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share event");
    }
  };

  const handleAddToCalendar = () => {
    if (!selectedEvent) return;
    Alert.alert("Add to Calendar", "This would add the event to your calendar");
    // In a real app, you would use a library like `expo-calendar`
  };

  const handleBookTickets = () => {
    if (selectedEvent?.contact_info) {
      Linking.openURL(`mailto:${selectedEvent.contact_info}?subject=Booking Enquiry: ${selectedEvent.title}`);
    } else {
      Alert.alert("Info", "Booking info not available yet.");
    }
  };

  const categories = ["Festivals", "Music", "Dance", "Theater", "Art"];

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start_date", { ascending: true });

      if (error) {
        console.error("❌ Error fetching events:", error.message);
      } else {
        setEvents(data || []);
      }
      setLoading(false);
    };

    fetchEvents();
  }, []);

  const filtered = useMemo(() => {
    const uniqueEvents = Array.from(new Map(events.map(ev => [ev.id, ev])).values());

    return uniqueEvents.filter((ev) => {
      if (activeCategory && ev.category !== activeCategory) return false;
      if (showOngoingOnly && getEventStatus(ev) !== "Ongoing") return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !ev.title.toLowerCase().includes(q) &&
          !ev.city.toLowerCase().includes(q) &&
          !ev.description.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [query, activeCategory, showOngoingOnly, events]);

  const renderEventItem = ({ item }: { item: EventItem }) => {
    const status = getEventStatus(item);
    const statusColor = status === "Ongoing" ? "#10B981" : 
                        status === "Upcoming" ? "#3B82F6" : "#6B7280";
    
    return (
      <TouchableOpacity 
        style={styles.eventCard}
        onPress={() => setSelectedEvent(item)}
      >
        <View style={styles.eventImageContainer}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.eventImage} />
          ) : (
            <View style={[styles.eventImage, styles.noImage]}>
              <Ionicons name="image-outline" size={32} color="#9CA3AF" />
              <Text style={styles.noImageText}>No image</Text>
            </View>
          )}
          
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>

        <View style={styles.eventContent}>
          <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.eventDescription} numberOfLines={3}>
            {item.description}
          </Text>

          <View style={styles.eventDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text style={styles.detailText}>
                {item.city} • {item.venue}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <Text style={styles.detailText}>
                {new Date(item.start_date).toLocaleDateString()}
                {item.end_date ? ` – ${new Date(item.end_date).toLocaleDateString()}` : ""}
              </Text>
            </View>

            {item.ticket_price && (
              <View style={styles.detailRow}>
                <Ionicons name="ticket-outline" size={14} color="#6B7280" />
                <Text style={styles.detailText}>Ticket: {item.ticket_price}</Text>
              </View>
            )}

            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {status}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.viewDetailsButton}
            onPress={() => setSelectedEvent(item)}
          >
            <Text style={styles.viewDetailsText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Explore West Bengal</Text>
          <Text style={styles.headerSubtitle}>
            Discover festivals, concerts, exhibitions, and more across the state
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search events..."
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <TouchableOpacity 
            style={styles.filterToggle}
            onPress={() => setShowOngoingOnly(!showOngoingOnly)}
          >
            <Text style={styles.filterToggleText}>Ongoing Only</Text>
            <View style={styles.toggle}>
              {showOngoingOnly ? (
                <Ionicons name="checkbox" size={24} color="#8B5CF6" />
              ) : (
                <Ionicons name="square-outline" size={24} color="#6B7280" />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        <TouchableOpacity
          onPress={() => setActiveCategory(null)}
          style={[
            styles.categoryButton,
            activeCategory === null && styles.categoryButtonActive
          ]}
        >
          <Text style={[
            styles.categoryButtonText,
            activeCategory === null && styles.categoryButtonTextActive
          ]}>
            All
          </Text>
        </TouchableOpacity>
        
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory((c) => (c === cat ? null : cat))}
            style={[
              styles.categoryButton,
              activeCategory === cat && styles.categoryButtonActive
            ]}
          >
            <Text style={[
              styles.categoryButtonText,
              activeCategory === cat && styles.categoryButtonTextActive
            ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Events List */}
      {loading ? (
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="search-outline" size={48} color="#9CA3AF" />
          <Text style={styles.noEventsText}>No events found</Text>
          <Text style={styles.noEventsSubtext}>
            Try adjusting filters or search for something else
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.eventsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Event Details Modal */}
      <Modal
        visible={!!selectedEvent}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedEvent(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedEvent && (
              <>
                {/* Header Image */}
                <View style={styles.modalHeader}>
                  {selectedEvent.image_url ? (
                    <Image 
                      source={{ uri: selectedEvent.image_url }} 
                      style={styles.modalImage} 
                    />
                  ) : (
                    <View style={[styles.modalImage, styles.modalNoImage]}>
                      <Ionicons name="image-outline" size={40} color="#9CA3AF" />
                      <Text style={styles.modalNoImageText}>No image</Text>
                    </View>
                  )}
                  
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setSelectedEvent(null)}
                  >
                    <Ionicons name="close" size={24} color="#FFF" />
                  </TouchableOpacity>
                  
                  <View style={styles.modalTitleContainer}>
                    <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                  </View>
                </View>

                <ScrollView style={styles.modalBody}>
                  <Text style={styles.modalDescription}>
                    {selectedEvent.description}
                  </Text>

                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Event Details</Text>
                    
                    <View style={styles.detailItem}>
                      <Ionicons name="location-outline" size={20} color="#8B5CF6" />
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Venue</Text>
                        <Text style={styles.detail