import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/utils/supabase/client'; // Adjust import path as needed

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    const checkRole = async () => {
      const role = await AsyncStorage.getItem('role');
      if (!role) {
        router.replace('/auth/role'); // Redirect if role not selected
      }
    };
    checkRole();
  }, [router]);

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignup = async () => {
    try {
      const role = await AsyncStorage.getItem('role');
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { role } },
      });

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      const userId = data?.user?.id;
      if (userId) {
        await supabase.rpc('create_profiles_table_if_not_exists');
        await supabase.from('profiles').insert({
          id: userId,
          full_name: formData.full_name,
          email: formData.email,
          role,
          created_at: new Date().toISOString(),
        });
      }
      
      router.push('/auth/confirmEmail');
    } catch (error) {
      Alert.alert('Error', 'Failed to create account');
    }
  };

  return (
    <LinearGradient
      colors={['#3498db', '#8e44ad', '#2ecc71']}
      style={styles.container}
    >
      {/* Background Blobs */}
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <BlurView intensity={90} tint="light" style={styles.blurContainer}>
            {/* Logo / Title */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Image
                  source={{ uri: '/media/flight.png' }}
                  style={styles.logo}
                />
              </View>
              <Text style={styles.title}>Create Account ✨</Text>
              <Text style={styles.subtitle}>
                Fill in your details to get started
              </Text>
            </View>

            {/* Inputs */}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <User size={20} color="#7f8c8d" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={formData.full_name}
                  onChangeText={(text) => handleInputChange('full_name', text)}
                  placeholderTextColor="#7f8c8d"
                />
              </View>

              <View style={styles.inputContainer}>
                <Mail size={20} color="#7f8c8d" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#7f8c8d"
                />
              </View>

              <View style={styles.inputContainer}>
                <Lock size={20} color="#7f8c8d" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#7f8c8d"
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#7f8c8d" />
                  ) : (
                    <Eye size={20} color="#7f8c8d" />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
                <Text style={styles.buttonText}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {/* Switch to Login */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/auth/login')}>
                <Text style={styles.loginLink}>Log in</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  blob: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.4,
  },
  blob1: {
    top: -80,
    left: -80,
    width: 200,
    height: 200,
    backgroundColor: '#2ecc71',
  },
  blob2: {
    bottom: -80,
    right: -80,
    width: 200,
    height: 200,
    backgroundColor: '#3498db',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  blurContainer: {
    padding: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: 'white',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  formContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    color: '#2c3e50',
  },
  eyeIcon: {
    padding: 5,
  },
  signupButton: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#7f8c8d',
    marginRight: 5,
  },
  loginLink: {
    color: '#3498db',
    fontWeight: '600',
  },
});