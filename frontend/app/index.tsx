import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Dimensions,
  ScrollView,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  type: 'family' | 'friend' | 'medical';
}

export default function EmergencyDashboard() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [emergencyContacts] = useState<EmergencyContact[]>([
    { id: '1', name: 'Emergency Contact 1', phone: '+1-555-0123', type: 'family' },
    { id: '2', name: 'Family Doctor', phone: '+1-555-0456', type: 'medical' }
  ]);

  // Mock location data
  useEffect(() => {
    // Simulate getting location
    setTimeout(() => {
      setLocation({
        latitude: 37.7749,
        longitude: -122.4194,
        address: "San Francisco, CA, USA"
      });
    }, 1000);
  }, []);

  const handleSOSPress = () => {
    Alert.alert(
      'Emergency SOS',
      'This will alert emergency services and your emergency contacts. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'CALL EMERGENCY',
          style: 'destructive',
          onPress: triggerEmergency
        }
      ]
    );
  };

  const triggerEmergency = async () => {
    setIsEmergencyActive(true);
    
    try {
      // Mock emergency call to backend
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/emergency/sos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: location,
          timestamp: new Date().toISOString(),
          user_id: 'mock_user_123',
          emergency_type: 'general'
        }),
      });

      if (response.ok) {
        Alert.alert(
          'Emergency Activated',
          'Emergency services have been notified. Help is on the way!\n\nYour location has been shared with:\n• Emergency Services\n• Your Emergency Contacts',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Emergency call failed:', error);
      Alert.alert('Error', 'Failed to contact emergency services. Please try again.');
    } finally {
      setIsEmergencyActive(false);
    }
  };

  const navigateToService = (service: string) => {
    Alert.alert(
      `${service} Service`,
      `Connecting to ${service}...\n\n${service === 'Ambulance' ? 'Finding nearest available ambulance...' : 'Contacting emergency services...'}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#dc2626" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>EmergiLink</Text>
        <Text style={styles.subtitle}>Emergency Support</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Location Status */}
        <View style={styles.locationCard}>
          <Ionicons name="location" size={24} color="#10b981" />
          <View style={styles.locationText}>
            <Text style={styles.locationTitle}>Current Location</Text>
            <Text style={styles.locationAddress}>
              {location ? location.address : 'Getting location...'}
            </Text>
          </View>
        </View>

        {/* Main SOS Button */}
        <View style={styles.sosContainer}>
          <TouchableOpacity
            style={[styles.sosButton, isEmergencyActive && styles.sosButtonActive]}
            onPress={handleSOSPress}
            disabled={isEmergencyActive}
          >
            <Ionicons 
              name="medical" 
              size={60} 
              color="white" 
            />
            <Text style={styles.sosText}>
              {isEmergencyActive ? 'CALLING...' : 'SOS'}
            </Text>
            <Text style={styles.sosSubtext}>
              {isEmergencyActive ? 'Please wait' : 'Emergency'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Services */}
        <View style={styles.servicesContainer}>
          <Text style={styles.sectionTitle}>Emergency Services</Text>
          
          <View style={styles.servicesRow}>
            <TouchableOpacity
              style={[styles.serviceCard, { backgroundColor: '#dc2626' }]}
              onPress={() => navigateToService('Police')}
            >
              <Ionicons name="shield-checkmark" size={32} color="white" />
              <Text style={styles.serviceText}>Police</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.serviceCard, { backgroundColor: '#ea580c' }]}
              onPress={() => navigateToService('Fire')}
            >
              <Ionicons name="flame" size={32} color="white" />
              <Text style={styles.serviceText}>Fire</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.serviceCard, { backgroundColor: '#2563eb' }]}
              onPress={() => navigateToService('Ambulance')}
            >
              <Ionicons name="medical" size={32} color="white" />
              <Text style={styles.serviceText}>Ambulance</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionsList}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="car" size={24} color="#2563eb" />
              <Text style={styles.actionText}>Book Ambulance</Text>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="business" size={24} color="#059669" />
              <Text style={styles.actionText}>Nearby Hospitals</Text>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="warning" size={24} color="#d97706" />
              <Text style={styles.actionText}>Disaster Alerts</Text>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="people" size={24} color="#7c3aed" />
              <Text style={styles.actionText}>Emergency Contacts</Text>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency Status */}
        {emergencyContacts.length > 0 && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              🔒 {emergencyContacts.length} Emergency contacts configured
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#dc2626',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: '#fee2e2',
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  locationText: {
    marginLeft: 12,
    flex: 1,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  locationAddress: {
    fontSize: 16,
    color: 'white',
    marginTop: 2,
  },
  sosContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  sosButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#dc2626',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  sosButtonActive: {
    backgroundColor: '#991b1b',
  },
  sosText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  sosSubtext: {
    fontSize: 14,
    color: '#fecaca',
    marginTop: 4,
  },
  servicesContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  servicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  serviceCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 4,
    elevation: 3,
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  serviceText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginTop: 8,
  },
  actionsContainer: {
    marginBottom: 30,
  },
  actionsList: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  actionText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 12,
    flex: 1,
  },
  statusContainer: {
    backgroundColor: '#065f46',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  statusText: {
    color: '#ecfdf5',
    fontSize: 14,
    textAlign: 'center',
  },
});