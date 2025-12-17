import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { getAllVerbs } from '../utils/storage';
import { testSupabaseConnection } from '../utils/supabaseTest';

export default function HomeScreen() {
  const [verbs, setVerbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [supabaseStatus, setSupabaseStatus] = useState(null); // null, 'testing', 'success', 'error'
  const [cloudVerbCount, setCloudVerbCount] = useState(0);

  // Load verbs when screen mounts
  useEffect(() => {
    loadVerbs();
  }, []);

  const loadVerbs = async () => {
    try {
      const allVerbs = await getAllVerbs();
      setVerbs(allVerbs);
      setLoading(false);
    } catch (error) {
      console.error('Error loading verbs:', error);
      setLoading(false);
    }
  };

  // Test Supabase connection
  const handleTestSupabase = async () => {
    setSupabaseStatus('testing');
    try {
      const result = await testSupabaseConnection();
      if (result.success) {
        setSupabaseStatus('success');
        setCloudVerbCount(result.verbCount);
        Alert.alert(
          '✅ Connection Successful!',
          `Connected to Supabase!\nFound ${result.verbCount} verbs in cloud database.`,
          [{ text: 'Great!' }]
        );
      } else {
        setSupabaseStatus('error');
        Alert.alert('❌ Connection Failed', result.error);
      }
    } catch (error) {
      setSupabaseStatus('error');
      Alert.alert('❌ Error', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏠 Home</Text>
      <Text style={styles.subtitle}>Welcome to French Verb Practice!</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{verbs.length}</Text>
          <Text style={styles.statLabel}>Local Verbs</Text>
        </View>
        
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {supabaseStatus === 'success' ? cloudVerbCount : '?'}
          </Text>
          <Text style={styles.statLabel}>Cloud Verbs</Text>
        </View>
      </View>

      {/* Supabase Test Button */}
      <TouchableOpacity 
        style={[
          styles.testButton,
          supabaseStatus === 'success' && styles.testButtonSuccess,
          supabaseStatus === 'error' && styles.testButtonError,
        ]}
        onPress={handleTestSupabase}
        disabled={supabaseStatus === 'testing'}
      >
        {supabaseStatus === 'testing' ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.testButtonText}>
            {supabaseStatus === 'success' 
              ? '✅ Connected to Supabase' 
              : supabaseStatus === 'error'
              ? '❌ Retry Connection'
              : '🔌 Test Supabase Connection'}
          </Text>
        )}
      </TouchableOpacity>

      <Text style={styles.description}>
        Ready to practice? Go to the Practice tab to start!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    color: '#333',
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  statBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginHorizontal: 10,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  testButton: {
    backgroundColor: '#9C27B0',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
    minWidth: 250,
    alignItems: 'center',
  },
  testButtonSuccess: {
    backgroundColor: '#4CAF50',
  },
  testButtonError: {
    backgroundColor: '#f44336',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

