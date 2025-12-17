/**
 * Supabase Connection Test
 * 
 * Run this to verify your Supabase connection is working.
 * This fetches the default verbs from the database.
 */

import { supabase } from './supabase';

/**
 * Test database connection by fetching default verbs
 */
export const testSupabaseConnection = async () => {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Try to fetch default verbs (public table)
    const { data, error } = await supabase
      .from('default_verbs')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
    
    console.log('✅ Connection successful!');
    console.log(`📚 Found ${data.length} verbs in default_verbs table`);
    console.log('First few verbs:', data.map(v => v.verb).join(', '));
    
    return {
      success: true,
      verbCount: data.length,
      sampleVerbs: data,
    };
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return {
      success: false,
      error: err.message,
    };
  }
};

/**
 * Test auth service availability
 */
export const testAuthService = async () => {
  console.log('🔍 Testing Auth service...');
  
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Auth service error:', error.message);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Auth service is available');
    console.log('📝 Current session:', data.session ? 'Logged in' : 'Not logged in');
    
    return {
      success: true,
      isLoggedIn: data.session !== null,
    };
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Run all tests
 */
export const runAllTests = async () => {
  console.log('🚀 Starting Supabase tests...\n');
  
  const dbTest = await testSupabaseConnection();
  console.log('');
  
  const authTest = await testAuthService();
  console.log('');
  
  const allPassed = dbTest.success && authTest.success;
  
  console.log('═══════════════════════════════════');
  console.log(allPassed ? '✅ ALL TESTS PASSED!' : '❌ SOME TESTS FAILED');
  console.log('═══════════════════════════════════');
  
  return {
    database: dbTest,
    auth: authTest,
    allPassed,
  };
};

