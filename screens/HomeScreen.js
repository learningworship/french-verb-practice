import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { getAllVerbs } from '../utils/storage';

export default function HomeScreen() {
  const [verbs, setVerbs] = useState([]);
  const [loading, setLoading] = useState(true);

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
          <Text style={styles.statLabel}>Total Verbs</Text>
        </View>
        
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {verbs.filter(v => !v.isDefault).length}
          </Text>
          <Text style={styles.statLabel}>Custom Verbs</Text>
        </View>
      </View>

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
});

