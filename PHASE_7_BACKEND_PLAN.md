# Phase 7+: Backend Integration Plan

## 📋 Overview

This document outlines the plan to add user authentication, cloud storage, and multi-device sync to the French Verb Practice App using Supabase as the backend.

---

## 🎯 Goals

1. **User Registration & Login** - Allow multiple users with their own accounts
2. **Cloud Data Storage** - Save verbs and progress to the cloud
3. **Cross-Device Sync** - Access data from any device
4. **App Store Ready** - Prepare for production deployment

---

## 🏗️ Technology Stack Addition

### Current Stack:
- React Native + Expo
- AsyncStorage (local)
- Grok API (AI)

### New Additions:
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Row Level Security

---

## 📊 Development Phases

### Phase 7: Backend Setup ⏳
**Status**: Not Started
**Estimated Time**: 1-2 sessions

**Tasks**:
- [ ] Create Supabase account and project
- [ ] Design database schema
- [ ] Set up tables:
  - [ ] `profiles` (user profiles)
  - [ ] `user_verbs` (user's custom verbs)
  - [ ] `practice_sessions` (practice history)
  - [ ] `user_settings` (preferences, API keys)
- [ ] Configure Row Level Security (RLS)
- [ ] Test database from Supabase dashboard

**Learning Goals**:
- Understanding relational databases
- SQL basics
- Database security concepts

---

### Phase 8: Authentication ⏳
**Status**: Not Started
**Estimated Time**: 2-3 sessions

**Tasks**:
- [ ] Install Supabase client library
- [ ] Create auth service (`utils/authService.js`)
- [ ] Build Registration screen
  - [ ] Email input
  - [ ] Password input (with validation)
  - [ ] Confirm password
  - [ ] Error handling
- [ ] Build Login screen
  - [ ] Email/password inputs
  - [ ] "Forgot password" link
  - [ ] Error handling
- [ ] Implement auth state management
- [ ] Create protected routes (require login)
- [ ] Add logout functionality
- [ ] Handle "Remember me" / persistent sessions

**Learning Goals**:
- Authentication flows
- JWT tokens
- Secure credential handling
- Form validation
- Navigation guards

---

### Phase 9: Cloud Data Migration ⏳
**Status**: Not Started
**Estimated Time**: 2-3 sessions

**Tasks**:
- [ ] Create Supabase data service (`utils/supabaseService.js`)
- [ ] Implement CRUD operations for cloud:
  - [ ] Create verbs in cloud
  - [ ] Read verbs from cloud
  - [ ] Update verbs in cloud
  - [ ] Delete verbs from cloud
- [ ] Migrate practice history to cloud
- [ ] Implement offline support:
  - [ ] Cache data locally when offline
  - [ ] Sync when connection restored
- [ ] Handle conflict resolution
- [ ] Update existing screens to use cloud data

**Learning Goals**:
- API integration
- Offline-first architecture
- Data synchronization
- Error handling for network issues

---

### Phase 10: User Features ⏳
**Status**: Not Started
**Estimated Time**: 1-2 sessions

**Tasks**:
- [ ] Create Profile screen
  - [ ] Display user info
  - [ ] Edit profile option
  - [ ] Account statistics
- [ ] Implement Settings with cloud sync:
  - [ ] Save preferences to cloud
  - [ ] API key storage (encrypted)
- [ ] Add "My Progress" dashboard:
  - [ ] Total verbs practiced
  - [ ] Practice streak
  - [ ] Accuracy over time
- [ ] Logout functionality with confirmation

**Learning Goals**:
- User experience design
- State persistence
- Data visualization

---

### Phase 11: App Store Preparation ⏳
**Status**: Not Started
**Estimated Time**: 2-3 sessions

**Tasks**:
- [ ] Create privacy policy
- [ ] Create terms of service
- [ ] Design app icon (final version)
- [ ] Create screenshots for stores
- [ ] Write app description
- [ ] Configure EAS Build for production
- [ ] Build iOS app (requires Apple Developer $99/year)
- [ ] Build Android app (free)
- [ ] Submit to stores

**Learning Goals**:
- App Store requirements
- Legal considerations
- Marketing basics
- Production deployment

---

## 🗄️ Database Schema Design

### Table: `profiles`
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `user_verbs`
```sql
CREATE TABLE user_verbs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  verb TEXT NOT NULL,
  translation TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  practice_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `practice_sessions`
```sql
CREATE TABLE practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  verb_id UUID REFERENCES user_verbs(id),
  tense TEXT NOT NULL,
  user_sentence TEXT NOT NULL,
  is_correct BOOLEAN,
  ai_feedback JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `user_settings`
```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) UNIQUE NOT NULL,
  ai_provider TEXT DEFAULT 'grok',
  daily_goal INTEGER DEFAULT 10,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 Security Plan

### Row Level Security (RLS) Rules:
- Users can only read/write their OWN data
- Default verbs are readable by all, writable by none
- API keys stored encrypted

### Authentication:
- Email/password authentication
- Optional: Google/Apple OAuth (future)
- JWT tokens with secure storage
- Session refresh handling

---

## 📱 New Screens to Build

1. **WelcomeScreen** - First-time user flow
2. **LoginScreen** - User login
3. **RegisterScreen** - User registration
4. **ForgotPasswordScreen** - Password recovery
5. **ProfileScreen** - User profile & settings
6. **ProgressScreen** - Detailed progress dashboard

---

## 🔄 Migration Strategy

### From AsyncStorage to Supabase:

1. **New Users**: Start fresh with cloud storage
2. **Existing Users**: 
   - Prompt to create account
   - Offer to migrate local data to cloud
   - Keep local backup during transition

---

## 📦 New Dependencies

```json
{
  "@supabase/supabase-js": "^2.x",
  "expo-secure-store": "~13.x",
  "react-native-url-polyfill": "^2.x"
}
```

---

## ⏱️ Estimated Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 7: Backend Setup | 1-2 days | 1-2 days |
| Phase 8: Authentication | 3-4 days | 4-6 days |
| Phase 9: Cloud Migration | 3-4 days | 7-10 days |
| Phase 10: User Features | 2-3 days | 9-13 days |
| Phase 11: App Store | 3-4 days | 12-17 days |

**Total Estimated Time**: 2-3 weeks of focused work

---

## ✅ Prerequisites Before Starting

- [ ] Supabase account created (https://supabase.com)
- [ ] Basic understanding of Supabase purpose (✅ Done!)
- [ ] Current app working and deployed (✅ Done!)
- [ ] CI/CD pipeline working (✅ Done!)

---

## 🎓 Key Learning Outcomes

By completing these phases, you will learn:

1. **Backend Development**
   - Database design
   - SQL queries
   - API integration
   - Security best practices

2. **Authentication**
   - User registration/login flows
   - Token management
   - Session handling
   - Password security

3. **Cloud Architecture**
   - Offline-first design
   - Data synchronization
   - Conflict resolution
   - Real-time updates

4. **Production Deployment**
   - App Store requirements
   - Privacy considerations
   - Performance optimization
   - User analytics

---

## 📝 Checkpoint Questions (End of Each Phase)

### Phase 7 Checkpoint:
- What is a foreign key and why do we use it?
- What does Row Level Security protect against?
- Can you explain the relationship between tables?

### Phase 8 Checkpoint:
- What happens when a user registers?
- Where is the JWT token stored?
- Why do we hash passwords?

### Phase 9 Checkpoint:
- How do we handle offline mode?
- What happens if two devices edit the same data?
- Why do we cache locally?

### Phase 10 Checkpoint:
- How is user data protected?
- What information should we show in a profile?
- How do we handle logout securely?

---

## 🚀 Ready to Begin?

Once you've reviewed this plan:
1. Create a Supabase account
2. Tell me you're ready
3. We'll start Phase 7: Backend Setup

---

**Document Created**: December 2025
**Last Updated**: December 2025
**Current Status**: Planning Complete, Ready to Start Phase 7

