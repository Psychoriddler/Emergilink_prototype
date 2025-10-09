import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  specialties: string[];
  emergency_services: boolean;
  rating: number;
  distance_km?: number;
}

export default function NearbyHospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNearbyHospitals();
  }, []);

  const fetchNearbyHospitals = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/hospitals/nearby?lat=37.7749&lng=-122.4194`
      );
      const data = await response.json();
      setHospitals(data);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      Alert.alert('Error', 'Failed to load hospitals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const callHospital = (phone: string, name: string) => {
    Alert.alert(
      'Call Hospital',
      `Call ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => Linking.openURL(`tel:${phone}`)
        }
      ]
    );
  };

  const getDirections = (hospital: Hospital) => {
    Alert.alert(
      'Get Directions',
      `Open directions to ${hospital.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Maps',
          onPress: () => {
            const url = `https://maps.google.com?q=${encodeURIComponent(hospital.address)}`;
            Linking.openURL(url);
          }
        }
      ]
    );
  };

  const viewHospitalDetails = async (hospital: Hospital) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/hospitals/${hospital.id}`
      );
      const details = await response.json();
      
      Alert.alert(
        hospital.name,
        `Emergency Contact: ${details.emergency_contact}\n\nDepartments: ${details.departments.join(', ')}\n\nCurrent Wait Time: ${details.current_wait_time}\nBed Availability: ${details.bed_availability}\nInsurance: ${details.accepts_insurance ? 'Accepted' : 'Not confirmed'}`,
        [
          { text: 'Call', onPress: () => callHospital(hospital.phone, hospital.name) },
          { text: 'Directions', onPress: () => getDirections(hospital) },
          { text: 'Close', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('Error fetching hospital details:', error);
      Alert.alert('Error', 'Failed to load hospital details.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
          <Text style={styles.loadingText}>Finding nearby hospitals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Nearby Hospitals</Text>
          <Text style={styles.subtitle}>Closest medical facilities with emergency services</Text>
        </View>

        {hospitals.map((hospital) => (
          <TouchableOpacity
            key={hospital.id}
            style={styles.hospitalCard}
            onPress={() => viewHospitalDetails(hospital)}
          >
            <View style={styles.cardHeader}>
              <View style={styles.hospitalInfo}>
                <Text style={styles.hospitalName}>{hospital.name}</Text>
                <View style={styles.ratingDistance}>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#fbbf24" />
                    <Text style={styles.rating}>{hospital.rating}</Text>
                  </View>
                  {hospital.distance_km && (
                    <Text style={styles.distance}>{hospital.distance_km} km away</Text>
                  )}
                </View>
              </View>
              
              {hospital.emergency_services && (
                <View style={styles.emergencyBadge}>
                  <Ionicons name="medical" size={16} color="white" />
                  <Text style={styles.emergencyText}>24/7</Text>
                </View>
              )}
            </View>

            <Text style={styles.address} numberOfLines={2}>
              {hospital.address}
            </Text>

            <View style={styles.specialtiesContainer}>
              <Text style={styles.specialtiesTitle}>Specialties:</Text>
              <View style={styles.specialtiesList}>
                {hospital.specialties.slice(0, 3).map((specialty, index) => (
                  <View key={index} style={styles.specialtyTag}>
                    <Text style={styles.specialtyText}>{specialty}</Text>
                  </View>
                ))}
                {hospital.specialties.length > 3 && (
                  <Text style={styles.moreSpecialties}>
                    +{hospital.specialties.length - 3} more
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.callButton]}
                onPress={() => callHospital(hospital.phone, hospital.name)}
              >
                <Ionicons name="call" size={18} color="white" />
                <Text style={styles.actionButtonText}>Call</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.directionsButton]}
                onPress={() => getDirections(hospital)}
              >
                <Ionicons name="navigate" size={18} color="white" />
                <Text style={styles.actionButtonText}>Directions</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.emergencyNote}>
          <Ionicons name="information-circle" size={24} color="#dc2626" />
          <Text style={styles.noteText}>
            In case of severe emergency, call 911 for immediate ambulance dispatch to the nearest appropriate facility.
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
  hospitalCard: {
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
    marginBottom: 8,
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  ratingDistance: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  distance: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
  emergencyBadge: {
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  emergencyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  address: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 12,
    lineHeight: 20,
  },
  specialtiesContainer: {
    marginBottom: 16,
  },
  specialtiesTitle: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
    marginBottom: 6,
  },
  specialtiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  specialtyTag: {
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  specialtyText: {
    fontSize: 12,
    color: '#d1d5db',
  },
  moreSpecialties: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  callButton: {
    backgroundColor: '#059669',
  },
  directionsButton: {
    backgroundColor: '#2563eb',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
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