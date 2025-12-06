import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { getRandomVerb, incrementPracticeCount } from '../utils/storage';
import { getRandomTense } from '../data/tenses';
import * as aiService from '../utils/aiService';
import { rateLimiter } from '../utils/rateLimiter';
import { checkBudget, getBudgetLimits } from '../utils/costTracking';

export default function PracticeScreen() {
  // State management
  const [currentVerb, setCurrentVerb] = useState(null);
  const [currentTense, setCurrentTense] = useState(null);
  const [userSentence, setUserSentence] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null); // Store AI response

  // Load a new practice question when screen mounts
  useEffect(() => {
    loadNewQuestion();
  }, []);

  /**
   * Load a random verb and tense for practice
   */
  const loadNewQuestion = async () => {
    try {
      setLoading(true);
      
      // Get random verb and tense
      const verb = await getRandomVerb();
      const tense = getRandomTense();
      
      if (!verb) {
        Alert.alert('No Verbs', 'Please add some verbs first!');
        return;
      }
      
      setCurrentVerb(verb);
      setCurrentTense(tense);
      setUserSentence(''); // Clear previous input
      setAiFeedback(null); // Clear previous feedback
      setLoading(false);
    } catch (error) {
      console.error('Error loading question:', error);
      Alert.alert('Error', 'Failed to load practice question');
      setLoading(false);
    }
  };

  /**
   * Handle sentence submission
   * Sends sentence to AI for evaluation
   */
  const handleSubmit = async () => {
    // Basic validation
    if (!userSentence.trim()) {
      Alert.alert('Empty Sentence', 'Please write a sentence first!');
      return;
    }

    // Check rate limit
    const rateCheck = rateLimiter.checkRateLimit();
    if (!rateCheck.allowed) {
      Alert.alert('Please Wait', rateCheck.reason);
      return;
    }

    // Check budget limit
    const budgetLimits = await getBudgetLimits();
    const budgetCheck = await checkBudget(budgetLimits);
    if (!budgetCheck.allowed) {
      Alert.alert(
        'Budget Limit Reached',
        `${budgetCheck.reason}\n\nYou can adjust your budget limits in Settings.`,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setSubmitting(true);
      
      // Record the request
      rateLimiter.recordRequest();
      
      // Call AI to evaluate the sentence
      const feedback = await aiService.evaluateSentence(
        currentVerb.verb,
        currentTense.name,
        userSentence
      );
      
      // AI call successful! Now increment practice count
      await incrementPracticeCount(currentVerb.id);
      
      // Store and display feedback
      setAiFeedback(feedback);
      setSubmitting(false);
      
    } catch (error) {
      console.error('Error submitting:', error);
      setSubmitting(false);
      
      // Show user-friendly error message
      if (error.message.includes('Invalid input')) {
        Alert.alert(
          'Invalid Input',
          error.message,
          [{ text: 'OK' }]
        );
      } else if (error.message.includes('No API key')) {
        Alert.alert(
          'API Key Required',
          'Please add your Grok API key in the Settings screen to use AI feedback.',
          [{ text: 'OK' }]
        );
      } else if (error.message.includes('API Error: 401')) {
        Alert.alert(
          'Invalid API Key',
          'Your API key appears to be invalid. Please check it in Settings.',
          [{ text: 'OK' }]
        );
      } else if (error.message.includes('API Error: 429')) {
        Alert.alert(
          'Rate Limit Exceeded',
          'The AI service is receiving too many requests. Please try again in a few moments.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Connection Error',
          'Unable to get AI feedback. Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  /**
   * Skip to next question without submitting
   * Note: Alert.alert buttons don't work on web, so we use confirm() instead
   */
  const handleSkip = () => {
    if (Platform.OS === 'web') {
      // Web: Use browser's confirm dialog
      const confirmed = window.confirm('Skip this question?');
      if (confirmed) {
        loadNewQuestion();
      }
    } else {
      // iOS/Android: Use native Alert with buttons
      Alert.alert(
        'Skip Question?',
        'Are you sure you want to skip this question?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Skip', onPress: loadNewQuestion }
        ]
      );
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading question...</Text>
      </View>
    );
  }

  // No verb loaded
  if (!currentVerb || !currentTense) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No verbs available</Text>
        <TouchableOpacity style={styles.button} onPress={loadNewQuestion}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Main practice UI
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Instructions */}
        <View style={styles.instructionBox}>
          <Text style={styles.instructionTitle}>📝 Write a sentence using:</Text>
        </View>

        {/* Verb Card */}
        <View style={styles.verbCard}>
          <Text style={styles.verbLabel}>Verb</Text>
          <Text style={styles.verbText}>{currentVerb.verb}</Text>
          <Text style={styles.translationText}>({currentVerb.translation})</Text>
        </View>

        {/* Tense Card */}
        <View style={styles.tenseCard}>
          <Text style={styles.tenseLabel}>Tense</Text>
          <Text style={styles.tenseText}>{currentTense.name}</Text>
          <Text style={styles.tenseDescription}>{currentTense.description}</Text>
        </View>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Your Sentence:</Text>
          <TextInput
            style={styles.textInput}
            value={userSentence}
            onChangeText={setUserSentence}
            placeholder="Type your sentence here..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.characterCount}>
            {userSentence.length} characters
          </Text>
        </View>

        {/* AI Feedback Display */}
        {aiFeedback && (
          <View style={styles.feedbackContainer}>
            <View style={[
              styles.feedbackHeader,
              aiFeedback.isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect
            ]}>
              <Text style={styles.feedbackHeaderText}>
                {aiFeedback.isCorrect ? '✅ Correct!' : '📝 Let\'s Review'}
              </Text>
            </View>
            
            <View style={styles.feedbackContent}>
              {/* Verb Analysis */}
              {aiFeedback.verbAnalysis && (
                <View style={styles.feedbackSection}>
                  <Text style={styles.feedbackSectionTitle}>Verb Conjugation:</Text>
                  <Text style={styles.feedbackText}>{aiFeedback.verbAnalysis}</Text>
                  {aiFeedback.correctConjugation && (
                    <Text style={styles.correctionText}>
                      ✓ Correct form: {aiFeedback.correctConjugation}
                    </Text>
                  )}
                </View>
              )}
              
              {/* Grammar Issues */}
              {aiFeedback.grammarIssues && aiFeedback.grammarIssues.length > 0 && (
                <View style={styles.feedbackSection}>
                  <Text style={styles.feedbackSectionTitle}>Grammar Notes:</Text>
                  {aiFeedback.grammarIssues.map((issue, index) => (
                    <Text key={index} style={styles.issueText}>• {issue}</Text>
                  ))}
                </View>
              )}
              
              {/* Semantic Analysis */}
              {aiFeedback.semanticAnalysis && (
                <View style={styles.feedbackSection}>
                  <Text style={styles.feedbackSectionTitle}>🗣️ Natural French:</Text>
                  <Text style={styles.feedbackText}>{aiFeedback.semanticAnalysis}</Text>
                </View>
              )}
              
              {/* Alternative Phrasings */}
              {aiFeedback.alternativePhrasings && aiFeedback.alternativePhrasings.length > 0 && (
                <View style={styles.alternativesSection}>
                  <Text style={styles.feedbackSectionTitle}>💬 Alternative Ways to Say It:</Text>
                  {aiFeedback.alternativePhrasings.map((phrase, index) => (
                    <View key={index} style={styles.alternativeItem}>
                      <Text style={styles.alternativeText}>"{phrase}"</Text>
                    </View>
                  ))}
                </View>
              )}
              
              {/* Suggestion */}
              {aiFeedback.suggestion && (
                <View style={styles.feedbackSection}>
                  <Text style={styles.feedbackSectionTitle}>💡 Tip:</Text>
                  <Text style={styles.feedbackText}>{aiFeedback.suggestion}</Text>
                </View>
              )}
              
              {/* Encouragement */}
              {aiFeedback.encouragement && (
                <View style={styles.encouragementSection}>
                  <Text style={styles.encouragementText}>{aiFeedback.encouragement}</Text>
                </View>
              )}
              
              {/* Fallback: Show full feedback if parsing failed */}
              {aiFeedback.parseError && (
                <View style={styles.feedbackSection}>
                  <Text style={styles.feedbackText}>{aiFeedback.fullFeedback}</Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.nextButton}
              onPress={loadNewQuestion}
            >
              <Text style={styles.nextButtonText}>Next Question →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.skipButton]}
            onPress={handleSkip}
            disabled={submitting}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={submitting || !userSentence.trim() || aiFeedback !== null}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {aiFeedback ? 'Submitted' : 'Submit'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Practice Count */}
        <Text style={styles.practiceCount}>
          Practice count for this verb: {currentVerb.practiceCount}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContent: {
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#f44336',
    marginBottom: 20,
  },
  instructionBox: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  instructionTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  verbCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verbLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  verbText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  translationText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  tenseCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tenseLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  tenseText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 5,
  },
  tenseDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    minHeight: 120,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    color: '#333',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginRight: 10,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    marginLeft: 10,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  practiceCount: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  feedbackContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  feedbackHeader: {
    padding: 15,
    alignItems: 'center',
  },
  feedbackCorrect: {
    backgroundColor: '#4CAF50',
  },
  feedbackIncorrect: {
    backgroundColor: '#FF9800',
  },
  feedbackHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  feedbackContent: {
    padding: 20,
  },
  feedbackSection: {
    marginBottom: 15,
  },
  feedbackSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  feedbackText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  correctionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 5,
  },
  issueText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
    marginLeft: 5,
    marginTop: 3,
  },
  encouragementSection: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
  },
  encouragementText: {
    fontSize: 15,
    color: '#2e7d32',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  alternativesSection: {
    backgroundColor: '#f3e5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  alternativeItem: {
    marginTop: 8,
    paddingLeft: 10,
  },
  alternativeText: {
    fontSize: 15,
    color: '#6a1b9a',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  nextButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

