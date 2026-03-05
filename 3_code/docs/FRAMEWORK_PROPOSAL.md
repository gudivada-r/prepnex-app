# The Navigator Stack: A Reusable AI-Agent Framework

**Concept:** A "White-Label" framework for building AI-powered companion apps that guide users through complex systems (Universities, Hospitals, Corporations, etc.).

## 1. Architecture Overview
The framework consists of four decoupled layers, allowing for easy customization:

### A. The "Glass" Shell (Frontend)
A responsive, mobile-first React shell featuring:
-   **Dynamic Dashboard:** A widget-based grid that adapts to user data (GPA -> Efficiency Score, Courses -> Projects).
-   **Unified Sidebar:** Configurable navigation that manages state switching.
-   **AI Chat Layer:** A persistent, context-aware chat interface ("The Navigator") that overlays the entire experience.
-   **Design System:** Reusable "Glassmorphism" UI components (Cards, Modals, Lists) that look premium on Web and Mobile.

### B. The "Nexus" Core (Backend)
A Python FastAPI engine designed for modularity:
-   **Identity Provider:** Unified `User` model with Auth/JWT handling.
-   **Signal Engine:** A generalized notification system (formally "Holds & Alerts") that can handle anything from "Tuition Due" to "Lab Results Ready".
-   **Double-Mount Routing:** Pre-configured for serverless deployment (Vercel) without path-stripping headaches.

### C. The Intelligence Layer (AI)
A plug-and-play AI module:
-   **Multi-Agent Router:** Easily swap specific agents.
    -   *Current:* Tutor, Admin, Coach.
    -   *New:* Nurse, Billing Specialist, Wellness Guide.
-   **Context Injection:** Standardized method for feeding DB records (Profile, History) into the LLM context window.

### D. The "Bridge" Pipeline (DevOps)
The crown jewel of reuse—a fully automated mobile factory:
-   **Capacitor Config:** Pre-set for "Write Once, Run Native".
-   **Fastlane Automation:** 
    -   `fastlane ios release`: One command to Sign, Build, and Upload.
    -   **CI/CD Workflows:** GitHub Actions pre-configured for Environment Setup, Notch Safety, and dependency management.

---

## 2. Reusability Strategy (How to Fork)

To turn this into a product factory, we standardize these three configuration points:

### Step 1: The Configuration Config (`navigator.config.json`)
Creating a central config file in the frontend to control the UI:
```json
{
  "theme": {
    "primary": "#4f46e5", 
    "glass_opacity": 0.9
  },
  "modules": {
    "academics": false,
    "health": true,
    "finance": true
  },
  "labels": {
    "dashboard_title": "Patient Portal",
    "ai_name": "Dr. AI"
  }
}
```

### Step 2: The Data Schema Abstraction
Rename specific models to generic ones in `models.py`:
-   `StudentHold` -> `ActionItem` (Type: Blocking, Warning, Info)
-   `Course` -> `Milestone` (Type: Class, Appointment, Project Phase)
-   `GPA` -> `PerformanceMetric` (Value, Label)

### Step 3: The AI Persona Injection
Abstract the system prompts into a database or config file:
-   *Instead of hardcoding "You are a Tutor...", load "SYSTEM_PROMPT_{MODE}" from config.*

---

## 3. Potential Spin-offs

| Application Type | User | "Courses" becomes... | "Holds" becomes... | "AI Coach" becomes... |
| :--- | :--- | :--- | :--- | :--- |
| **HealthNav** | Patient | Appointments / Meds | Lab Results / Bill Due | Care Coordinator |
| **CorpCompass** | Employee | OKRs / Projects | Compliance Training | HR Assistant |
| **WealthGuide** | Investor | Portfolios / Goals | Margin Call / Doc Sign | Financial Advisor |
| **CitizenOne** | Resident | Permits / Taxes | Voting Reg / Fines | Civic Guide |

## 4. Why This Has Value
You are not selling an "App"—you are selling the **Infrastructure of Engagement**.
Most companies have disjointed portals (Billing, scheduling, info). 
**The Navigator Stack** unifies these into a single, cohesive, AI-driven timeline.

### Immediate Action Item
Create a generic "Template" branch of this repo where specific "Student" terms are replaced with generic variables, creating your own SaaS starter kit.

## 5. The Mobile Factory (How "Push to iOS" works Reusably)
The most valuable part of this framework is the **Automated Mobile Pipeline** (`.github/workflows/ios-build.yml` + `fastlane/Fastfile`).

To reuse this for a new client (e.g., "HealthApps Inc."), you simply:
1.  **Swap Secrets:** Update `APPLE_TEAM_ID` and `APP_STORE_CONNECT_KEY` in GitHub Secrets.
2.  **Update Config:** Change the `appId` in `capacitor.config.json`.
3.  **Run Pipeline:** The system automatically:
    -   Regenerates the iOS Project (Clean Slate).
    -   Injects the **New Team ID** and **New Bundle ID** via `update_code_signing_settings`.
    -   Generates **New Icons** from the `resources/` folder.
    -   Selects the correct Xcode version.
    -   Uploads to the **New Client's TestFlight**.

**Zero XCode Touch:** You never have to open Xcode or manage certificates manually. The code handles the entire "Push to iOS" process programmatically.
