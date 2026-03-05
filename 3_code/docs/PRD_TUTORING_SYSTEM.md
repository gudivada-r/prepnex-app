# Product Requirements Document (PRD): University-Wide Intelligent Tutoring System

**Version:** 1.1
**Status:** Draft
**Last Updated:** 2026-01-06

---

## 1. Executive Summary
This document outlines the requirements for a closed-loop, university-wide tutoring application. Unlike generic tutoring marketplaces, this system is strictly coupled to the university's academic roster, ensuring that students can only seek help for courses they are currently enrolled in, and only from authorized teaching teams (Faculty, Instructors, TAs). The system aims to democratize access to academic support while providing administration with critical signals regarding curriculum difficulty and resource efficacy.

### Core Directive
**"Roster Truth"**: The system ignores user claims about enrollment and relies 100% on the Student Information System (SIS) integration. A student cannot book "Chemistry 101" unless the registrar says they are enrolled in "Chemistry 101".

---

## 2. Product Architecture & Philosophy

### 2.1 The "Closed-Loop" Model
*   **Restricted Access**: Service is available only to active students.
*   **Restricted Mapping**: Students are strictly mapped to the TAs/Faculty assigned to their specific course section (or generated "Help Centers" for large multi-section courses).
*   **Accountability**: Every session is logged, tracked, and FERPA-compliant.

### 2.2 User Personas
1.  **Student**: Seeks immediate or scheduled help for enrolled courses.
2.  **Tutor (Faculty/TA)**: Provides support; needs to manage availability and avoid burnout.
3.  **Administrator (Dean/Dept Head)**: Needs high-level analytics on course struggle points and resource utilization.
4.  **System Admin**: Manages the LTI integrations and RBAC policies.

---

## 3. User Stories

### 3.1 Student Stories
*   **US 1.1**: As a Student, I want to see *only* the courses I am actively enrolled in so that I don't accidentally book a tutor for a class I dropped.
*   **US 1.2**: As a Student, I want to book a 15-minute "Quick Help" slot for tomorrow so that I can get unstuck on my assignment before the deadline.
*   **US 1.3**: As a Student, I want to upload a photo of my math problem when booking so that the TA knows exactly where I'm struggling before I walk in.
*   **US 1.4**: As a Student, I want to see if my favorite TA has availability, but if not, easily book any available TA for that course.

### 3.2 Faculty/TA Stories
*   **US 2.1**: As a Faculty member, I want to set "Open Office Hours" where students can drop in without an appointment, and a "Queue" system manages the line digitally.
*   **US 2.2**: As a TA, I want to designate specific slots for "Midterm Review" so that students know this is the best time to ask exam questions.
*   **US 2.3**: As a TA, I want to see the "Problem Description" and photos submitted by the student *before* the session starts so I can prepare the necessary materials.
*   **US 2.4**: As a Faculty member, I want to block out time on my calendar that automatically removes availability from the tutoring app to prevent double-booking.

### 3.3 Dean/Admin Stories
*   **US 3.1**: As a Department Dean, I want to see a heatmap of which courses have the highest tutoring demand so I can allocate more budget for TAs in those subjects.
*   **US 3.2**: As an Admin, I want to ensure that TAs for "Physics 101" cannot see the student records or booking history for "English 202" to maintain strict FERPA compliance.

---

## 4. Key Functional Requirements

### 4.1 Identity & Access Management (IAM)
*   **SSO Integration**: Must support SAML 2.0 or OIDC (Shibboleth/Okta/Azure AD) to use university credentials.
*   **LTI 1.3 Advantage Integration**:
    *   The app will function as an LTI Tool Provider.
    *   **Automatic Roster Sync**: When a user logs in, the app queries the LMS (Canvas/Blackboard) or SIS for current enrollment.
    *   **Role Mapping**: Auto-assigns 'Student' or 'Tutor' roles based on the course context.

### 4.2 The Student View
*   **"My Courses" Dashboard**: Auto-populated list of current enrollments. No search bar for random courses.
*   **Booking Flow**:
    1.  Select Course (e.g., "CS 101").
    2.  Select Type: "Quick Help" (Next available TA) or "specific Faculty" (if allowed).
    3.  **Triage/Pre-submission (Mandatory)**:
        *   User must upload a photo of the problem or describe the issue.
        *   *AI Feature*: System helps categorize the issue (e.g., "Syntax Error", "Logic Problem", "Exam Prep").
    4.  Confirm Slot.
*   **Notification**: Calendar invite auto-sent to student university email.

### 4.3 The Tutor View (Faculty/TA)
*   **Availability Management**:
    *   **"Open Hours"**: Drop-in blocks (e.g., "I'm in the lab 2 PM - 4 PM").
    *   **"Appointment Slots"**: Specific 15/30 min blocks.
*   **Topic Signalling**: Capability to tag slots with topics (e.g., "Reserved for Midterm Prep", "Project 1 Help").
*   **Session Queue**: For "Open Hours", a digital queue view of students waiting, with their pre-submitted problem visible.

### 4.4 The Triage & Intelligence System
*   **AI Pre-Analysis**: When a student uploads a problem photo, Gemini (or similar LLM) analyzes it to provide the Tutor with a summary *before* the session starts.
*   **Load Balancing ("Round Robin")**:
    *   For large courses (Intro Chem, CS 101) with pooled TAs.
    *   Student requests time; System assigns the least-utilized available TA for that slot.
    *   Prevents "Favorite TA" burnout.

### 4.5 Analytics Dashboard (Dean's View)
*   **Heatmaps**: Which courses have the highest tutoring demand? (Signal: Is the curriculum too hard? Is the Professor unclear?)
*   **Peak Times**: usage utilization graphs to optimize TA scheduling.
*   **Impact Correlation**: (Future State) Correlate tutoring attendance with grade improvement.

---

## 5. Technical Architecture Recommendations

### 5.1 Tech Stack
*   **Frontend**: React (Vite) + Tailwind CSS.
    *   *Why*: Responsive, fast, consistent with modern university app standards.
*   **Backend**: Python (FastAPI).
    *   *Why*: Excellent for async operations, AI integration, and robust typing.
*   **Database**: PostgreSQL.
    *   *Why*: Relational integrity is critical for mapping Students <-> Sections <-> Courses <-> Tutors.
*   **Task Queue**: Redis + Celery.
    *   *Why*: Needed for background roster syncs and email notifications.

### 5.2 Data Schema (Simplified)
*   **Users**: `id`, `university_id`, `role`
*   **Courses**: `id`, `code` (e.g. CS101), `term_id`
*   **Sections**: `id`, `course_id`, `instructor_id`
*   **Enrollments**: `user_id`, `section_id`, `role` (Student/TA)
*   **Appointments**: `id`, `student_id`, `tutor_id`, `start_time`, `status`, `triage_data`

### 5.3 Security & FERPA Compliance
*   **Row-Level Security (RLS)**: Enforced at the database or ORM level. A tutor can *only* query appointments associated with sections they teach.
*   **Data Minimization**: Do not store grades or sensitive financial data. Only store ensuring enrollment status.
*   **Audit Logs**: Immutable log of who accessed what student record and when.

---

## 6. Feature Roadmap for MVP

### Phase 1: The Core Loop (Weeks 1-4)
*   SSO Integration (Mock university login for dev).
*   Data Model implementation (Users, Courses, Enrollments).
*   Manual Roster Upload (for testing) or CSV import.
*   Basic Student Booking Flow (Select Course -> Select Time).
*   Basic Tutor Dashboard (Set Availability).

### Phase 2: Roster Truth & Triage (Weeks 5-8)
*   LTI/LMS Integration for real-time Roster Sync.
*   "Triage" interface: Photo upload + Problem description.
*   Email Notifications (SMTP/SendGrid).

### Phase 3: Intelligence & Scale (Weeks 9-12)
*   "Round Robin" Load Balancing logic for large courses.
*   Dean’s Analytics Dashboard.
*   AI integration to summarize student problems for Tutors.

---
**Prepared by:** Antigravity (Senior Product Manager & Systems Architect)
