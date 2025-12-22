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
  Platform,
  Linking,
  Modal
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
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [legalContent, setLegalContent] = useState({ title: '', content: '' });

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

  const showPrivacyPolicy = () => {
    const content = `Privacy Policy for French Verb Practice

Last Updated: December 18, 2025

INTRODUCTION
French Verb Practice ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.

INFORMATION WE COLLECT

Information You Provide:
• Account Information: Email address, display name (when you register)
• Practice Data: Your practice sessions, sentences, and learning progress
• Settings: Your preferences, API keys (stored locally and encrypted)

Automatically Collected Information:
• Usage Data: Practice statistics, session timestamps
• Device Information: Device type, operating system version (for app functionality)

HOW WE USE YOUR INFORMATION
We use the information we collect to:
• Provide and maintain our service
• Process your practice sessions and track your progress
• Send you important updates about the app
• Improve our services and user experience
• Ensure security and prevent fraud

DATA STORAGE AND SECURITY
• Cloud Storage: Your data is stored securely in Supabase (PostgreSQL database)
• Encryption: All data is encrypted in transit (HTTPS) and at rest
• Authentication: We use Supabase Auth for secure user authentication
• API Keys: Your AI provider API keys are stored locally on your device and encrypted

THIRD-PARTY SERVICES
We use the following third-party services:
• Supabase: Backend-as-a-Service for database and authentication
• AI Providers (Grok/xAI): For sentence correction (only if you provide your own API key)
  - Your API key is stored locally and never shared with us
  - AI requests are made directly from your device to the AI provider

DATA SHARING
We do NOT sell, trade, or rent your personal information to third parties. We may share data only:
• With your explicit consent
• To comply with legal obligations
• To protect our rights and safety

YOUR RIGHTS
You have the right to:
• Access your personal data
• Correct inaccurate data
• Delete your account and data
• Export your data
• Opt-out of data collection (by not using the app)

DATA RETENTION
We retain your data for as long as your account is active or as needed to provide services. You can delete your account at any time, which will remove all your data.

CHILDREN'S PRIVACY
Our app is not intended for children under 13. We do not knowingly collect data from children under 13.

CHANGES TO THIS POLICY
We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy in the app and updating the "Last Updated" date.

COMPLIANCE
This app complies with:
• GDPR (General Data Protection Regulation) - EU users
• CCPA (California Consumer Privacy Act) - California users
• COPPA (Children's Online Privacy Protection Act) - US users

Note: This is a template. Please review and customize it according to your specific needs and consult with a legal professional if necessary.`;

    setLegalContent({ title: 'Privacy Policy', content });
    setLegalModalVisible(true);
  };

  const showTermsOfService = () => {
    const content = `Terms of Service for French Verb Practice

Last Updated: December 18, 2025

AGREEMENT TO TERMS
By downloading, installing, or using French Verb Practice ("the App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the App.

DESCRIPTION OF SERVICE
French Verb Practice is a mobile application that helps users practice French verb conjugation through sentence creation and AI-powered feedback.

USER ACCOUNTS
• You must provide accurate and complete information when creating an account
• You are responsible for maintaining the security of your account
• You are responsible for all activities that occur under your account
• You must notify us immediately of any unauthorized use of your account

ACCEPTABLE USE
You agree NOT to:
• Use the App for any illegal purpose
• Attempt to gain unauthorized access to the App or its systems
• Interfere with or disrupt the App's operation
• Use automated systems to access the App
• Share your account with others
• Use the App to create harmful or offensive content

AI SERVICES
• The App uses third-party AI services (Grok/xAI) for sentence correction
• You must provide your own API key for AI services
• You are responsible for any costs associated with your AI API usage
• We are not responsible for the accuracy of AI-generated feedback
• AI services are subject to their own terms of service

INTELLECTUAL PROPERTY
• The App and its content are owned by us and protected by copyright laws
• You may not copy, modify, or distribute the App without permission
• User-generated content (sentences, practice data) remains your property
• You grant us a license to use your data to provide the service

LIMITATION OF LIABILITY
• The App is provided "as is" without warranties
• We are not liable for any damages arising from use of the App
• We do not guarantee the accuracy of AI feedback
• We are not responsible for third-party service outages

SERVICE MODIFICATIONS
We reserve the right to:
• Modify or discontinue the App at any time
• Update features and functionality
• Change pricing (if applicable)
• Suspend or terminate accounts that violate these Terms

TERMINATION
We may terminate or suspend your account immediately if you violate these Terms. You may also delete your account at any time.

GOVERNING LAW
These Terms are governed by applicable laws. Any disputes will be resolved in the appropriate courts.

CHANGES TO TERMS
We may update these Terms from time to time. Continued use of the App after changes constitutes acceptance of the new Terms.

Note: This is a template. Please review and customize it according to your specific needs and consult with a legal professional if necessary.`;

    setLegalContent({ title: 'Terms of Service', content });
    setLegalModalVisible(true);
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

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📜 Legal</Text>
          <TouchableOpacity 
            style={styles.legalButton}
            onPress={showPrivacyPolicy}
          >
            <Text style={styles.legalButtonText}>Privacy Policy</Text>
            <Text style={styles.legalButtonArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.legalButton}
            onPress={showTermsOfService}
          >
            <Text style={styles.legalButtonText}>Terms of Service</Text>
            <Text style={styles.legalButtonArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Legal Document Modal */}
      <Modal
        visible={legalModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setLegalModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{legalContent.title}</Text>
              <TouchableOpacity 
                onPress={() => setLegalModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.modalBody}>
              <Text style={styles.legalContentText}>{legalContent.content}</Text>
            </ScrollView>

            {/* Close Button */}
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setLegalModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  legalButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  legalButtonText: {
    fontSize: 16,
    color: '#333',
  },
  legalButtonArrow: {
    fontSize: 16,
    color: '#2196F3',
  },
  // Legal Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  modalBody: {
    padding: 20,
    maxHeight: '70%',
  },
  legalContentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  modalCloseButton: {
    backgroundColor: '#2196F3',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

