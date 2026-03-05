# Student Success Navigator - Master Test Case List

**Version:** 1.0  
**Last Updated:** December 29, 2025  
**Environment:** Production (https://studentsuccess-nu.vercel.app)  
**Backend:** https://student-success-backend-cnya.onrender.com

---

## Test Execution Instructions

1. Run all tests in order
2. Mark each test as ✅ PASS or ❌ FAIL
3. Document any failures with screenshots and error messages
4. Re-run failed tests after fixes
5. Update this document with any new features

---

## 1. AUTHENTICATION & USER MANAGEMENT

### 1.1 User Registration
- [ ] **TC-001:** Navigate to landing page, click "Get Started"
- [ ] **TC-002:** Fill registration form with valid data (new email, password, full name)
- [ ] **TC-003:** Submit form and verify successful registration
- [ ] **TC-004:** Verify redirect to dashboard after registration
- [ ] **TC-005:** Attempt registration with existing email - should show error
- [ ] **TC-006:** Attempt registration with weak password - should show validation error
- [ ] **TC-007:** Attempt registration with invalid email format - should show error

### 1.2 User Login
- [ ] **TC-008:** Navigate to login page
- [ ] **TC-009:** Login with valid credentials
- [ ] **TC-010:** Verify redirect to dashboard
- [ ] **TC-011:** Login with incorrect password - should show error
- [ ] **TC-012:** Login with non-existent email - should show error
- [ ] **TC-013:** Verify token is stored in localStorage
- [ ] **TC-014:** Refresh page - should remain logged in

### 1.3 User Logout
- [ ] **TC-015:** Click logout button
- [ ] **TC-016:** Verify redirect to landing page
- [ ] **TC-017:** Verify token is removed from localStorage
- [ ] **TC-018:** Attempt to access dashboard after logout - should redirect to login

---

## 2. DASHBOARD

### 2.1 Dashboard Overview
- [ ] **TC-019:** Verify dashboard loads successfully
- [ ] **TC-020:** Verify user name is displayed in header
- [ ] **TC-021:** Verify all sidebar menu items are visible
- [ ] **TC-022:** Verify quick action cards are displayed
- [ ] **TC-023:** Verify GPA and On-Track Score are shown
- [ ] **TC-024:** Verify AI Insight section is visible

### 2.2 Navigation
- [ ] **TC-025:** Click each sidebar menu item and verify navigation
- [ ] **TC-026:** Verify active menu item is highlighted
- [ ] **TC-027:** Verify back navigation works correctly
- [ ] **TC-028:** Verify browser back/forward buttons work

---

## 3. AI NAVIGATOR (CHAT)

### 3.1 Chat Session Creation
- [ ] **TC-029:** Navigate to AI Navigator
- [ ] **TC-030:** Verify chat interface loads
- [ ] **TC-031:** Send first message - verify new session is created
- [ ] **TC-032:** Verify session appears in history sidebar
- [ ] **TC-033:** Verify session has auto-generated title

### 3.2 Chat Functionality
- [ ] **TC-034:** Send academic question (e.g., "I'm failing calculus")
- [ ] **TC-035:** Verify AI response is received
- [ ] **TC-036:** Verify response includes cited sources
- [ ] **TC-037:** Verify response includes action items
- [ ] **TC-038:** Send administrative question (e.g., "How do I drop a course?")
- [ ] **TC-039:** Verify appropriate routing to admin agent
- [ ] **TC-040:** Send wellness question (e.g., "I feel stressed")
- [ ] **TC-041:** Verify appropriate routing to wellness agent
- [ ] **TC-042:** Send multiple messages in same session
- [ ] **TC-043:** Verify conversation context is maintained

### 3.3 Chat History
- [ ] **TC-044:** Create multiple chat sessions
- [ ] **TC-045:** Verify all sessions appear in history
- [ ] **TC-046:** Click on previous session - verify it loads
- [ ] **TC-047:** Verify message history is preserved
- [ ] **TC-048:** Delete a chat session
- [ ] **TC-049:** Verify deleted session is removed from history

### 3.4 File Upload
- [ ] **TC-050:** Upload a PDF file to chat
- [ ] **TC-051:** Verify file upload success message
- [ ] **TC-052:** Ask question about uploaded file
- [ ] **TC-053:** Verify AI references the file in response

---

## 4. FLASHCARD GENERATOR

### 4.1 Flashcard Generation from Topic
- [ ] **TC-054:** Navigate to Flashcards
- [ ] **TC-055:** Select "Generate from Topic"
- [ ] **TC-056:** Enter course name (e.g., "Biology 101")
- [ ] **TC-057:** Enter topic (e.g., "Mitochondria")
- [ ] **TC-058:** Click "Generate Flashcards"
- [ ] **TC-059:** Verify loading indicator appears
- [ ] **TC-060:** Verify 20 flashcards are generated
- [ ] **TC-061:** Verify flashcards contain relevant content (not mock data)
- [ ] **TC-062:** Verify no "Concept 1, Concept 2" generic text

### 4.2 Flashcard Generation from Notes
- [ ] **TC-063:** Select "Generate from Notes"
- [ ] **TC-064:** Paste sample notes (at least 200 words)
- [ ] **TC-065:** Click "Generate Flashcards"
- [ ] **TC-066:** Verify flashcards are extracted from notes
- [ ] **TC-067:** Verify flashcards are contextually relevant

### 4.3 Flashcard Interaction
- [ ] **TC-068:** Click on a flashcard to flip it
- [ ] **TC-069:** Verify front and back content are displayed
- [ ] **TC-070:** Navigate through flashcards using arrows
- [ ] **TC-071:** Verify card counter updates (e.g., "1/20")
- [ ] **TC-072:** Mark card as "Know" - verify it's marked
- [ ] **TC-073:** Mark card as "Don't Know" - verify it's marked
- [ ] **TC-074:** Shuffle flashcards - verify order changes
- [ ] **TC-075:** Reset flashcards - verify all marks are cleared

### 4.4 Flashcard Export/Save
- [ ] **TC-076:** Click "Download as PDF" (if implemented)
- [ ] **TC-077:** Verify PDF downloads successfully
- [ ] **TC-078:** Generate new set of flashcards
- [ ] **TC-079:** Verify previous set is replaced

---

## 5. LECTURE VOICE NOTES

### 5.1 Audio Recording
- [ ] **TC-080:** Navigate to Lecture Voice Notes
- [ ] **TC-081:** Click microphone button to start recording
- [ ] **TC-082:** Verify recording indicator appears (red pulsing)
- [ ] **TC-083:** Verify timer starts counting
- [ ] **TC-084:** Speak for 10-15 seconds
- [ ] **TC-085:** Click "Stop Recording"
- [ ] **TC-086:** Verify recording is saved
- [ ] **TC-087:** Verify duration is displayed

### 5.2 Audio Upload
- [ ] **TC-088:** Click upload button
- [ ] **TC-089:** Select an audio file (mp3, wav, webm)
- [ ] **TC-090:** Verify file is uploaded successfully
- [ ] **TC-091:** Verify file name/size is displayed

### 5.3 Transcription & Summarization
- [ ] **TC-092:** Select output language (e.g., English)
- [ ] **TC-093:** Click "Transcribe & Summarize"
- [ ] **TC-094:** Verify loading indicator appears
- [ ] **TC-095:** Verify transcription is generated (not mock data)
- [ ] **TC-096:** Verify summary contains 5 key takeaways
- [ ] **TC-097:** Verify summary is relevant to audio content
- [ ] **TC-098:** Test with different language (e.g., Spanish)
- [ ] **TC-099:** Verify output is in selected language

### 5.4 Saving Lecture Notes
- [ ] **TC-100:** After transcription, verify "Save Lecture Note" dialog appears
- [ ] **TC-101:** Enter course name (e.g., "Physics 101")
- [ ] **TC-102:** Enter professor name (e.g., "Dr. Smith")
- [ ] **TC-103:** Click "Save Note"
- [ ] **TC-104:** Verify success message appears
- [ ] **TC-105:** Skip saving - click "Skip" button
- [ ] **TC-106:** Verify note is not saved

### 5.5 Lecture History
- [ ] **TC-107:** Click "Show History" button
- [ ] **TC-108:** Verify history sidebar opens
- [ ] **TC-109:** Verify saved lectures are listed
- [ ] **TC-110:** Verify lectures are sorted by date (newest first)
- [ ] **TC-111:** Verify each entry shows: title, course, professor, date
- [ ] **TC-112:** Click on a saved lecture
- [ ] **TC-113:** Verify transcript and summary are displayed
- [ ] **TC-114:** Verify full content matches saved data

### 5.6 Bookmarking
- [ ] **TC-115:** Click bookmark icon on a lecture
- [ ] **TC-116:** Verify bookmark icon changes (filled star)
- [ ] **TC-117:** Click bookmark again to remove
- [ ] **TC-118:** Verify bookmark is removed (outline star)
- [ ] **TC-119:** Bookmark multiple lectures
- [ ] **TC-120:** Verify all bookmarks persist after page refresh

### 5.7 Deleting Lectures
- [ ] **TC-121:** Click delete icon on a lecture
- [ ] **TC-122:** Verify confirmation dialog appears
- [ ] **TC-123:** Confirm deletion
- [ ] **TC-124:** Verify lecture is removed from history
- [ ] **TC-125:** Cancel deletion
- [ ] **TC-126:** Verify lecture is not deleted

### 5.8 Auto-Title Generation
- [ ] **TC-127:** Save lecture with course and professor
- [ ] **TC-128:** Verify title format: "Course - Professor - Date"
- [ ] **TC-129:** Save lecture with only course
- [ ] **TC-130:** Verify title format: "Course - Date"
- [ ] **TC-131:** Save lecture with no course/professor
- [ ] **TC-132:** Verify title format: "Lecture - Date Time"

---

## 6. COURSES

### 6.1 Course List
- [ ] **TC-133:** Navigate to Courses
- [ ] **TC-134:** Verify course list loads
- [ ] **TC-135:** Verify each course shows: name, code, grade, credits
- [ ] **TC-136:** Verify suggestion/recommendation is displayed
- [ ] **TC-137:** Verify courses are displayed in cards

### 6.2 Course Management
- [ ] **TC-138:** Add new course (if feature exists)
- [ ] **TC-139:** Edit course details (if feature exists)
- [ ] **TC-140:** Delete course (if feature exists)
- [ ] **TC-141:** Verify GPA updates after course changes

---

## 7. TUTORS

### 7.1 Tutor Directory
- [ ] **TC-142:** Navigate to Tutors
- [ ] **TC-143:** Verify tutor list loads
- [ ] **TC-144:** Verify each tutor shows: name, subjects, rating, reviews
- [ ] **TC-145:** Verify tutor avatars/initials are displayed
- [ ] **TC-146:** Verify color coding for tutors

### 7.2 Tutor Search/Filter
- [ ] **TC-147:** Search for tutor by name
- [ ] **TC-148:** Filter tutors by subject
- [ ] **TC-149:** Sort tutors by rating
- [ ] **TC-150:** Verify filtered results are accurate

### 7.3 Tutor Booking
- [ ] **TC-151:** Click "Book Session" on a tutor
- [ ] **TC-152:** Verify booking modal/form appears
- [ ] **TC-153:** Fill booking details
- [ ] **TC-154:** Submit booking
- [ ] **TC-155:** Verify confirmation message

---

## 8. FORMS (ADD/DROP)

### 8.1 Add Course Request
- [ ] **TC-156:** Navigate to Forms
- [ ] **TC-157:** Select "Add Course"
- [ ] **TC-158:** Fill course name and code
- [ ] **TC-159:** Select reason from dropdown
- [ ] **TC-160:** Add explanation
- [ ] **TC-161:** Submit form
- [ ] **TC-162:** Verify success message
- [ ] **TC-163:** Verify request appears in history with "pending" status

### 8.2 Drop Course Request
- [ ] **TC-164:** Select "Drop Course"
- [ ] **TC-165:** Fill course details
- [ ] **TC-166:** Select reason
- [ ] **TC-167:** Submit form
- [ ] **TC-168:** Verify success message
- [ ] **TC-169:** Verify request appears in history

### 8.3 Form History
- [ ] **TC-170:** View all submitted forms
- [ ] **TC-171:** Verify status indicators (pending, approved, rejected)
- [ ] **TC-172:** Verify form details are preserved
- [ ] **TC-173:** Filter forms by status
- [ ] **TC-174:** Filter forms by type (add/drop)

---

## 9. ADVISORS

### 9.1 Advisor Directory
- [ ] **TC-175:** Navigate to Advisors
- [ ] **TC-176:** Verify advisor list loads
- [ ] **TC-177:** Verify each advisor shows: name, specialty, availability, email
- [ ] **TC-178:** Verify advisor images/avatars

### 9.2 Advisor Contact
- [ ] **TC-179:** Click "Schedule Meeting" on an advisor
- [ ] **TC-180:** Verify scheduling interface appears
- [ ] **TC-181:** Select date and time
- [ ] **TC-182:** Submit meeting request
- [ ] **TC-183:** Verify confirmation

---

## 10. SOCIAL CAMPUS

### 10.1 Study Buddy Finder
- [ ] **TC-184:** Navigate to Social Campus → Study Groups
- [ ] **TC-185:** Verify study group list loads
- [ ] **TC-186:** Verify each group shows: name, course, topic, schedule, location, members
- [ ] **TC-187:** Filter groups by course code
- [ ] **TC-188:** Click "Join Group"
- [ ] **TC-189:** Verify member count increases
- [ ] **TC-190:** Create new study group
- [ ] **TC-191:** Fill group details
- [ ] **TC-192:** Submit group creation
- [ ] **TC-193:** Verify group appears in list

### 10.2 Peer Mentoring
- [ ] **TC-194:** Navigate to Peer Mentoring
- [ ] **TC-195:** Verify mentor list loads
- [ ] **TC-196:** Verify each mentor shows: name, specialty, bio, availability
- [ ] **TC-197:** Filter mentors by specialty
- [ ] **TC-198:** Click "Book Session"
- [ ] **TC-199:** Fill booking form
- [ ] **TC-200:** Submit booking
- [ ] **TC-201:** Verify confirmation

### 10.3 Textbook Marketplace
- [ ] **TC-202:** Navigate to Marketplace
- [ ] **TC-203:** Verify item list loads
- [ ] **TC-204:** Verify each item shows: title, price, condition, seller, image
- [ ] **TC-205:** Filter items by condition
- [ ] **TC-206:** Search for specific textbook
- [ ] **TC-207:** Click "Contact Seller"
- [ ] **TC-208:** Verify contact information is displayed
- [ ] **TC-209:** List new item for sale
- [ ] **TC-210:** Fill item details
- [ ] **TC-211:** Upload item image
- [ ] **TC-212:** Submit listing
- [ ] **TC-213:** Verify item appears in marketplace

---

## 11. ADMIN PANEL (If Admin User)

### 11.1 Admin Access
- [ ] **TC-214:** Login as admin user
- [ ] **TC-215:** Verify "Admin Panel" appears in sidebar
- [ ] **TC-216:** Navigate to Admin Panel
- [ ] **TC-217:** Verify admin dashboard loads

### 11.2 User Management
- [ ] **TC-218:** View all users
- [ ] **TC-219:** Search for specific user
- [ ] **TC-220:** Edit user details
- [ ] **TC-221:** Delete user
- [ ] **TC-222:** Promote user to admin
- [ ] **TC-223:** Verify changes are saved

### 11.3 Form Approval
- [ ] **TC-224:** View pending add/drop requests
- [ ] **TC-225:** Approve a request
- [ ] **TC-226:** Verify status changes to "approved"
- [ ] **TC-227:** Reject a request
- [ ] **TC-228:** Verify status changes to "rejected"
- [ ] **TC-229:** Add admin comment to request

---

## 12. SYLLABUS SCANNER

### 12.1 Syllabus Upload
- [ ] **TC-230:** Navigate to Syllabus Scanner
- [ ] **TC-231:** Upload PDF syllabus
- [ ] **TC-232:** Verify file upload success
- [ ] **TC-233:** Verify processing indicator

### 12.2 Event Extraction
- [ ] **TC-234:** Verify events are extracted from syllabus
- [ ] **TC-235:** Verify events show: title, date, type
- [ ] **TC-236:** Verify events are sorted chronologically
- [ ] **TC-237:** Edit an extracted event
- [ ] **TC-238:** Delete an extracted event
- [ ] **TC-239:** Add manual event

### 12.3 Calendar Integration
- [ ] **TC-240:** Click "Add to Calendar"
- [ ] **TC-241:** Verify calendar export/download
- [ ] **TC-242:** Verify .ics file is generated

---

## 13. STUDY TIMER (POMODORO)

### 13.1 Timer Functionality
- [ ] **TC-243:** Navigate to Study Timer
- [ ] **TC-244:** Verify default timer is set (25 minutes)
- [ ] **TC-245:** Click "Start" button
- [ ] **TC-246:** Verify timer counts down
- [ ] **TC-247:** Click "Pause" button
- [ ] **TC-248:** Verify timer pauses
- [ ] **TC-249:** Click "Resume"
- [ ] **TC-250:** Verify timer continues
- [ ] **TC-251:** Click "Reset"
- [ ] **TC-252:** Verify timer resets to default

### 13.2 Timer Modes
- [ ] **TC-253:** Switch to "Short Break" mode (5 minutes)
- [ ] **TC-254:** Verify timer updates
- [ ] **TC-255:** Switch to "Long Break" mode (15 minutes)
- [ ] **TC-256:** Verify timer updates
- [ ] **TC-257:** Complete a full work session
- [ ] **TC-258:** Verify automatic switch to break mode

### 13.3 Timer Settings
- [ ] **TC-259:** Click settings/gear icon
- [ ] **TC-260:** Change work duration (e.g., to 30 minutes)
- [ ] **TC-261:** Change short break duration
- [ ] **TC-262:** Change long break duration
- [ ] **TC-263:** Save settings
- [ ] **TC-264:** Verify new durations are applied

### 13.4 Statistics
- [ ] **TC-265:** Complete 2-3 Pomodoro sessions
- [ ] **TC-266:** Verify session count increases
- [ ] **TC-267:** Verify total focus time is calculated
- [ ] **TC-268:** Verify statistics persist after page refresh

---

## 14. RESPONSIVE DESIGN & MOBILE

### 14.1 Mobile View (< 768px)
- [ ] **TC-269:** Open site on mobile device or resize browser
- [ ] **TC-270:** Verify sidebar collapses to hamburger menu
- [ ] **TC-271:** Verify hamburger menu opens/closes
- [ ] **TC-272:** Verify all pages are scrollable
- [ ] **TC-273:** Verify buttons are touch-friendly
- [ ] **TC-274:** Verify forms are usable on mobile
- [ ] **TC-275:** Verify flashcards work on mobile
- [ ] **TC-276:** Verify voice recording works on mobile

### 14.2 Tablet View (768px - 1024px)
- [ ] **TC-277:** Test on tablet or resize browser
- [ ] **TC-278:** Verify layout adapts appropriately
- [ ] **TC-279:** Verify all features are accessible

---

## 15. PERFORMANCE & RELIABILITY

### 15.1 Page Load Times
- [ ] **TC-280:** Measure dashboard load time (should be < 3 seconds)
- [ ] **TC-281:** Measure flashcard generation time (should be < 10 seconds)
- [ ] **TC-282:** Measure transcription time for 30-second audio (should be < 15 seconds)
- [ ] **TC-283:** Verify no console errors on any page

### 15.2 Data Persistence
- [ ] **TC-284:** Create data (flashcards, lectures, etc.)
- [ ] **TC-285:** Refresh page
- [ ] **TC-286:** Verify data is still present
- [ ] **TC-287:** Logout and login again
- [ ] **TC-288:** Verify data is still present

### 15.3 Error Handling
- [ ] **TC-289:** Disconnect internet
- [ ] **TC-290:** Attempt to generate flashcards
- [ ] **TC-291:** Verify appropriate error message
- [ ] **TC-292:** Reconnect internet
- [ ] **TC-293:** Verify functionality resumes
- [ ] **TC-294:** Submit invalid form data
- [ ] **TC-295:** Verify validation errors are shown

---

## 16. SECURITY

### 16.1 Authentication Security
- [ ] **TC-296:** Verify password is not visible in network requests
- [ ] **TC-297:** Verify JWT token is used for API calls
- [ ] **TC-298:** Verify token expiration works
- [ ] **TC-299:** Attempt to access API without token - should fail
- [ ] **TC-300:** Verify CORS is properly configured

### 16.2 Data Privacy
- [ ] **TC-301:** Verify user can only see their own data
- [ ] **TC-302:** Attempt to access another user's lecture notes (via URL manipulation)
- [ ] **TC-303:** Verify access is denied
- [ ] **TC-304:** Verify sensitive data is not exposed in client-side code

---

## 17. CROSS-BROWSER COMPATIBILITY

### 17.1 Chrome
- [ ] **TC-305:** Run all critical tests in Chrome
- [ ] **TC-306:** Verify no browser-specific issues

### 17.2 Firefox
- [ ] **TC-307:** Run all critical tests in Firefox
- [ ] **TC-308:** Verify no browser-specific issues

### 17.3 Safari
- [ ] **TC-309:** Run all critical tests in Safari
- [ ] **TC-310:** Verify no browser-specific issues

### 17.4 Edge
- [ ] **TC-311:** Run all critical tests in Edge
- [ ] **TC-312:** Verify no browser-specific issues

---

## 18. AI FUNCTIONALITY

### 18.1 Gemini AI Integration
- [ ] **TC-313:** Verify flashcards use real AI (not mock data)
- [ ] **TC-314:** Verify transcription uses real AI
- [ ] **TC-315:** Verify AI Navigator uses real AI (if langgraph available)
- [ ] **TC-316:** Test with various topics/content
- [ ] **TC-317:** Verify responses are contextually relevant
- [ ] **TC-318:** Verify no "mock" or "demo" text in responses

### 18.2 AI Error Handling
- [ ] **TC-319:** Test with very long input (> 5000 words)
- [ ] **TC-320:** Verify appropriate handling or error message
- [ ] **TC-321:** Test with special characters/emojis
- [ ] **TC-322:** Verify AI handles gracefully

---

## 19. ACCESSIBILITY

### 19.1 Keyboard Navigation
- [ ] **TC-323:** Navigate entire site using only keyboard (Tab, Enter, Esc)
- [ ] **TC-324:** Verify all interactive elements are reachable
- [ ] **TC-325:** Verify focus indicators are visible

### 19.2 Screen Reader
- [ ] **TC-326:** Test with screen reader (NVDA, JAWS, or VoiceOver)
- [ ] **TC-327:** Verify all content is readable
- [ ] **TC-328:** Verify form labels are announced
- [ ] **TC-329:** Verify buttons have descriptive labels

### 19.3 Color Contrast
- [ ] **TC-330:** Verify text has sufficient contrast ratio (WCAG AA)
- [ ] **TC-331:** Verify interactive elements are distinguishable

---

## 20. EDGE CASES

### 20.1 Empty States
- [ ] **TC-332:** New user with no data - verify empty states are shown
- [ ] **TC-333:** Delete all lectures - verify "No saved lectures" message
- [ ] **TC-334:** No chat history - verify appropriate message

### 20.2 Maximum Limits
- [ ] **TC-335:** Create 50+ chat sessions
- [ ] **TC-336:** Verify performance doesn't degrade
- [ ] **TC-337:** Save 100+ lecture notes
- [ ] **TC-338:** Verify history loads correctly

### 20.3 Special Characters
- [ ] **TC-339:** Use special characters in course names (!@#$%^&*)
- [ ] **TC-340:** Use emojis in chat messages 😊🎓
- [ ] **TC-341:** Use non-English characters (中文, العربية, हिन्दी)
- [ ] **TC-342:** Verify all data is saved and displayed correctly

---


## 21. DEGREE ROADMAP
### 21.1 Roadmap Interaction
- [ ] **TC-343:** Navigate to Degree Roadmap
- [ ] **TC-344:** Verify unassigned requirements are listed
- [ ] **TC-345:** Verify semester grid is displayed
- [ ] **TC-346:** Drag course from audit to semester
- [ ] **TC-347:** Verify course moves and credits update
- [ ] **TC-348:** Click "AI Auto-Plan" button
- [ ] **TC-349:** Verify roadmap populates with suggested courses
- [ ] **TC-350:** Export roadmap as PDF (if interactive)

## 22. FACULTY PORTAL (SIGNALS)
### 22.1 Signal Creation
- [ ] **TC-351:** Login as Faculty
- [ ] **TC-352:** Navigate to Risk Analytics
- [ ] **TC-353:** Click "Raise Signal" on a student
- [ ] **TC-354:** Select "Attendance" issue
- [ ] **TC-355:** Click "AI Auto-Draft"
- [ ] **TC-356:** Verify supportive email is generated
- [ ] **TC-357:** Send signal
- [ ] **TC-358:** Verify success message

## 23. ADMIN SMART OUTREACH
### 23.1 Campaign Management
- [ ] **TC-359:** Login as Admin
- [ ] **TC-360:** Navigate to Smart Outreach tab
- [ ] **TC-361:** Filter cohort by GPA < 2.5
- [ ] **TC-362:** Verify student count updates
- [ ] **TC-363:** Compose nudge message
- [ ] **TC-364:** Toggle "AI Agent Handling" on
- [ ] **TC-365:** Launch campaign
- [ ] **TC-366:** Verify live dashboard appears

## TEST EXECUTION SUMMARY

**Total Test Cases:** 366
**Execution Date:** _____________  
**Tester Name:** _____________  
**Environment:** Production / Staging / Local  

### Results Summary
- **Total Passed:** _____ / 366
- **Total Failed:** _____ / 366
- **Blocked:** _____ / 366
- **Not Executed:** _____ / 366

### Critical Issues Found
1. _____________________________________________
2. _____________________________________________
3. _____________________________________________

### Notes
_____________________________________________
_____________________________________________
_____________________________________________

---

## AUTOMATION RECOMMENDATIONS

**High Priority for Automation:**
- Authentication flows (TC-001 to TC-018)
- Flashcard generation (TC-054 to TC-079)
- Lecture note saving and retrieval (TC-100 to TC-132)
- API endpoint tests
- Data persistence tests
- Degree Roadmap Drag & Drop (TC-343 to TC-350)
- Faculty Signal AI Drafting (TC-355)

**Tools Recommended:**
- **E2E Testing:** Playwright or Cypress
- **API Testing:** Pytest with requests library
- **Performance:** Lighthouse CI
- **Accessibility:** axe-core

---

## MAINTENANCE

**Review Frequency:** Weekly  
**Update Trigger:** New feature deployment  
**Owner:** QA Team / Development Team

**Version History:**
- v1.0 (Dec 29, 2025) - Initial master test case list
- v1.1 (Dec 30, 2025) - Added Degree Roadmap, Faculty Signals, Admin Outreach
