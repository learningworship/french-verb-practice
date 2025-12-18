import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getPracticeStats } from '../utils/cloudStorage';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalSessions: 0,
    correctSessions: 0,
    accuracy: 0,
    totalVerbs: 0,
    customVerbs: 0,
  });

  // Load stats when screen is focused (every time user navigates here)
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    try {
      const result = await getPracticeStats();
      if (result.success) {
        setStats(result.stats);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading stats:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>🇫🇷 French Verb Practice</Text>
      <Text style={styles.subtitle}>Your progress at a glance</Text>
      
      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats.totalVerbs}</Text>
          <Text style={styles.statLabel}>Total Verbs</Text>
        </View>
        
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats.customVerbs}</Text>
          <Text style={styles.statLabel}>Custom Verbs</Text>
        </View>
        
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stats.totalSessions}</Text>
          <Text style={styles.statLabel}>Practice Sessions</Text>
        </View>
        
        <View style={[styles.statBox, styles.accuracyBox]}>
          <Text style={[styles.statNumber, styles.accuracyNumber]}>
            {stats.accuracy}%
          </Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </View>
      </View>

      {/* Encouragement Message */}
      <View style={styles.messageBox}>
        {stats.totalSessions === 0 ? (
          <>
            <Text style={styles.messageTitle}>👋 Welcome!</Text>
            <Text style={styles.messageText}>
              Start practicing in the Practice tab to build your French skills!
            </Text>
          </>
        ) : stats.accuracy >= 80 ? (
          <>
            <Text style={styles.messageTitle}>🌟 Excellent!</Text>
            <Text style={styles.messageText}>
              Your accuracy is amazing! Keep up the great work!
            </Text>
          </>
        ) : stats.accuracy >= 50 ? (
          <>
            <Text style={styles.messageTitle}>💪 Good Progress!</Text>
            <Text style={styles.messageText}>
              You're doing well! Practice more to improve your accuracy.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.messageTitle}>📚 Keep Learning!</Text>
            <Text style={styles.messageText}>
              Every practice makes you better. Don't give up!
            </Text>
          </>
        )}
      </View>

      {/* Cloud Sync Status */}
      <View style={styles.syncStatus}>
        <Text style={styles.syncIcon}>☁️</Text>
        <Text style={styles.syncText}>Data synced to cloud</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
    width: '100%',
  },
  statBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    margin: 8,
    width: '42%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accuracyBox: {
    backgroundColor: '#e8f5e9',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  accuracyNumber: {
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  messageBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#e3f2fd',
    borderRadius: 20,
    marginTop: 10,
  },
  syncIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  syncText: {
    fontSize: 12,
    color: '#1976D2',
  },
});

