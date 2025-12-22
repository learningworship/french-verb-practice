import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getStatistics } from '../utils/statisticsService';

// =====================================================
// COMPONENT: StatCard
// Displays a single statistic in a card
// =====================================================
function StatCard({ label, value, icon = '' }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>
        {icon} {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// =====================================================
// COMPONENT: StatSection
// Groups related stats together
// =====================================================
function StatSection({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.statGrid}>
        {children}
      </View>
    </View>
  );
}

// =====================================================
// COMPONENT: MostPracticedVerbs
// Shows top 5 most practiced verbs
// =====================================================
function MostPracticedVerbs({ verbs }) {
  if (!verbs || verbs.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 Most Practiced Verbs</Text>
        <Text style={styles.emptyText}>No practice data yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🏆 Most Practiced Verbs</Text>
      <View style={styles.verbsList}>
        {verbs.map((item, index) => (
          <View key={index} style={styles.verbItem}>
            <View style={styles.verbRank}>
              <Text style={styles.rankNumber}>{index + 1}</Text>
            </View>
            <View style={styles.verbInfo}>
              <Text style={styles.verbName}>{item.verb}</Text>
              <Text style={styles.verbCount}>{item.count} {item.count === 1 ? 'time' : 'times'}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// =====================================================
// COMPONENT: StreakDisplay
// Shows practice streak information
// =====================================================
function StreakDisplay({ current, best }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🔥 Practice Streak</Text>
      <View style={styles.streakContainer}>
        <View style={styles.streakCard}>
          <Text style={styles.streakValue}>{current}</Text>
          <Text style={styles.streakLabel}>Current Streak</Text>
          <Text style={styles.streakUnit}>days</Text>
        </View>
        <View style={styles.streakCard}>
          <Text style={styles.streakValue}>{best}</Text>
          <Text style={styles.streakLabel}>Best Streak</Text>
          <Text style={styles.streakUnit}>days</Text>
        </View>
      </View>
      {current > 0 && (
        <Text style={styles.streakMessage}>
          🎉 Keep it up! You're on a {current}-day streak!
        </Text>
      )}
      {current === 0 && (
        <Text style={styles.streakMessage}>
          Start practicing to build your streak!
        </Text>
      )}
    </View>
  );
}

// =====================================================
// MAIN COMPONENT: StatisticsScreen
// =====================================================
export default function StatisticsScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load statistics when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadStatistics();
    }, [])
  );

  const loadStatistics = async () => {
    try {
      const result = await getStatistics();
      if (result.success) {
        setStats(result.stats);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading statistics:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStatistics();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load statistics</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Overall Stats */}
      <StatSection title="📊 Overall Statistics">
        <StatCard 
          label="Total Sessions" 
          value={stats.totalSessions}
          icon="📝"
        />
        <StatCard 
          label="Accuracy" 
          value={`${stats.overallAccuracy}%`}
          icon="🎯"
        />
        <StatCard 
          label="Total Verbs" 
          value={stats.totalVerbs}
          icon="📚"
        />
      </StatSection>

      {/* This Week Stats */}
      <StatSection title="📅 This Week">
        <StatCard 
          label="Sessions" 
          value={stats.weekSessions}
          icon="✏️"
        />
        <StatCard 
          label="Accuracy" 
          value={`${stats.weekAccuracy}%`}
          icon="⭐"
        />
        <StatCard 
          label="Days Practiced" 
          value={stats.daysPracticedThisWeek}
          icon="📆"
        />
      </StatSection>

      {/* Practice Streak */}
      <StreakDisplay 
        current={stats.currentStreak}
        best={stats.bestStreak}
      />

      {/* Most Practiced Verbs */}
      <MostPracticedVerbs verbs={stats.mostPracticedVerbs} />
    </ScrollView>
  );
}

// =====================================================
// STYLES
// =====================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 15,
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
  errorText: {
    fontSize: 16,
    color: '#f44336',
  },

  // Section
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },

  // Stat Grid
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '31%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  // Streak
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  streakCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  streakValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 5,
  },
  streakLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  streakUnit: {
    fontSize: 12,
    color: '#999',
  },
  streakMessage: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },

  // Most Practiced Verbs
  verbsList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verbItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  verbRank: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  verbInfo: {
    flex: 1,
  },
  verbName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  verbCount: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
});

