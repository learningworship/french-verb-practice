import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

// Import screen components
import HomeScreen from './screens/HomeScreen';
import PracticeScreen from './screens/PracticeScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

// Import utilities
import { initializeDefaultVerbs } from './utils/storage';
import { onAuthStateChange, getSession } from './utils/authService';

// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/**
 * Auth Navigator - Shown when user is NOT logged in
 * Contains Login and Register screens
 */
function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Hide header for auth screens
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

/**
 * Main Navigator - Shown when user IS logged in
 * Contains the tab navigation (Home, Practice, Settings)
 */
function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          title: 'French Verb Practice',
        }}
      />
      <Tab.Screen 
        name="Practice" 
        component={PracticeScreen}
        options={{
          tabBarLabel: 'Practice',
          title: 'Practice',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          title: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Main App Component
 * Manages auth state and shows appropriate navigator
 */
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize app and set up auth listener
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize default verbs (for local storage)
        await initializeDefaultVerbs();
        
        // Check if user is already logged in
        const session = await getSession();
        setIsAuthenticated(session !== null);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize app:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    initializeApp();

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      setIsAuthenticated(session !== null);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // Show loading screen while initializing
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show error screen if initialization failed
  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.errorSubtext}>Please restart the app</Text>
      </View>
    );
  }

  // Main app UI - show auth or main based on login state
  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
      <StatusBar style={isAuthenticated ? "light" : "dark"} />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
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
    fontSize: 18,
    color: '#f44336',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
  },
});
