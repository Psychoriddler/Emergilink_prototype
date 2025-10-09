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
  StatusBar,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

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

interface RecentNews {
  id: string;
  title: string;
  category: string;
  priority: string;
  published_at: string;
}

const backgroundImages = [
  'https://images.unsplash.com/photo-1554734867-bf3c00a49371',
  'https://images.unsplash.com/photo-1599152097274-5da4c5979b9b',
  'https://images.unsplash.com/photo-1619025873875-59dfdd2bbbd6'
];

export default function EmergencyDashboard() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [recentNews, setRecentNews] = useState<RecentNews[]>([]);
  const [backgroundIndex, setBackgroundIndex] = useState(0);
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

    // Fetch recent news
    fetchRecentNews();

    // Change background image every 10 seconds
    const backgroundInterval = setInterval(() => {
      setBackgroundIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 10000);

    return () => clearInterval(backgroundInterval);
  }, []);

  const fetchRecentNews = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/news?limit=3`);
      const data = await response.json();
      setRecentNews(data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#dc2626';
      case 'high':
        return '#ea580c';
      default:
        return '#2563eb';
    }
  };

  return (
    <ImageBackground
      source={{ uri: backgroundImages[backgroundIndex] }}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
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

            {/* Recent Emergency News */}
            {recentNews.length > 0 && (
              <View style={styles.newsContainer}>
                <View style={styles.newsHeader}>
                  <Text style={styles.sectionTitle}>Emergency News</Text>
                  <TouchableOpacity onPress={() => router.push('/news')}>
                    <Text style={styles.viewAllText}>View All</Text>
                  </TouchableOpacity>
                </View>
                
                {recentNews.map((article) => (
                  <TouchableOpacity
                    key={article.id}
                    style={styles.newsItem}
                    onPress={() => router.push('/news')}
                  >
                    <View style={styles.newsContent}>
                      <Text style={styles.newsTitle} numberOfLines={2}>
                        {article.title}
                      </Text>
                      <View style={styles.newsMetaRow}>
                        <View style={[
                          styles.newsPriority,
                          { backgroundColor: getPriorityColor(article.priority) }
                        ]}>
                          <Text style={styles.newsPriorityText}>
                            {article.priority.toUpperCase()}
                          </Text>
                        </View>
                        <Text style={styles.newsTime}>
                          {formatTimeAgo(article.published_at)}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Quick Actions */}
            <View style={styles.actionsContainer}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              
              <View style={styles.actionsList}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => router.push('/ambulance')}
                >
                  <Ionicons name="car" size={24} color="#2563eb" />
                  <Text style={styles.actionText}>Book Ambulance</Text>
                  <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => router.push('/hospitals')}
                >
                  <Ionicons name="business" size={24} color="#059669" />
                  <Text style={styles.actionText}>Nearby Hospitals</Text>
                  <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => router.push('/alerts')}
                >
                  <Ionicons name="warning" size={24} color="#d97706" />
                  <Text style={styles.actionText}>Disaster Alerts</Text>
                  <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => router.push('/contacts')}
                >
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
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Dark overlay for readability
  },
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
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
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.8)',
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
  newsContainer: {
    marginBottom: 30,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  newsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.8)',
  },
  newsContent: {
    flex: 1,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
    lineHeight: 18,
  },
  newsMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newsPriority: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  newsPriorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  newsTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  actionsContainer: {
    marginBottom: 30,
  },
  actionsList: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.8)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.8)',
  },
  actionText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 12,
    flex: 1,
  },
  statusContainer: {
    backgroundColor: 'rgba(6, 95, 70, 0.9)',
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