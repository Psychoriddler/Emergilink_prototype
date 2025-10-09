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

interface DisasterAlert {
  id: string;
  title: string;
  description: string;
  alert_type: string;
  severity: string;
  location_affected: string;
  active: boolean;
  issued_at: string;
  expires_at: string;
  safety_tips: string[];
}

export default function DisasterAlerts() {
  const [alerts, setAlerts] = useState<DisasterAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveAlerts();
  }, []);

  const fetchActiveAlerts = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/alerts/active`
      );
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      Alert.alert('Error', 'Failed to load alerts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType.toLowerCase()) {
      case 'flood':
        return 'water';
      case 'fire':
        return 'flame';
      case 'earthquake':
        return 'earth';
      case 'cyclone':
      case 'hurricane':
        return 'cloudy-night';
      default:
        return 'warning';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return '#dc2626';
      case 'high':
        return '#ea580c';
      case 'medium':
        return '#d97706';
      case 'low':
        return '#059669';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const showAlertDetails = (alert: DisasterAlert) => {
    Alert.alert(
      alert.title,
      `${alert.description}\n\nLocation: ${alert.location_affected}\nSeverity: ${alert.severity.toUpperCase()}\nExpires: ${formatDate(alert.expires_at)}\n\nSafety Tips:\n${alert.safety_tips.map(tip => `• ${tip}`).join('\n')}`,
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#dc2626" />
          <Text style={styles.loadingText}>Loading disaster alerts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Disaster Alerts</Text>
          <Text style={styles.subtitle}>
            {alerts.length > 0 
              ? `${alerts.length} active alerts in your area`
              : 'No active alerts in your area'
            }
          </Text>
        </View>

        {alerts.length === 0 ? (
          <View style={styles.noAlertsContainer}>
            <Ionicons name="shield-checkmark" size={64} color="#10b981" />
            <Text style={styles.noAlertsTitle}>All Clear</Text>
            <Text style={styles.noAlertsText}>
              No disaster alerts in your area. Stay safe and stay informed.
            </Text>
          </View>
        ) : (
          alerts.map((alert) => (
            <TouchableOpacity
              key={alert.id}
              style={[
                styles.alertCard,
                { borderLeftColor: getSeverityColor(alert.severity) }
              ]}
              onPress={() => showAlertDetails(alert)}
            >
              <View style={styles.alertHeader}>
                <View style={styles.alertIconContainer}>
                  <Ionicons
                    name={getAlertIcon(alert.alert_type)}
                    size={24}
                    color={getSeverityColor(alert.severity)}
                  />
                </View>
                <View style={styles.alertInfo}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertLocation}>{alert.location_affected}</Text>
                </View>
                <View style={[
                  styles.severityBadge,
                  { backgroundColor: getSeverityColor(alert.severity) }
                ]}>
                  <Text style={styles.severityText}>
                    {alert.severity.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.alertDescription} numberOfLines={2}>
                {alert.description}
              </Text>

              <View style={styles.alertMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={16} color="#6b7280" />
                  <Text style={styles.metaText}>
                    Issued: {formatDate(alert.issued_at)}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="hourglass-outline" size={16} color="#6b7280" />
                  <Text style={styles.metaText}>
                    Expires: {formatDate(alert.expires_at)}
                  </Text>
                </View>
              </View>

              <View style={styles.safetyTipsPreview}>
                <Text style={styles.safetyTitle}>Safety Tips:</Text>
                {alert.safety_tips.slice(0, 2).map((tip, index) => (
                  <Text key={index} style={styles.safetyTip}>
                    • {tip}
                  </Text>
                ))}
                {alert.safety_tips.length > 2 && (
                  <Text style={styles.moreTips}>
                    +{alert.safety_tips.length - 2} more tips (tap to view)
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity style={styles.refreshButton} onPress={fetchActiveAlerts}>
          <Ionicons name="refresh" size={20} color="white" />
          <Text style={styles.refreshButtonText}>Refresh Alerts</Text>
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Ionicons name="information-circle" size={24} color="#2563eb" />
          <Text style={styles.infoText}>
            Alerts are updated in real-time. Enable notifications to receive immediate warnings about disasters in your area.
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
  noAlertsContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noAlertsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
    marginTop: 16,
    marginBottom: 8,
  },
  noAlertsText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
  },
  alertCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#334155',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  alertIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  alertLocation: {
    fontSize: 14,
    color: '#94a3b8',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  alertDescription: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
    marginBottom: 12,
  },
  alertMeta: {
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
  },
  safetyTipsPreview: {
    backgroundColor: '#374151',
    padding: 12,
    borderRadius: 8,
  },
  safetyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 6,
  },
  safetyTip: {
    fontSize: 13,
    color: '#d1d5db',
    marginBottom: 2,
  },
  moreTips: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  refreshButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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