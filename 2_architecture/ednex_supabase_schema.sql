-- ==========================================
-- EdNex Hybrid Data Architecture Setup
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Enable pgvector for semantic search (AI embeddings)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create the unified institution tenant table
CREATE TABLE IF NOT EXISTS institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create the central Student table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL, -- The ID from the SIS (e.g., banner ID)
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(institution_id, external_id)
);

-- ==========================================
-- STRUCTURED DATA (Option A Database layer)
-- ==========================================

-- SIS DataStream Table
CREATE TABLE IF NOT EXISTS sis_data (
  student_id UUID PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
  gpa NUMERIC(4,2),
  credit_hours_completed INTEGER DEFAULT 0,
  credit_hours_required INTEGER DEFAULT 120,
  major TEXT,
  academic_standing TEXT,
  expected_graduation_date DATE,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Finance DataStream Table
CREATE TABLE IF NOT EXISTS finance_data (
  student_id UUID PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
  aid_status TEXT,
  balance_owed NUMERIC(10,2) DEFAULT 0.00,
  financial_hold BOOLEAN DEFAULT FALSE,
  scholarships_jsonB JSONB DEFAULT '[]'::jsonb,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- UNSTRUCTURED DATA (Option A Vector Layer)
-- ==========================================

-- Store metadata about documents uploaded to Supabase Storage
CREATE TABLE IF NOT EXISTS ednex_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  storage_path TEXT NOT NULL, -- points to the file in Supabase storage
  document_type TEXT NOT NULL, -- e.g., 'syllabus', 'financial_policy'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Store the chunked vectors for the documents
CREATE TABLE IF NOT EXISTS ednex_document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES ednex_documents(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  embedding VECTOR(1536), -- 1536 is standard for OpenAI / Gemini text-embedding-3-small
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index the vectors for super-fast similarity search
CREATE INDEX ON ednex_document_chunks USING hnsw (embedding vector_cosine_ops);

-- ==========================================
-- DUMMY DATA FOR UI TESTING
-- ==========================================
-- 1. Insert a test institution
INSERT INTO institutions (id, name, domain) 
VALUES ('11111111-1111-1111-1111-111111111111', 'EdNex Demo University', 'demo.ednex.edu')
ON CONFLICT (domain) DO NOTHING;

-- 2. Insert a test student
INSERT INTO students (id, institution_id, external_id, first_name, last_name, email)
VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'STU001', 'Jane', 'Doe', 'jane.doe@demo.ednex.edu')
ON CONFLICT (email) DO NOTHING;

-- 3. Insert structured data
INSERT INTO sis_data (student_id, gpa, credit_hours_completed, major, academic_standing)
VALUES ('22222222-2222-2222-2222-222222222222', 3.8, 85, 'Computer Science', 'Good Standing')
ON CONFLICT (student_id) DO NOTHING;

INSERT INTO finance_data (student_id, aid_status, balance_owed, financial_hold)
VALUES ('22222222-2222-2222-2222-222222222222', 'Awarded', 450.00, true)
ON CONFLICT (student_id) DO NOTHING;

-- ==========================================
-- FUNCTION: Semantic Search
-- ==========================================
-- This function allows the FastAPI backend to query the vector DB easily
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  inst_id UUID
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  chunk_text TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ednex_document_chunks.id,
    ednex_document_chunks.document_id,
    ednex_document_chunks.chunk_text,
    1 - (ednex_document_chunks.embedding <=> query_embedding) AS similarity
  FROM ednex_document_chunks
  JOIN ednex_documents ON ednex_documents.id = ednex_document_chunks.document_id
  WHERE 
    ednex_documents.institution_id = inst_id 
    AND 1 - (ednex_document_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY ednex_document_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
