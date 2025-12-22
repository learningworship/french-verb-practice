# App Store Preparation Guide

This guide will help you prepare your French Verb Practice app for submission to the App Store (iOS) and Google Play Store (Android).

## ✅ Completed Steps

- [x] Privacy Policy created
- [x] Terms of Service created
- [x] App metadata configured in `app.json`
- [x] Legal links added to Settings screen

## 📋 Remaining Steps

### 1. Customize Legal Documents

**Action Required:**
- Open `PRIVACY_POLICY.md` and `TERMS_OF_SERVICE.md`
- Replace `[Your Email Address]` with your actual email
- Replace `[Your Website]` with your website URL (if you have one)
- Replace `[Your Jurisdiction]` with your country/state
- Review and customize the content as needed
- **Important:** Consider having a lawyer review these documents

**For Production:**
- Host these documents on a website (GitHub Pages, your own website, etc.)
- Update the links in `SettingsScreen.js` to point to the hosted URLs

---

### 2. App Icons and Splash Screens

**Current Status:** Using default Expo icons

**Action Required:**

#### iOS Icons
- Create icons in these sizes:
  - 1024x1024 (App Store)
  - 180x180 (iPhone)
  - 120x120 (iPhone)
  - 152x152 (iPad)
  - 167x167 (iPad Pro)

#### Android Icons
- Create adaptive icon:
  - Foreground: 1024x1024 (safe area: 432x432)
  - Background: 1024x1024

**Tools:**
- Use [App Icon Generator](https://www.appicon.co/)
- Or design in Figma/Photoshop and export

**Place icons in:**
- `./assets/icon.png` (1024x1024)
- `./assets/adaptive-icon.png` (1024x1024)

---

### 3. Screenshots

**Required for App Stores:**

#### iOS (App Store Connect)
- iPhone 6.7" (1290 x 2796 pixels) - 1-10 screenshots
- iPhone 6.5" (1242 x 2688 pixels) - 1-10 screenshots
- iPad Pro 12.9" (2048 x 2732 pixels) - 1-10 screenshots (optional)

#### Android (Google Play Console)
- Phone: 1080 x 1920 pixels (16:9) - At least 2, up to 8
- Tablet: 1200 x 1920 pixels (optional)

**Tips:**
- Show key features: Practice screen, History, Statistics
- Use real device screenshots (not simulators)
- Add text overlays highlighting features
- Keep them updated as you add features

---

### 4. App Store Listing

#### iOS (App Store Connect)

**Required Information:**
- **App Name:** French Verb Practice (30 characters max)
- **Subtitle:** Practice French verbs with AI (30 characters max)
- **Description:** 
  ```
  Master French verb conjugation through interactive practice sessions. 
  Create sentences, receive AI-powered feedback, and track your progress.
  
  Features:
  • Practice 50+ common French verbs
  • AI-powered sentence correction
  • Track your learning progress
  • Practice history and statistics
  • Multiple tenses: Présent, Passé Composé, Futur Simple, Imparfait
  ```
- **Keywords:** french, language, learning, verbs, conjugation, practice, education
- **Category:** Education
- **Age Rating:** 4+ (or appropriate rating)
- **Privacy Policy URL:** [Your hosted privacy policy URL]
- **Support URL:** [Your support/contact URL]

#### Android (Google Play Console)

**Required Information:**
- **App Name:** French Verb Practice (50 characters max)
- **Short Description:** Practice French verbs with AI feedback (80 characters max)
- **Full Description:** Same as iOS description
- **Category:** Education
- **Content Rating:** Everyone
- **Privacy Policy URL:** [Your hosted privacy policy URL]

---

### 5. Build Production Apps

#### Using EAS Build

**Install EAS CLI (if not already installed):**
```bash
npm install -g eas-cli
```

**Login to Expo:**
```bash
eas login
```

**Configure Build:**
```bash
eas build:configure
```

**Build for iOS:**
```bash
eas build --platform ios --profile production
```

**Build for Android:**
```bash
eas build --platform android --profile production
```

**Note:** iOS builds require:
- Apple Developer account ($99/year)
- App Store Connect access

**Android builds require:**
- Google Play Developer account ($25 one-time)

---

### 6. Test Before Submission

**Test Checklist:**
- [ ] App launches without crashes
- [ ] All features work correctly
- [ ] Login/Registration works
- [ ] Practice sessions save correctly
- [ ] Statistics calculate correctly
- [ ] History displays correctly
- [ ] Settings work
- [ ] No console errors
- [ ] App works on different screen sizes
- [ ] Performance is acceptable

**Test on Real Devices:**
- Test on actual iPhone and Android devices
- Test on different OS versions
- Test with slow network connection

---

### 7. Submit to App Stores

#### iOS Submission

1. **App Store Connect:**
   - Go to https://appstoreconnect.apple.com
   - Create new app
   - Fill in all required information
   - Upload screenshots
   - Upload build from EAS
   - Submit for review

2. **Review Process:**
   - Usually takes 1-3 days
   - Apple may ask questions
   - Be prepared to explain features

#### Android Submission

1. **Google Play Console:**
   - Go to https://play.google.com/console
   - Create new app
   - Fill in store listing
   - Upload screenshots
   - Upload APK/AAB from EAS
   - Submit for review

2. **Review Process:**
   - Usually takes 1-7 days
   - Google may test the app
   - May require additional information

---

### 8. Post-Launch

**Monitor:**
- App Store reviews and ratings
- Crash reports (use Sentry or similar)
- User feedback
- Analytics (if implemented)

**Update Regularly:**
- Fix bugs
- Add new features
- Respond to user reviews
- Update screenshots

---

## 📚 Resources

- [Expo App Store Guide](https://docs.expo.dev/submit/introduction/)
- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

---

## ⚠️ Important Notes

1. **Legal Compliance:** Ensure your app complies with:
   - GDPR (if targeting EU users)
   - COPPA (if targeting children)
   - CCPA (if targeting California users)

2. **API Keys:** Your app uses user-provided API keys. Make sure this is clear in:
   - Privacy Policy
   - App description
   - Terms of Service

3. **Data Collection:** Document all data you collect in the Privacy Policy

4. **Third-Party Services:** List all third-party services (Supabase, AI providers) in Privacy Policy

---

## 🎯 Next Steps

1. Customize legal documents
2. Create app icons
3. Take screenshots
4. Set up EAS Build
5. Test thoroughly
6. Submit to stores

Good luck with your app submission! 🚀

