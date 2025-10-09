import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface Ambulance {
  id: string;
  name: string;
  type: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  phone: string;
  rating: number;
  estimated_arrival: number;
  cost?: number;
  availability: boolean;
}

export default function AmbulanceBooking() {
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchNearbyAmbulances();
  }, []);

  const fetchNearbyAmbulances = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/ambulances/nearby?lat=37.7749&lng=-122.4194`
      );
      const data = await response.json();
      setAmbulances(data);
    } catch (error) {
      console.error('Error fetching ambulances:', error);
      Alert.alert('Error', 'Failed to load ambulances. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const bookAmbulance = async (ambulance: Ambulance) => {
    Alert.alert(
      'Book Ambulance',
      `Book ${ambulance.name}?\n\nEstimated arrival: ${ambulance.estimated_arrival} minutes\n${ambulance.cost ? `Cost: $${ambulance.cost}` : 'Free service'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Book Now',
          style: 'destructive',
          onPress: () => confirmBooking(ambulance)
        }
      ]
    );
  };

  const confirmBooking = async (ambulance: Ambulance) => {
    setBookingLoading(ambulance.id);
    
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/ambulances/book?ambulance_id=${ambulance.id}&user_id=emergency_user_123`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            latitude: 37.7749,
            longitude: -122.4194,
            address: "Current Location, San Francisco, CA"
          }),
        }
      );

      if (response.ok) {
        const booking = await response.json();
        Alert.alert(
          'Booking Confirmed! 🚑',
          `${ambulance.name} is on the way!\n\nBooking ID: ${booking.booking_id}\nEstimated arrival: ${booking.estimated_arrival}\n\nThe ambulance team will contact you shortly.`,
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
      } else {
        throw new Error('Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Booking Failed', 'Unable to book ambulance. Please try again or call emergency services.');
    } finally {
      setBookingLoading(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
          <Text style={styles.loadingText}>Finding nearby ambulances...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Available Ambulances</Text>
          <Text style={styles.subtitle}>Choose the best option for your emergency</Text>
        </View>

        {ambulances.map((ambulance) => (
          <View key={ambulance.id} style={styles.ambulanceCard}>
            <View style={styles.cardHeader}>
              <View style={styles.ambulanceInfo}>
                <Text style={styles.ambulanceName}>{ambulance.name}</Text>
                <View style={styles.typeContainer}>
                  <Text style={[
                    styles.typeTag,
                    { backgroundColor: ambulance.type === 'public' ? '#059669' : '#7c3aed' }
                  ]}>
                    {ambulance.type.toUpperCase()}
                  </Text>
                  {ambulance.cost && (
                    <Text style={styles.costText}>${ambulance.cost}</Text>
                  )}
                </View>
              </View>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#fbbf24" />
                <Text style={styles.rating}>{ambulance.rating}</Text>
              </View>
            </View>

            <View style={styles.details}>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={20} color="#6b7280" />
                <Text style={styles.detailText}>
                  {ambulance.estimated_arrival} min arrival
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={20} color="#6b7280" />
                <Text style={styles.detailText} numberOfLines={1}>
                  {ambulance.location.address}
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Ionicons name="call-outline" size={20} color="#6b7280" />
                <Text style={styles.detailText}>{ambulance.phone}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.bookButton,
                bookingLoading === ambulance.id && styles.bookButtonDisabled
              ]}
              onPress={() => bookAmbulance(ambulance)}
              disabled={bookingLoading === ambulance.id}
            >
              {bookingLoading === ambulance.id ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="medical" size={20} color="white" />
                  <Text style={styles.bookButtonText}>Book Ambulance</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.emergencyNote}>
          <Ionicons name="information-circle" size={24} color="#dc2626" />
          <Text style={styles.noteText}>
            For life-threatening emergencies, call 911 immediately. This service is for non-critical medical transport.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
  ambulanceCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ambulanceInfo: {
    flex: 1,
  },
  ambulanceName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 6,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  costText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  details: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#94a3b8',
    flex: 1,
  },
  bookButton: {
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  bookButtonDisabled: {
    backgroundColor: '#991b1b',
    opacity: 0.7,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emergencyNote: {
    flexDirection: 'row',
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  noteText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#dc2626',
    flex: 1,
  },
});