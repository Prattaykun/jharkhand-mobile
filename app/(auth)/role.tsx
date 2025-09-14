import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RolePage() {
  const router = useRouter();

  const handleSelect = async (role: string) => {
    try {
      // Store role in AsyncStorage (equivalent to localStorage)
      await AsyncStorage.setItem('role', role);
      
      // Note: Cookies aren't typically used in React Native
      // You might want to use a different approach for session management
      
      router.push('/auth/signup');
    } catch (error) {
      Alert.alert('Error', 'Failed to save role selection');
    }
  };

  return (
    <View style={styles.container}>
      {/* Consumer Half */}
      <TouchableOpacity 
        style={[styles.halfContainer, styles.consumerContainer]}
        onPress={() => handleSelect('consumer')}
      >
        <ImageBackground
          source={{ uri: 'https://placehold.co/600x400/3498db/white?text=Consumer' }}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            <Text style={styles.text}>Consumer</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>

      {/* Business Half */}
      <TouchableOpacity 
        style={[styles.halfContainer, styles.businessContainer]}
        onPress={() => handleSelect('business')}
      >
        <ImageBackground
          source={{ uri: 'https://placehold.co/600x400/8e44ad/white?text=Business' }}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay}>
            <Text style={styles.text}>Business</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  halfContainer: {
    flex: 1,
    height: '100%',
  },
  consumerContainer: {
    backgroundColor: '#3498db', // Blue
  },
  businessContainer: {
    backgroundColor: '#8e44ad', // Purple
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
});