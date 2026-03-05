# Student Success Navigator - Testing Checklist

## Deployment URL
https://studentsuccess-j0l2298f7-ramkumars-projects-4158d662.vercel.app

## Test Credentials
- **Email**: `student@university.edu`
- **Password**: `password`

---

## 1. Authentication Flow
- [ ] **Landing Page**: Verify the login page loads with the Student Success branding
- [ ] **Registration**: 
  - Click "Sign up"
  - Enter a new email and password
  - Click "Get Started"
  - Verify success message appears
- [ ] **Login**:
  - Enter email and password
  - Click "Sign In"
  - Verify redirect to dashboard

---

## 2. Dashboard Navigation (Sidebar Links)
Test each sidebar navigation item:
- [ ] **Dashboard**: Click and verify it shows the hero section with GPA stats
- [ ] **AI Navigator**: Click and verify chat interface loads
- [ ] **Schedule**: Click and verify "Book an Advisor" form appears
- [ ] **Courses**: Click and verify course list and GPA calculator appear
- [ ] **Progress**: Click (currently placeholder - should not crash)
- [ ] **Tutoring**: Click and verify tutoring center with tabs loads
- [ ] **Wellness**: Click and verify wellness check mood selection appears

---

## 3. Dashboard Quick Actions
Test each quick action card on the main dashboard:
- [ ] **Book Advisor**: Click and verify it navigates to Schedule page
- [ ] **Tutoring Center**: Click and verify it navigates to Tutoring page
- [ ] **Wellness Check**: Click and verify it navigates to Wellness page
- [ ] **Drop/Add Forms**: Click (placeholder - verify no crash)
- [ ] **Study Timer**: Click (placeholder - verify no crash)

---

## 4. Tutoring Center Features
- [ ] **My Sessions Tab**: 
  - Verify the tab displays
  - Check if any sessions are listed
- [ ] **Wholistic View Tab**:
  - Click the tab
  - Verify tutor availability grid displays
  - Click "Book" on any available slot (e.g., Elena Frost at 11:00 AM)
  - Confirm booking in modal
  - Verify session appears in "My Sessions"
  - Return to "Wholistic View" and verify slot shows "Booked"

---

## 5. Wellness Check Flow
- [ ] **Mood Selection**:
  - Click on a mood (e.g., "Good")
  - Verify it advances to survey
- [ ] **Survey**:
  - Adjust sliders for Sleep Quality, Stress Levels, Social Connection, Energy
  - Click "Complete Check-in"
- [ ] **Results**:
  - Verify personalized advice card appears
  - Verify recommended resources are displayed
  - Click "Reset Wellness Check" and verify it returns to mood selection

---

## 6. Courses Management
- [ ] **View Courses**: Verify course table displays
- [ ] **Add Course**:
  - Click "Add Course"
  - Fill in course name, code, credits, and grade
  - Click "Save Course"
  - Verify course appears in table
  - Verify GPA recalculates
- [ ] **Delete Course**:
  - Click trash icon on a course
  - Confirm deletion
  - Verify course is removed and GPA updates

---

## 7. AI Navigator Chat
- [ ] **Open Chat**: Navigate to AI Navigator
- [ ] **Send Message**: Type a test query (e.g., "What are my grades?")
- [ ] **Verify Response**: Check if AI responds (requires OPENAI_API_KEY in Vercel env vars)
- [ ] **Check Sources**: Verify cited sources appear if applicable

---

## 8. Settings & Logout
- [ ] **Settings**: Click Settings in sidebar (placeholder - verify no crash)
- [ ] **Logout**: 
  - Click Logout
  - Verify redirect to login page
  - Verify token is cleared (try accessing /dashboard directly - should redirect to login)

---

## 9. Direct URL Navigation
Test these URLs directly in the browser:
- [ ] `/` - Should redirect to `/dashboard` or `/login`
- [ ] `/login` - Should show login page
- [ ] `/dashboard` - Should show dashboard (or redirect to login if not authenticated)
- [ ] Refresh any page while logged in - Should maintain state and not show blank page

---

## 10. Mobile Responsiveness (Optional)
- [ ] Open on mobile device or resize browser window
- [ ] Verify sidebar collapses or adapts
- [ ] Verify cards stack vertically
- [ ] Verify forms remain usable

---

## Known Limitations (Vercel Deployment)
⚠️ **Database Resets**: The SQLite database is temporary and will reset when the serverless function restarts (typically after a few minutes of inactivity). This means:
- User accounts may be lost between sessions
- Course data won't persist
- You'll need to re-register periodically

💡 **Solution**: Upgrade to a persistent PostgreSQL database (e.g., Neon.tech)

---

## Reporting Issues
If you encounter any issues:
1. Note which test failed
2. Check browser console for errors (F12 → Console)
3. Check Network tab for failed API requests
4. Take a screenshot if applicable
