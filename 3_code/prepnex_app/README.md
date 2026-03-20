# prepnex.aumtech.ai | Elite College Pathfinder

This is the standalone **PrepNex** system, a 6th-12th grade personal trajectory engine. It leverages **Vesta Intelligence** to project high-school performance into elite university admissions.

---

## **1. Project Metadata**
*   **Subdomain:** `prep.aumtech.ai`
*   **A.I. Persona:** **Vesta** (6-12th Grade Pathfinder)
*   **Active Database:** [Supabase Project](https://gwqikdtwmtwwcmahlpsg.supabase.co)

---

## **2. Vercel Deployment Guide**

### **Step 1: Environment Variables**
When deploying this repository to Vercel, you **MUST** configure the following Environment Variables:

| Variable | Current Value / Source |
| :--- | :--- |
| `SUPABASE_URL` | `https://gwqikdtwmtwwcmahlpsg.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | *Use your New Project Service Role Key* |
| `GOOGLE_GEMINI_API_KEY` | *Share the Aura AI Key* |

### **Step 2: Database Initialization (REQUIRED)**
You must run the following scripts in your Supabase SQL Editor:
1.  **`docs/PREPNEX_DB_SCHEMA.sql`**: Creates tables in the `public` schema.
2.  **`docs/PREPNEX_SEED_DATA.sql`**: Populates student profiles.

> [!IMPORTANT]
> To resolve "Invalid Schema" errors, the application now defaults to the **`public`** schema. Ensure you re-run these scripts if you were previously using a custom `prepnex` schema.

---

## **3. Features Sync**
*   **Vesta Hub:** Live strategic chat hub for 7-year roadmaps.
*   **Sync Logic:** Full read/write persistence to Supabase via `src/PREPNEX_VESTA_LOGIC.js`.
*   **Styling:** 100% parity with legacy `aumtech.ai` using **lowercase "a" branding** and the **3D Glassmorphic "a" logo**.

---
*Developed by aumtech.ai • PrepNex Segment • 2026*
