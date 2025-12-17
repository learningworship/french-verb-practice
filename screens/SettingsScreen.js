import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { 
  getApiKey, 
  saveApiKey, 
  getCurrentProvider,
  setCurrentProvider 
} from '../utils/storage';
import { getAvailableProviders } from '../utils/aiService';
import { getUsageStats } from '../utils/costTracking';
import { logout, getCurrentUser } from '../utils/authService';

export default function SettingsScreen() {
  const [apiKey, setApiKey] = useState('');
  const [currentProvider, setCurrentProviderState] = useState('grok');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [usageStats, setUsageStats] = useState(null);
  const [user, setUser] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const provider = await getCurrentProvider();
      const key = await getApiKey(provider);
      const stats = await getUsageStats();
      const currentUser = await getCurrentUser();
      
      setCurrentProviderState(provider);
      setApiKey(key || '');
      setUsageStats(stats);
      setUser(currentUser);
      setLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const performLogout = async () => {
      setLoggingOut(true);
      const result = await logout();
      setLoggingOut(false);
      if (!result.success) {
        Alert.alert('Error', result.error);
      }
      // Navigation handled by auth state listener in App.js
    };

    if (Platform.OS === 'web') {
      // Web: Use browser's confirm dialog
      const confirmed = window.confirm('Are you sure you want to logout?');
      if (confirmed) {
        performLogout();
      }
    } else {
      // iOS/Android: Use native Alert with buttons
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', style: 'destructive', onPress: performLogout }
        ]
      );
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Empty Key', 'Please enter an API key');
      return;
    }

    try {
      setSaving(true);
      await saveApiKey(currentProvider, apiKey.trim());
      setSaving(false);
      
      Alert.alert(
        'Success!',
        'API key saved successfully. You can now use AI feedback in Practice.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving API key:', error);
      setSaving(false);
      Alert.alert('Error', 'Failed to save API key');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>⚙️ Settings</Text>
        
        {/* AI Provider Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Provider</Text>
          <View style={styles.providerCard}>
            <Text style={styles.providerName}>Grok (xAI)</Text>
            <Text style={styles.providerStatus}>● Active</Text>
          </View>
          <Text style={styles.helpText}>
            More providers coming soon...
          </Text>
        </View>

        {/* API Key Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Key</Text>
          <TextInput
            style={styles.input}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="Enter your Grok API key"
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={false}
          />
          <Text style={styles.helpText}>
            Get your API key from: console.x.ai
          </Text>
          
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSaveApiKey}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save API Key</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Usage Statistics Section */}
        {usageStats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Usage & Costs</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Requests</Text>
                <Text style={styles.statValue}>{usageStats.totalRequests}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Cost</Text>
                <Text style={styles.statValue}>${usageStats.totalCost.toFixed(4)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Today</Text>
                <Text style={styles.statValue}>${usageStats.dailyCost.toFixed(4)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>This Week</Text>
                <Text style={styles.statValue}>${usageStats.weeklyCost.toFixed(4)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>This Month</Text>
                <Text style={styles.statValue}>${usageStats.monthlyCost.toFixed(4)}</Text>
              </View>
            </View>
            <Text style={styles.helpText}>
              Budget limits: $1/day, $5/week, $15/month
            </Text>
          </View>
        )}

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>🔒 Privacy</Text>
          <Text style={styles.infoText}>
            Your API key is stored locally on your device and never shared with anyone.
          </Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>💡 Tip</Text>
          <Text style={styles.infoText}>
            After saving your API key, go to the Practice tab to try writing French sentences and get AI feedback!
          </Text>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Account</Text>
          {user && (
            <View style={styles.accountInfo}>
              <Text style={styles.accountEmail}>{user.email}</Text>
              <Text style={styles.accountDetail}>
                Member since: {new Date(user.created_at).toLocaleDateString()}
              </Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.logoutButtonText}>Logout</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  providerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 10,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  providerStatus: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 10,
    color: '#333',
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoSection: {
    padding: 15,
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statItem: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  accountInfo: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  accountEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  accountDetail: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

