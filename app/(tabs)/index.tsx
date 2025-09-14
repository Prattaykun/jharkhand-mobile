import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
  SafeAreaView,
  StatusBar
} from "react-native";
import { useRouter } from "expo-router";
import { 
  MapPin, 
  Camera, 
  Heart, 
  ArrowRight, 
  Users, 
  Search, 
  X 
} from "lucide-react-native";

// Mock components to replace the web-only ones
const HeroSection = ({ heroImages, currentImageIndex }) => {
  const fadeAnim = new Animated.Value(1);
  
  useEffect(() => {
    // Animation for image transition
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [currentImageIndex]);

  return (
    <View style={styles.heroContainer}>
      <Animated.Image
        source={{ uri: heroImages[currentImageIndex] }}
        style={[styles.heroImage, { opacity: fadeAnim }]}
      />
      <View style={styles.heroOverlay}>
        <Text style={styles.heroTitle}>Discover West Bengal</Text>
        <Text style={styles.heroSubtitle}>
          Explore the rich heritage and culture
        </Text>
      </View>
    </View>
  );
};

const FeaturedDestinations = () => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>Featured Destinations</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
      {[1, 2, 3].map((item) => (
        <TouchableOpacity key={item} style={styles.destinationCard}>
          <Image 
            source={{ uri: `/media/destination${item}.jpg` }} 
            style={styles.destinationImage}
          />
          <View style={styles.destinationInfo}>
            <Text style={styles.destinationName}>Destination {item}</Text>
            <Text style={styles.destinationDescription}>
              Experience the beauty of this place
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const CulturalHighlights = () => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>Cultural Highlights</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.culturalCard}>
          <Image 
            source={{ uri: `/media/cultural${item}.jpg` }} 
            style={styles.culturalImage}
          />
          <Text style={styles.culturalTitle}>Cultural Event {item}</Text>
          <Text style={styles.culturalDescription}>
            Discover traditional arts and performances
          </Text>
        </View>
      ))}
    </ScrollView>
  </View>
);

const TestimonialSection = () => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>Visitor Experiences</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.testimonialCard}>
          <Text style={styles.testimonialText}>
            "An amazing experience exploring the rich heritage of West Bengal!"
          </Text>
          <Text style={styles.testimonialAuthor}>- Visitor {item}</Text>
        </View>
      ))}
    </ScrollView>
  </View>
);

const BottomNav = () => (
  <View style={styles.bottomNav}>
    {['Home', 'Explore', 'Plan', 'Saved'].map((item) => (
      <TouchableOpacity key={item} style={styles.navItem}>
        <Text style={styles.navText}>{item}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const Menu = () => (
  <View style={styles.menuContainer}>
    <Text style={styles.logo}>West Bengal Explorer</Text>
    <TouchableOpacity>
      <Text style={styles.menuIcon}>☰</Text>
    </TouchableOpacity>
  </View>
);

const Chatbot = () => (
  <View style={styles.chatbotContainer}>
    <Text style={styles.chatbotTitle}>Travel Assistant</Text>
    <TextInput 
      style={styles.chatInput}
      placeholder="Ask me anything about West Bengal..."
    />
  </View>
);

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showChatbot, setShowChatbot] = useState(false);
  const router = useRouter();

  const heroImages = [
    "/media/m.webp",
    "/media/kolkata.jpg",
    "/media/pexels-aditya-chowdhury-1907990508-28938866.jpg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const stats = [
    { icon: MapPin, label: "Heritage Sites", value: "50+" },
    { icon: Camera, label: "Photo Spots", value: "200+" },
    { icon: Heart, label: "Cultural Events", value: "100+" },
    { icon: Users, label: "Happy Visitors", value: "10K+" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() === "") return;
    alert(`Searching for: ${searchQuery}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView style={styles.scrollView}>
        <Menu />
        
        <HeroSection heroImages={heroImages} currentImageIndex={currentImageIndex} />
        
        <View style={styles.searchSection}>
          <Text style={styles.searchTitle}>Find Your Perfect Experience</Text>
          
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search destinations, culture, or heritage..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Search size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.statsSection}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <View style={styles.statIcon}>
                <stat.icon size={24} color="white" />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
        
        <FeaturedDestinations />
        <CulturalHighlights />
        
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to Explore West Bengal?</Text>
          <Text style={styles.ctaText}>
            Discover centuries of rich heritage, vibrant culture, and unforgettable experiences
          </Text>
          
          <TouchableOpacity style={styles.ctaButtonPrimary}>
            <Text style={styles.ctaButtonText}>Plan Your Trip</Text>
            <ArrowRight size={16} color="white" style={styles.buttonIcon} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.ctaButtonSecondary}>
            <Text style={styles.ctaButtonSecondaryText}>Explore Heritage Sites</Text>
            <ArrowRight size={16} color="#6366f1" style={styles.buttonIcon} />
          </TouchableOpacity>
        </View>
        
        <TestimonialSection />
      </ScrollView>
      
      <BottomNav />
      
      {showChatbot && (
        <View style={styles.chatbotModal}>
          <Chatbot />
          <TouchableOpacity 
            style={styles.closeChatbot} 
            onPress={() => setShowChatbot(false)}
          >
            <X size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}
      
      {!showChatbot && (
        <TouchableOpacity 
          style={styles.chatbotButton}
          onPress={() => setShowChatbot(true)}
        >
          <Search size={24} color="white" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  logo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  menuIcon: {
    fontSize: 24,
  },
  heroContainer: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'white',
  },
  searchSection: {
    padding: 20,
    backgroundColor: '#f1f5f9',
  },
  searchTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#1e293b',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#6366f1',
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
  },
  statItem: {
    width: (width - 40) / 2 - 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  sectionContainer: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  horizontalScroll: {
    marginHorizontal: -20,
  },
  destinationCard: {
    width: width * 0.7,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  destinationImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  destinationInfo: {
    padding: 12,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  destinationDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  culturalCard: {
    width: width * 0.6,
    marginRight: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  culturalImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  culturalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    padding: 12,
    paddingBottom: 4,
  },
  culturalDescription: {
    fontSize: 14,
    color: '#64748b',
    padding: 12,
    paddingTop: 4,
  },
  ctaSection: {
    padding: 20,
    backgroundColor: '#6366f1',
    marginTop: 10,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  ctaButtonPrimary: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  ctaButtonText: {
    color: '#6366f1',
    fontWeight: 'bold',
    fontSize: 16,
  },
  ctaButtonSecondary: {
    borderWidth: 2,
    borderColor: 'white',
    padding: 16,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaButtonSecondaryText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  testimonialCard: {
    width: width * 0.8,
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginRight: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  testimonialText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#475569',
    marginBottom: 8,
  },
  testimonialAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  chatbotButton: {
    position: 'absolute',
    bottom: 70,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  chatbotModal: {
    position: 'absolute',
    bottom: 70,
    right: 20,
    width: width * 0.8,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  chatbotContainer: {
    padding: 16,
  },
  chatbotTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  chatInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  closeChatbot: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
});