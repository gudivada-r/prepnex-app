import os
from faker import Faker
import psycopg2
from psycopg2.extras import execute_values
import uuid
import random
from datetime import datetime, timedelta

fake = Faker()
Faker.seed(42)
random.seed(42)

# Load connection string from environment or prompt
DB_URL = os.getenv("DATABASE_URL")
if not DB_URL:
    print("❌ Critical Error: DATABASE_URL not found in environment.")
    print("Please set your Supabase Postgres Connection String as DATABASE_URL.")
    exit(1)

def get_connection():
    try:
        conn = psycopg2.connect(DB_URL)
        return conn
    except Exception as e:
        print(f"Failed to connect to database: {e}")
        exit(1)

def build_schema(cur):
    print("🏗️  Building EdNex Modular Schema...")
    
    # Enable UUID extension
    cur.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")

    schema_sql = """
    --------------------------------------------------------
    -- MOD-00: Identity & Access Management (EdNex Core)
    --------------------------------------------------------
    CREATE TABLE IF NOT EXISTS mod00_institutions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        domain VARCHAR(100) UNIQUE NOT NULL,
        settings JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS mod00_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        institution_id UUID REFERENCES mod00_institutions(id) ON DELETE CASCADE,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'advisor', 'admin', 'faculty')),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    --------------------------------------------------------
    -- MOD-01: Student Information System (SIS DataStream)
    --------------------------------------------------------
    CREATE TABLE IF NOT EXISTS mod01_programs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        institution_id UUID REFERENCES mod00_institutions(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        degree_type VARCHAR(100) NOT NULL,
        required_credits INT NOT NULL DEFAULT 120
    );

    CREATE TABLE IF NOT EXISTS mod01_student_profiles (
        user_id UUID PRIMARY KEY REFERENCES mod00_users(id) ON DELETE CASCADE,
        external_student_id VARCHAR(50) UNIQUE NOT NULL, -- e.g. Banner ID
        program_id UUID REFERENCES mod01_programs(id) ON DELETE SET NULL,
        enrollment_status VARCHAR(50) DEFAULT 'Enrolled',
        cumulative_gpa NUMERIC(4,3) DEFAULT 0.000,
        credits_earned INT DEFAULT 0,
        academic_standing VARCHAR(50) DEFAULT 'Good Standing',
        expected_graduation DATE,
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    --------------------------------------------------------
    -- MOD-02: Financial Systems (Finance DataStream)
    --------------------------------------------------------
    CREATE TABLE IF NOT EXISTS mod02_student_accounts (
        student_id UUID PRIMARY KEY REFERENCES mod01_student_profiles(user_id) ON DELETE CASCADE,
        tuition_balance NUMERIC(10,2) DEFAULT 0.00,
        fees_balance NUMERIC(10,2) DEFAULT 0.00,
        financial_aid_award NUMERIC(10,2) DEFAULT 0.00,
        payment_due_date DATE,
        has_financial_hold BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS mod02_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID REFERENCES mod01_student_profiles(user_id) ON DELETE CASCADE,
        amount NUMERIC(10,2) NOT NULL,
        transaction_type VARCHAR(50) NOT NULL, -- 'Tuition Charge', 'Payment', 'Aid Disbursement'
        description VARCHAR(255),
        transaction_date TIMESTAMPTZ DEFAULT NOW()
    );

    --------------------------------------------------------
    -- MOD-03: Advisor & Student Success (Advisor DataStream)
    --------------------------------------------------------
    CREATE TABLE IF NOT EXISTS mod03_advisors (
        user_id UUID PRIMARY KEY REFERENCES mod00_users(id) ON DELETE CASCADE,
        department VARCHAR(100),
        capacity INT DEFAULT 50,
        current_load INT DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS mod03_advising_appointments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID REFERENCES mod01_student_profiles(user_id) ON DELETE CASCADE,
        advisor_id UUID REFERENCES mod03_advisors(user_id) ON DELETE CASCADE,
        appointment_date TIMESTAMPTZ NOT NULL,
        status VARCHAR(50) DEFAULT 'Scheduled',
        meeting_notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS mod03_intervention_flags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID REFERENCES mod01_student_profiles(user_id) ON DELETE CASCADE,
        flag_type VARCHAR(100) NOT NULL, -- e.g. 'Low Attendance', 'Failing Midterm'
        severity VARCHAR(50) DEFAULT 'Medium',
        is_resolved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        resolved_at TIMESTAMPTZ
    );

    --------------------------------------------------------
    -- MOD-04: Course Catalog & LMS (Catalog DataStream)
    --------------------------------------------------------
    CREATE TABLE IF NOT EXISTS mod04_courses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        institution_id UUID REFERENCES mod00_institutions(id) ON DELETE CASCADE,
        course_code VARCHAR(20) NOT NULL,
        title VARCHAR(200) NOT NULL,
        credits INT NOT NULL DEFAULT 3,
        description TEXT
    );

    CREATE TABLE IF NOT EXISTS mod04_sections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        course_id UUID REFERENCES mod04_courses(id) ON DELETE CASCADE,
        term VARCHAR(50) NOT NULL,
        professor_id UUID REFERENCES mod00_users(id) ON DELETE SET NULL,
        schedule VARCHAR(100) -- e.g. "MWF 10:00-11:00"
    );

    CREATE TABLE IF NOT EXISTS mod04_enrollments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID REFERENCES mod01_student_profiles(user_id) ON DELETE CASCADE,
        section_id UUID REFERENCES mod04_sections(id) ON DELETE CASCADE,
        midterm_grade VARCHAR(5),
        final_grade VARCHAR(5),
        absence_count INT DEFAULT 0,
        UNIQUE(student_id, section_id)
    );

    --------------------------------------------------------
    -- MOD-05: Career Pathways (Career DataStream)
    --------------------------------------------------------
    CREATE TABLE IF NOT EXISTS mod05_companies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) NOT NULL,
        industry VARCHAR(100),
        partner_level VARCHAR(50) DEFAULT 'Standard'
    );

    CREATE TABLE IF NOT EXISTS mod05_jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES mod05_companies(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        job_type VARCHAR(50) NOT NULL, -- 'Internship', 'Full-time'
        description TEXT,
        posted_date DATE DEFAULT CURRENT_DATE
    );

    CREATE TABLE IF NOT EXISTS mod05_applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        student_id UUID REFERENCES mod01_student_profiles(user_id) ON DELETE CASCADE,
        job_id UUID REFERENCES mod05_jobs(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'Applied',
        applied_date DATE DEFAULT CURRENT_DATE,
        UNIQUE(student_id, job_id)
    );
    """
    cur.execute(schema_sql)
    print("✅ Schema built successfully.")


def seed_data(cur):
    print("🌱 Seeding data for complex institution 'TXU.edu'...")

    # Institution
    inst_id = str(uuid.uuid4())
    cur.execute(
        "INSERT INTO mod00_institutions (id, name, domain) VALUES (%s, %s, %s) ON CONFLICT (domain) DO NOTHING",
        (inst_id, "Texas University Example", "txu.edu")
    )
    # Fetch actual inst ID assuming it was inserted or exists
    cur.execute("SELECT id FROM mod00_institutions WHERE domain = 'txu.edu'")
    inst_id = cur.fetchone()[0]

    # Programs
    programs = []
    for deg in ["Computer Science", "Business Admin", "Nursing", "Mechanical Engineering", "Psychology"]:
        prog_id = str(uuid.uuid4())
        cur.execute(
            "INSERT INTO mod01_programs (id, institution_id, name, degree_type) VALUES (%s, %s, %s, %s)",
            (prog_id, inst_id, deg, "Bachelor of Science" if "Science" in deg or "Engineering" in deg else "Bachelor of Arts")
        )
        programs.append(prog_id)

    # Advisors & Faculty
    print("   -> Creating Advisors & Faculty...")
    advisor_ids = []
    faculty_ids = []
    
    for i in range(5):
        adv_uid = str(uuid.uuid4())
        cur.execute(
            """INSERT INTO mod00_users (id, institution_id, email, password_hash, role, first_name, last_name) 
               VALUES (%s, %s, %s, %s, 'advisor', %s, %s)""",
            (adv_uid, inst_id, fake.email(domain="txu.edu"), "hashedpw", fake.first_name(), fake.last_name())
        )
        cur.execute(
            "INSERT INTO mod03_advisors (user_id, department) VALUES (%s, %s)",
            (adv_uid, "Student Success Center")
        )
        advisor_ids.append(adv_uid)

    for i in range(10):
        fac_uid = str(uuid.uuid4())
        cur.execute(
            """INSERT INTO mod00_users (id, institution_id, email, password_hash, role, first_name, last_name) 
               VALUES (%s, %s, %s, %s, 'faculty', %s, %s)""",
            (fac_uid, inst_id, fake.email(domain="txu.edu"), "hashedpw", fake.first_name(), fake.last_name())
        )
        faculty_ids.append(fac_uid)

    # Courses & Sections
    print("   -> Creating Course Catalog...")
    section_ids = []
    for c in ["CS101", "MATH201", "BIO105", "ENG110", "PSY101"]:
        c_id = str(uuid.uuid4())
        cur.execute(
            "INSERT INTO mod04_courses (id, institution_id, course_code, title) VALUES (%s, %s, %s, %s)",
            (c_id, inst_id, c, f"Introduction to {c}")
        )
        for s in range(3): # 3 sections per course
            s_id = str(uuid.uuid4())
            cur.execute(
                "INSERT INTO mod04_sections (id, course_id, term, professor_id, schedule) VALUES (%s, %s, %s, %s, %s)",
                (s_id, c_id, "Fall 2026", random.choice(faculty_ids), "MWF 10AM")
            )
            section_ids.append(s_id)

    # Career Data
    print("   -> Creating Career Modules...")
    job_ids = []
    for i in range(5):
        comp_id = str(uuid.uuid4())
        cur.execute(
            "INSERT INTO mod05_companies (id, name, industry) VALUES (%s, %s, %s)",
            (comp_id, fake.company(), "Tech")
        )
        for j in range(2):
            job_id = str(uuid.uuid4())
            cur.execute(
                "INSERT INTO mod05_jobs (id, company_id, title, job_type) VALUES (%s, %s, %s, %s)",
                (job_id, comp_id, "Software Engineer Intern", "Internship")
            )
            job_ids.append(job_id)

    # 100 Students
    print("   -> Generating 100 Student Records...")
    students_to_insert = []
    profiles_to_insert = []
    accounts_to_insert = []
    fin_tx_to_insert = []
    adv_appts_to_insert = []
    enrollments_to_insert = []
    apps_to_insert = []

    for i in range(100):
        s_id = str(uuid.uuid4())
        fname = fake.first_name()
        lname = fake.last_name()
        email = f"{fname.lower()}.{lname.lower()}{i}@txu.edu"
        
        # User
        students_to_insert.append((s_id, inst_id, email, "hashedpw", "student", fname, lname))
        
        # Profile
        gpa = round(random.uniform(2.0, 4.0), 3)
        standing = "Good Standing" if gpa >= 2.5 else "Academic Probation"
        profiles_to_insert.append((s_id, f"TXU{10000+i}", random.choice(programs), "Enrolled", gpa, random.randint(15, 110), standing))
        
        # Finances
        balance = round(random.uniform(0, 5000), 2)
        has_hold = balance > 1000
        accounts_to_insert.append((s_id, balance, 150.0, 2000.0, "2026-10-01", has_hold))
        
        # Fin Transactions
        fin_tx_to_insert.append((str(uuid.uuid4()), s_id, 5000.00, "Tuition Charge", "Fall 2026 Tuition"))
        fin_tx_to_insert.append((str(uuid.uuid4()), s_id, -2000.00, "Aid Disbursement", "Federal Grant"))
        if not has_hold:
            fin_tx_to_insert.append((str(uuid.uuid4()), s_id, -(5000-balance), "Payment", "Card Payment"))

        # Advising
        if random.random() > 0.5:
            adv_appts_to_insert.append((str(uuid.uuid4()), s_id, random.choice(advisor_ids), datetime.now() + timedelta(days=random.randint(1,14)), "Scheduled", "Degree planning check-in"))

        # Enrollments
        for _ in range(random.randint(2, 4)):
            enrollments_to_insert.append((str(uuid.uuid4()), s_id, random.choice(section_ids), "A", "B+", random.randint(0,4)))

        # Career Apps
        if gpa > 3.0 and random.random() > 0.7:
            apps_to_insert.append((str(uuid.uuid4()), s_id, random.choice(job_ids), "Interviewing", datetime.now().date()))

    execute_values(cur, """INSERT INTO mod00_users (id, institution_id, email, password_hash, role, first_name, last_name) VALUES %s ON CONFLICT DO NOTHING""", students_to_insert)
    execute_values(cur, """INSERT INTO mod01_student_profiles (user_id, external_student_id, program_id, enrollment_status, cumulative_gpa, credits_earned, academic_standing) VALUES %s ON CONFLICT DO NOTHING""", profiles_to_insert)
    execute_values(cur, """INSERT INTO mod02_student_accounts (student_id, tuition_balance, fees_balance, financial_aid_award, payment_due_date, has_financial_hold) VALUES %s ON CONFLICT DO NOTHING""", accounts_to_insert)
    execute_values(cur, """INSERT INTO mod02_transactions (id, student_id, amount, transaction_type, description) VALUES %s""", fin_tx_to_insert)
    execute_values(cur, """INSERT INTO mod03_advising_appointments (id, student_id, advisor_id, appointment_date, status, meeting_notes) VALUES %s""", adv_appts_to_insert)
    
    # Need to handle ON CONFLICT for enrollments (unique section_id, student_id)
    execute_values(cur, """INSERT INTO mod04_enrollments (id, student_id, section_id, midterm_grade, final_grade, absence_count) VALUES %s ON CONFLICT (student_id, section_id) DO NOTHING""", enrollments_to_insert)
    execute_values(cur, """INSERT INTO mod05_applications (id, student_id, job_id, status, applied_date) VALUES %s ON CONFLICT (student_id, job_id) DO NOTHING""", apps_to_insert)

    print(f"🎉 Inserted exactly {len(students_to_insert)} student records for TXU.edu across ALL 6 modules!")

if __name__ == "__main__":
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            build_schema(cur)
            seed_data(cur)
            conn.commit()
            print("====================================")
            print("🚀 EdNex Complex DB Init Complete.")
            print("====================================")
    except Exception as e:
        conn.rollback()
        print(f"❌ Transaction rolled back due to error: {e}")
    finally:
        conn.close()
