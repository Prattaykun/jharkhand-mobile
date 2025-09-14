import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Music, Palette, Book, Theater } from 'lucide-react';
import { useRouter } from 'expo-router';

// These would be your converted native components
import CultureSection from '../../components/culture/CultureSection';
import ArtistShowcase from '../../components/culture/ArtistShowcase';
import TraditionTimeline from '../../components/culture/TraditionTimeline';

const { width } = Dimensions.get('window');

export default function Culture() {
  const router = useRouter();
  
  const culturalAspects = [
    {
      id: "music-dance",
      title: "Music & Dance",
      icon: Music,
      description: "Rich tradition of classical music, folk songs, and dance forms",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80",
      highlights: ["Rabindra Sangeet", "Baul Music", "Classical Dance", "Folk Dance"],
      color: ["#8e44ad", "#e84393"], // Purple to Pink
    },
    {
      id: "literature-poetry",
      title: "Literature & Poetry",
      icon: Book,
      description: "Bengal Renaissance and literary excellence spanning centuries",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
      highlights: ["Rabindranath Tagore", "Bengali Poetry", "Modern Literature", "Cultural Magazines"],
      color: ["#3498db", "#00cec9"], // Blue to Cyan
    },
    {
      id: "traditional-arts",
      title: "Traditional Arts",
      icon: Palette,
      description: "Exquisite handicrafts, paintings, and traditional art forms",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80",
      highlights: ["Terracotta Art", "Pattachitra", "Kantha Embroidery", "Clay Dolls"],
      color: ["#e67e22", "#e74c3c"], // Orange to Red
    },
    {
      id: "theater-cinema",
      title: "Theater & Cinema",
      icon: Theater,
      description: "Vibrant theater tradition and birthplace of Indian cinema",
      image: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=600&q=80",
      highlights: ["Group Theater", "Bengali Cinema", "Street Theater", "Cultural Centers"],
      color: ["#2ecc71", "#009688"], // Green to Teal
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <View style={styles.heroContainer}>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80" }}
          style={styles.heroImage}
        />
        <LinearGradient
          colors={['rgba(78, 52, 146, 0.9)', 'rgba(44, 62, 80, 0.9)']}
          style={StyleSheet.absoluteFill}
        />
        
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>
            Culture & <Text style={styles.accentText}>Arts</Text>
          </Text>
          <Text style={styles.heroDescription}>
            Immerse yourself in the vibrant cultural heritage of West Bengal,
            where art, music, literature, and traditions have flourished for
            centuries
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>500+</Text>
              <Text style={styles.statLabel}>Cultural Events</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>2000+</Text>
              <Text style={styles.statLabel}>Artists</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>15</Text>
              <Text style={styles.statLabel}>Art Forms</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>100+</Text>
              <Text style={styles.statLabel}>Cultural Centers</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Cultural Aspects */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Cultural <Text style={styles.purpleText}>Treasures</Text>
          </Text>
          <Text style={styles.sectionDescription}>
            Explore the diverse cultural elements that make West Bengal a
            center of artistic excellence
          </Text>
        </View>

        <View style={styles.culturalList}>
          {culturalAspects.map((aspect, index) => (
            <CultureSection
              key={aspect.title}
              aspect={aspect}
              index={index}
              isReverse={index % 2 === 1}
            />
          ))}
        </View>
      </View>

      <ArtistShowcase />
      <TraditionTimeline />

      {/* Call to Action */}
      <LinearGradient
        colors={['#8e44ad', '#3498db']}
        style={styles.ctaContainer}
      >
        <Text style={styles.ctaTitle}>Experience Living Culture</Text>
        <Text style={styles.ctaDescription}>
          Join cultural workshops, attend performances, and connect with
          local artists to truly understand Bengali culture
        </Text>
        <TouchableOpacity 
          style={styles.ctaButton}
          onPress={() => router.push("/events")}
        >
          <Text style={styles.ctaButtonText}>Find Cultural Events</Text>
        </TouchableOpacity>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  heroContainer: {
    height: 500,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  accentText: {
    color: '#f1c40f',
  },
  heroDescription: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f1c40f',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  purpleText: {
    color: '#8e44ad',
  },
  sectionDescription: {
    fontSize: 16,
    color: '#7f8c8d',