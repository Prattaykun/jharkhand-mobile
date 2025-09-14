import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const openGmail = async () => {
  const gmailUrl = "https://mail.google.com/mail/u/0/#inbox";
  await Linking.openURL(gmailUrl);
};

const ConfirmEmailScreen = () => {
  const handleResendEmail = async () => {
    // Your existing resend email logic here
    Alert.alert('Resend functionality would be implemented here');
  };

  return (
    <LinearGradient
      colors={['#3498db', '#8e44ad', '#2ecc71']}
      style={styles.container}
    >
      {/* Background Blobs */}
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      <View style={styles.card}>
        <BlurView intensity={90} tint="light" style={styles.blurContainer}>
          {/* Icon */}
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: '/media/flight.png' }} // Replace with your logo
              style={styles.logo}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>Confirm Your Email 📩</Text>
          <Text style={styles.description}>
            We've sent a confirmation link to your email address.
            Please check your inbox and click the link to verify your account.
          </Text>

          {/* Open Gmail button */}
          <TouchableOpacity style={styles.primaryButton} onPress={openGmail}>
            <Text style={styles.buttonText}>Open Gmail</Text>
          </TouchableOpacity>

          {/* Resend section */}
          <Text style={styles.resendText}>
            Didn't receive the email? Check your spam folder or try resending.
          </Text>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleResendEmail}>
            <Text style={styles.secondaryButtonText}>Resend Email</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    alignSelf: 'center',
    backgroundColor: 'white',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#2c3e50',
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#34495e',
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  resendText: {
    textAlign: 'center',
    color: '#7f8c8d',
    marginBottom: 12,
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: '#ecf0f1',
    padding: 14,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: '#2c3e50',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default ConfirmEmailScreen;