# Student Success Navigator — Data Architecture

**Version**: 1.1  
**Date**: March 6, 2026  
**Author**: AumTech AI Architecture Team  
**Status**: Draft for Review

---

## 1. Overview

The Student Success Navigator requires a robust, scalable data backbone that bridges institutional data systems with an AI-powered student-facing app. This document proposes a **three-layer hybrid architecture** designed to handle both structured data (grades, balances) and unstructured data (PDF syllabi, policies).

```
LAYER 1 — Integration Layer
  Institutions' source systems (APIs, SFTP, LMS) → EdNex (Central Staging Platform)

LAYER 2 — EdNex Hybrid Staging
  Structured Data → Relational Database (PostgreSQL)
  Unstructured Data → Object Storage (Files) & Vector Database (Embeddings)

LAYER 3 — Intelligence Layer
  EdNex → Context API / Semantic Search → LLM Engine
```

---

## 2. Naming Conventions

### 2.1 Central Staging Platform — **"EdNex"**

> *"The central convergence point where all institutional educational data flows meet, normalize, and become actionable intelligence."*

**EdNex** serves as the institution-agnostic data hub. It is a **multi-tenant cloud platform** — one EdNex instance serves multiple institutions simultaneously, each securely isolated via tenant IDs and Row-Level Security.

### 2.2 Data Modules inside EdNex — **"DataStreams"**

Each data domain within EdNex is called a **DataStream**. 

| DataStream Name    | Standard System Integrations | Data Contained (Structured + Unstructured) |
|--------------------|----------------------------|--------------------------------------------|
| **SIS Stream**     | Ellucian Banner, Colleague, Workday Student | Enrollment, GPA, standing, transcripts (PDF) |
| **Finance Stream** | Banner Finance, PeopleSoft | Financial aid status, balances, hold policies (Docs) |
| **Advisor Stream** | EAB Navigate, Starfish, Salesforce | Advisor notes, intervention flags, advising guides |
| **Catalog Stream** | Canvas LMS, Acalog | Course descriptions, full PDF syllabi, reading materials |

---

## 3. Institution-to-EdNex Integration Process

Institutions have wildly varying technical maturities. EdNex must support three distinct integration patterns to onboard any university:

### Pattern 1: API-Driven (Modern Institutions)
- **Mechanism**: Periodic pulling from modern REST/GraphQL APIs (e.g., Canvas, Workday Student).
- **Process**: Nightly Airbyte syncs pull incremental changes directly into EdNex.

### Pattern 2: SFTP Flat-File Drops (Legacy Core Institutions)
- **Mechanism**: Ellucian Banner or older SIS systems often cannot support high-load API queries. They export CSV/XML files nightly to a secure FTP server.
- **Process**:
  1. Institution uploads Daily Delta files (`students.csv`, `enrollments.csv`) to EdNex's hosted SFTP.
  2. Cloud function detects new files.
  3. ETL engine parses, validates, and loads data into the PostgreSQL structured tables.

### Pattern 3: Unstructured Document Ingestion
- **Mechanism**: Institutions provide handbooks, financial aid policy PDFs, and syllabi.
- **Process**:
  1. Files are uploaded via an Admin Portal or automated SFTP sync.
  2. PDF/Doc is saved directly to **Object Storage (S3/Supabase Storage)** to maintain the original file.
  3. A background worker (e.g., Langchain Document Loader) parses the text, chunks it, creates semantic embeddings (via OpenAI/Gemini), and stores the vectors in a **Vector Database (pgvector)**.

---

## 4. Architecture Options (Hybrid Data Handling)

---

### Option A — The "Supabase Everything" Stack *(Pragmatic & Highly Recommended)*

**Best For**: Speed to market, low operational overhead, built-in hybrid support.

This architecture leverages the fact that modern PostgreSQL (Supabase) can handle *all three* requirements: Relational Data, File Storage, and Vector Embeddings (via the `pgvector` extension).

#### Key Technology Stack

| Capability          | EdNex Implementation                       | Function |
|---------------------|--------------------------------------------|----------|
| Integration Layer   | Airbyte Cloud (API) + AWS Transfer (SFTP)  | Get data out of the institution |
| Structured DB       | Supabase (PostgreSQL)                      | Store rows: Users, GPAs, balances |
| File/Blob Storage   | Supabase Storage (S3-compatible)           | Store actual PDFs of syllabi and policies |
| Vector Database     | Supabase (`pgvector` extension)            | Store vector embeddings for RAG (Search) |
| Document Parser     | Python background worker (Celery/Render)   | Extracts text from PDFs inside Object Storage |
| API Layer           | FastAPI (Python)                           | The bridge between the database and the App |

```mermaid
flowchart TD
  %% Diagram logic represented in documentation
```

#### Why Store Files AND Vectors?
If a student asks: *"What is the late policy for CS 101?"*
1. **Context API** checks `pgvector` for similarity matching against the syllabus text.
2. The LLM gets the chunk of text to formulate the answer.
3. The answer can include a *direct link* to download the original PDF syllabus sitting in **Supabase Object Storage**, giving the student a verifiable source.

#### Pros & Cons
- ✅ **Pros**: Only one database system to manage. Zero infrastructure complexity. Extremely fast iteration. Built-in Row-Level Security for multi-tenant data separation.
- ❌ **Cons**: `pgvector` isn't quite as fast as dedicated vector DBs (like Pinecone) at massive scale (millions of documents), though entirely sufficient for <50 institutions.

---

### Option B — Best-in-Breed Distributed Stack *(Enterprise Scale)*

**Best For**: Handling hundreds of thousands of institutional documents and massive data lakes.

#### Key Technology Stack

| Capability          | EdNex Implementation                       | Function |
|---------------------|--------------------------------------------|----------|
| Structured DB       | Snowflake / Google BigQuery                | Massive warehouse for relational SIS data |
| File/Blob Storage   | AWS S3                                     | Infinite, cheap file storage |
| Vector Database     | Pinecone / Milvus                          | Dedicated, high-speed semantic search |
| API Layer           | FastAPI Microservices via Kubernetes       | Orchestration |

#### Pros & Cons
- ✅ **Pros**: Infinite scale. Pinecone handles vector search at lightning speed.
- ❌ **Cons**: Massive complexity. Moving data between Snowflake, S3, and Pinecone requires robust (and expensive) data engineering pipelines (Airflow/dbt).

---

## 5. The Intelligence Flow (LLM Context)

When a student interacts with the Navigator App, EdNex combines both structured and unstructured paths:

**User Prompt**: *"Can I register for biology next week if my tuition isn't fully paid?"*

**EdNex Context Assembly Process**:
1. **Structured Lookup (PostgreSQL)**: Fetch Student ID `123`'s Finance Stream data.
   - *Result*: `Current Balance: $400. Financial Hold: True.`
2. **Unstructured Lookup (Vector DB)**: Perform semantic search for "Financial Hold registration limits" tied to `Institution X`.
   - *Result*: Vector match found in `student_handbook_2025.pdf` chunk 42: *"Students with balances over $200 face a registration hold and cannot select courses."*
3. **Synthesis**: The API merges both into a JSON Context Object.
4. **LLM Execution**: The prompt injected to the LLM reads: 
   *"Context: Jane has a $400 balance and a hold. Handbook states >$200 prevents registration. Question: Can I register?"*

## 6. Recommendation

Start with **Option A (The "Supabase Everything" Stack)**. 

By using Supabase, EdNex gains an incredible advantage: **PostgreSQL + Object Storage + `pgvector` all live in the exact same infrastructure.** You do not need to stitch together S3, Pinecone, and a relational database. This makes building the hybrid structured/unstructured pipeline 3x faster and significantly cheaper, completely future-proofing you for the LLM era.

---

*Document stored in: `2_architecture/DATA_ARCHITECTURE.md`*
