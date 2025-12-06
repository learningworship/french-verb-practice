# French Verb Practice App - Project Documentation

## 🎯 Project Purpose
A mobile application to help users practice French verb conjugation through sentence construction, with AI-powered feedback and corrections.

---

## 👥 Development Approach
**Mentorship Model**: Senior Engineer (AI) guiding Junior Engineer (User)
- Learning by doing
- Explanations with every decision
- Incremental feature building
- Code review and understanding checkpoints

---

## 📚 Learning Best Practices

### 1. **Understand Before Copying**
- Don't just copy-paste code
- Ask "Why did you structure it this way?"
- Ask "What does this function do?"
- Explain code back in your own words

### 2. **Make Mistakes Intentionally**
- Try modifying code after implementation
- Break things on purpose to learn from errors
- Learn debugging and how components connect

### 3. **Ask "What If" Questions**
- "What if we wanted to add X feature later?"
- "What if we used Y approach instead?"
- Explore architecture and tradeoffs

### 4. **Build Step-by-Step**
- Build features incrementally
- Test each feature before moving to next
- Learn proper development workflow

### 5. **Read the Code**
- Don't rush - read every line
- Look up unfamiliar concepts
- Ask about patterns you don't understand

### 6. **Try First, Then Ask**
- Attempt implementation yourself first
- Review and refine together

### 🛑 Accountability Triggers
- ❓ "Wait, explain that part again"
- 🛑 "Stop - let me try implementing this next part myself"
- 🔍 "Why did you choose this approach over X?"
- 📝 "Checkpoint - let me summarize what we just did"
- "Slow down, I want to understand X better"
- "I'm lost, can we review the bigger picture?"

---

## 🏗️ Technical Stack

### Frontend
- **Framework**: React Native with Expo (~54.0.23)
- **Platform**: Cross-platform (iOS, Android, Web)
- **React Version**: 19.1.0

### Data Storage
- **AsyncStorage**: Local storage for verbs and user data
- Works offline, no backend needed for MVP

### AI Integration
- **Primary**: Grok API for sentence correction
- **Feature**: Allow user to switch between different AI models
- Provides grammar feedback and suggestions

---

## 🎨 App Features (MVP Scope)

### Core Features:
1. **Verb Management**
   - Pre-loaded ~50 common French verbs (infinitive form)
   - User can add new verbs
   - Auto-convert to infinitive form

2. **Tenses Supported** (Starting Set)
   - Présent
   - Passé Composé
   - Futur Simple
   - Imparfait

3. **Practice Flow**
   - App randomly selects a verb + tense
   - User writes a sentence using that verb in that tense
   - AI evaluates and provides feedback
   - Corrections and suggestions displayed

4. **Settings**
   - Switch AI model (Grok, OpenAI, etc.)
   - Manage API keys

---

## 🗺️ Development Roadmap

### Phase 1: Project Setup & Basic UI
- ✅ Initial Expo project created
- ⏳ Set up navigation structure (React Navigation)
- ⏳ Create main screens:
  - Home/Dashboard
  - Practice Screen
  - Add Verb Screen
  - Settings Screen
- ⏳ Basic styling framework

### Phase 2: Data Layer
- ⏳ Design verb data structure
- ⏳ Implement AsyncStorage helpers
- ⏳ Pre-load 50 common French verbs
- ⏳ CRUD operations for verbs
- ⏳ Create tense configuration

### Phase 3: Practice Logic
- ⏳ Random verb/tense selector algorithm
- ⏳ Practice screen UI
  - Display verb + tense prompt
  - Text input for user sentence
  - Submit button
- ⏳ Sentence validation (basic)

### Phase 4: AI Integration
- ⏳ Set up Grok API integration
- ⏳ Create correction request/response flow
- ⏳ Parse and display AI feedback
- ⏳ Implement model switching
- ⏳ API key management
- ⏳ Error handling for API calls

### Phase 5: Polish & Enhancement
- ⏳ Improve UI/UX design
- ⏳ Add practice statistics
- ⏳ Progress tracking
- ⏳ History of past practices
- ⏳ Testing and bug fixes

### Future Enhancements (Post-MVP):
- More tenses (Subjonctif, Conditionnel, etc.)
- Verb categories (regular vs irregular)
- Difficulty levels
- Streak tracking
- Export/import verb lists

---

## 📋 Checkpoint Process

### After Each Major Feature:
1. **Student explains** what was just built
2. **Mentor clarifies** any misunderstandings
3. **Review**: Why this approach? What are alternatives?
4. **Move forward** to next feature

### Before Each New Phase:
1. **Mentor summarizes** what we're about to build
2. **Mentor explains WHY** this approach
3. **Student asks** questions upfront
4. **Then code** together

---

## 💡 Key Design Decisions

### Why AsyncStorage?
- Simple for MVP
- Works offline
- No backend infrastructure needed
- Good for learning local state management
- Can migrate to cloud later if needed

### Why Start with 4 Tenses?
- Covers most common use cases
- Manageable scope for learning
- Can expand later
- Tests core functionality thoroughly

### Why AI for Corrections?
- French grammar is complex
- AI provides natural feedback
- More practical than building rule engine
- Teaches API integration

### Why Model Switching?
- Different models have different strengths
- Cost optimization (some APIs cheaper)
- Learning about API abstraction
- Future-proofing the app

---

## 🔄 How to Resume After Break

When starting a new conversation or after context reset:

1. **Share this document** with the AI
2. **Reference CURRENT_STATUS.md** to see where you left off
3. **Mention any specific questions** or blockers
4. **State which phase** you're working on

Example message:
```
I'm working on the French Verb Practice App. Please review PROJECT_OVERVIEW.md 
and CURRENT_STATUS.md. I'm currently on Phase 2 - Data Layer, and I have 
questions about the verb data structure.
```

---

## 📞 Questions to Ask Regularly

- "Why did we choose this pattern?"
- "What are the tradeoffs of this approach?"
- "How would we scale this feature?"
- "What could go wrong here?"
- "How does this connect to the rest of the app?"

---

## 🎓 Learning Goals

By completing this project, you will learn:

1. **React Native fundamentals**
   - Components, Props, State
   - Hooks (useState, useEffect, etc.)
   - Navigation
   - Platform-specific code

2. **State Management**
   - Local state vs persistent storage
   - AsyncStorage API
   - Data flow

3. **API Integration**
   - HTTP requests
   - Async/await patterns
   - Error handling
   - API key security

4. **App Architecture**
   - Separation of concerns
   - Reusable components
   - Code organization

5. **Mobile Development**
   - UI/UX considerations
   - Responsive design
   - Testing on different devices

6. **Professional Practices**
   - Code documentation
   - Git workflow
   - Incremental development
   - Debugging techniques

---

**Last Updated**: November 19, 2025
**Current Phase**: Phase 1 - Project Setup & Basic UI (Not Started)

