import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getPracticeHistory } from '../utils/cloudStorage';
import { groupByDate, formatSessionDate, getGroupLabel } from '../utils/dateHelpers';
import { getTenseById } from '../data/tenses';

// =====================================================
// COMPONENT: HistoryItem
// Displays a single practice session in the list
// =====================================================
function HistoryItem({ session, onPress }) {
  // Get tense display name
  const tense = getTenseById(session.tense);
  const tenseName = tense ? tense.name : session.tense;

  return (
    <TouchableOpacity 
      style={styles.historyItem}
      onPress={() => onPress(session)}
      activeOpacity={0.7}
    >
      {/* Status Icon & Verb */}
      <View style={styles.itemHeader}>
        <Text style={styles.statusIcon}>
          {session.is_correct ? '✅' : '❌'}
        </Text>
        <Text style={styles.verbText}>{session.verb_text}</Text>
        <Text style={styles.tenseText}>({tenseName})</Text>
      </View>

      {/* User's Sentence */}
      <Text style={styles.sentenceText} numberOfLines={2}>
        "{session.user_sentence}"
      </Text>

      {/* Time & Tap Hint */}
      <View style={styles.itemFooter}>
        <Text style={styles.timeText}>
          {formatSessionDate(session.created_at)}
        </Text>
        <Text style={styles.tapHint}>Tap for details →</Text>
      </View>
    </TouchableOpacity>
  );
}

// =====================================================
// COMPONENT: HistoryGroup
// Displays a group of sessions with a date header
// =====================================================
function HistoryGroup({ groupKey, sessions, onItemPress }) {
  // Don't render empty groups
  if (sessions.length === 0) return null;

  return (
    <View style={styles.historyGroup}>
      {/* Date Header */}
      <Text style={styles.groupHeader}>
        {getGroupLabel(groupKey, sessions)}
      </Text>

      {/* List of Sessions */}
      {sessions.map((session) => (
        <HistoryItem 
          key={session.id} 
          session={session} 
          onPress={onItemPress}
        />
      ))}
    </View>
  );
}

// =====================================================
// COMPONENT: FeedbackModal
// Shows detailed AI feedback when user taps a session
// =====================================================
function FeedbackModal({ visible, session, onClose }) {
  if (!session) return null;

  const feedback = session.ai_feedback || {};
  const tense = getTenseById(session.tense);
  const tenseName = tense ? tense.name : session.tense;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {session.is_correct ? '✅ Correct!' : '❌ Needs Work'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Verb & Tense */}
            <View style={styles.feedbackSection}>
              <Text style={styles.sectionTitle}>📚 Task</Text>
              <Text style={styles.sectionText}>
                Verb: <Text style={styles.highlight}>{session.verb_text}</Text>
              </Text>
              <Text style={styles.sectionText}>
                Tense: <Text style={styles.highlight}>{tenseName}</Text>
              </Text>
            </View>

            {/* User's Sentence */}
            <View style={styles.feedbackSection}>
              <Text style={styles.sectionTitle}>✏️ Your Sentence</Text>
              <Text style={styles.userSentence}>"{session.user_sentence}"</Text>
            </View>

            {/* AI Feedback */}
            {feedback.verbAnalysis && (
              <View style={styles.feedbackSection}>
                <Text style={styles.sectionTitle}>🔍 Verb Analysis</Text>
                <Text style={styles.sectionText}>
                  {feedback.verbAnalysis.correct 
                    ? `✓ Correctly used "${feedback.verbAnalysis.verbUsed}"`
                    : `✗ Expected "${feedback.verbAnalysis.expectedVerb}" but found "${feedback.verbAnalysis.verbUsed}"`
                  }
                </Text>
                {feedback.verbAnalysis.conjugationCorrect !== undefined && (
                  <Text style={styles.sectionText}>
                    {feedback.verbAnalysis.conjugationCorrect 
                      ? '✓ Conjugation is correct'
                      : '✗ Conjugation needs work'
                    }
                  </Text>
                )}
              </View>
            )}

            {/* Grammar Issues */}
            {feedback.grammarIssues && feedback.grammarIssues.length > 0 && (
              <View style={styles.feedbackSection}>
                <Text style={styles.sectionTitle}>📝 Grammar Notes</Text>
                {feedback.grammarIssues.map((issue, index) => (
                  <View key={index} style={styles.issueItem}>
                    <Text style={styles.issueText}>• {issue.issue}</Text>
                    {issue.suggestion && (
                      <Text style={styles.suggestionText}>
                        💡 {issue.suggestion}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Alternative Phrasings */}
            {feedback.alternativePhrasings && feedback.alternativePhrasings.length > 0 && (
              <View style={styles.feedbackSection}>
                <Text style={styles.sectionTitle}>💬 Alternative Ways to Say It</Text>
                {feedback.alternativePhrasings.map((alt, index) => (
                  <Text key={index} style={styles.alternativeText}>
                    • "{alt}"
                  </Text>
                ))}
              </View>
            )}

            {/* Encouragement */}
            {feedback.encouragement && (
              <View style={[styles.feedbackSection, styles.encouragementSection]}>
                <Text style={styles.encouragementText}>
                  {feedback.encouragement}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Close Button */}
          <TouchableOpacity 
            style={styles.modalCloseButton}
            onPress={onClose}
          >
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// =====================================================
// MAIN COMPONENT: HistoryScreen
// The page that shows practice history
// =====================================================
export default function HistoryScreen() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Load history when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    try {
      const result = await getPracticeHistory(50);  // Get last 50 sessions
      if (result.success) {
        setSessions(result.sessions);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading history:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleItemPress = (session) => {
    setSelectedSession(session);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedSession(null);
  };

  // Group sessions by date
  const groupedSessions = groupByDate(sessions);

  // Loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  // Empty state
  if (sessions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyIcon}>📭</Text>
        <Text style={styles.emptyTitle}>No Practice History</Text>
        <Text style={styles.emptyText}>
          Complete some practice sessions to see your history here!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            📊 {sessions.length} practice sessions
          </Text>
        </View>

        {/* Grouped History */}
        <HistoryGroup 
          groupKey="Today"
          sessions={groupedSessions.Today}
          onItemPress={handleItemPress}
        />
        <HistoryGroup 
          groupKey="Yesterday"
          sessions={groupedSessions.Yesterday}
          onItemPress={handleItemPress}
        />
        <HistoryGroup 
          groupKey="Older"
          sessions={groupedSessions.Older}
          onItemPress={handleItemPress}
        />
      </ScrollView>

      {/* Detail Modal */}
      <FeedbackModal
        visible={modalVisible}
        session={selectedSession}
        onClose={handleCloseModal}
      />
    </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },

  // Empty State
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  // Summary
  summary: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  summaryText: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
  },

  // History Group
  historyGroup: {
    marginBottom: 20,
  },
  groupHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
    marginLeft: 5,
  },

  // History Item
  historyItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  verbText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  tenseText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  sentenceText: {
    fontSize: 15,
    color: '#555',
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 22,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  tapHint: {
    fontSize: 12,
    color: '#2196F3',
  },

  // Modal
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
  },
  feedbackSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 15,
    color: '#555',
    marginBottom: 4,
    lineHeight: 22,
  },
  highlight: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  userSentence: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  issueItem: {
    marginBottom: 10,
  },
  issueText: {
    fontSize: 15,
    color: '#555',
  },
  suggestionText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 15,
    marginTop: 4,
  },
  alternativeText: {
    fontSize: 15,
    color: '#555',
    marginBottom: 5,
    fontStyle: 'italic',
  },
  encouragementSection: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 10,
  },
  encouragementText: {
    fontSize: 16,
    color: '#2e7d32',
    textAlign: 'center',
    fontWeight: '500',
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

