import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface EmergencyNews {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  location: string;
  published_at: string;
  image_url?: string;
  source: string;
  priority: string;
}

export default function EmergencyNews() {
  const [news, setNews] = useState<EmergencyNews[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmergencyNews();
  }, []);

  const fetchEmergencyNews = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/news?limit=10`
      );
      const data = await response.json();
      setNews(data);
    } catch (error) {
      console.error('Error fetching news:', error);
      Alert.alert('Error', 'Failed to load emergency news. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showNewsDetails = (article: EmergencyNews) => {
    const publishedDate = new Date(article.published_at).toLocaleDateString();
    Alert.alert(
      article.title,
      `${article.content}\n\nLocation: ${article.location}\nPublished: ${publishedDate}\nSource: ${article.source}`,
      [{ text: 'Close' }]
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'emergency_response':
        return 'medical';
      case 'disaster_relief':
        return 'warning';
      case 'safety_update':
        return 'shield-checkmark';
      case 'community_alert':
        return 'people';
      default:
        return 'information-circle';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#dc2626';
      case 'high':
        return '#ea580c';
      case 'normal':
        return '#2563eb';
      case 'low':
        return '#059669';
      default:
        return '#6b7280';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
          <Text style={styles.loadingText}>Loading emergency news...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Emergency News</Text>
          <Text style={styles.subtitle}>
            Latest updates on emergency response and safety
          </Text>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={fetchEmergencyNews}>
          <Ionicons name="refresh" size={20} color="white" />
          <Text style={styles.refreshButtonText}>Refresh News</Text>
        </TouchableOpacity>

        {news.map((article) => (
          <TouchableOpacity
            key={article.id}
            style={styles.newsCard}
            onPress={() => showNewsDetails(article)}
          >
            {article.image_url && (
              <Image 
                source={{ uri: article.image_url }} 
                style={styles.newsImage}
                resizeMode="cover"
              />
            )}
            
            <View style={styles.newsContent}>
              <View style={styles.newsHeader}>
                <View style={styles.categoryContainer}>
                  <Ionicons
                    name={getCategoryIcon(article.category)}
                    size={16}
                    color={getPriorityColor(article.priority)}
                  />
                  <Text style={[
                    styles.categoryText,
                    { color: getPriorityColor(article.priority) }
                  ]}>
                    {article.category.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
                
                <View style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityColor(article.priority) }
                ]}>
                  <Text style={styles.priorityText}>
                    {article.priority.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.newsTitle} numberOfLines={2}>
                {article.title}
              </Text>
              
              <Text style={styles.newsSummary} numberOfLines={3}>
                {article.summary}
              </Text>

              <View style={styles.newsMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={14} color="#6b7280" />
                  <Text style={styles.metaText}>{article.location}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color="#6b7280" />
                  <Text style={styles.metaText}>
                    {formatTimeAgo(article.published_at)}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="newspaper-outline" size={14} color="#6b7280" />
                  <Text style={styles.metaText}>{article.source}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.infoContainer}>
          <Ionicons name="information-circle" size={24} color="#2563eb" />
          <Text style={styles.infoText}>
            Stay informed about emergency situations and safety updates in your area. Tap on any article to read the full details.
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
  refreshButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  newsCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  newsImage: {
    width: '100%',
    height: 160,
  },
  newsContent: {
    padding: 16,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
    lineHeight: 24,
  },
  newsSummary: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
    marginBottom: 12,
  },
  newsMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#2563eb',
    flex: 1,
    lineHeight: 20,
  },
});