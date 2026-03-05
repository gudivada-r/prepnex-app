# Student Success Navigator - Enterprise Database Strategy

To migrate your application to a stable, multi-tenant enterprise database system where customers (Universities) are strictly isolated, I recommend **Option 2: Schema-per-Tenant**. 

This approach offers the best balance of isolation, performance, and manageability without the extreme cost of managing thousands of separate database instances.

## Comparison of Strategies

| Feature | 1. Row Level Security (RLS) | 2. Schema-per-Tenant (Recommended) | 3. Database-per-Tenant |
| :--- | :--- | :--- | :--- |
| **Isolation Level** | Logical (Weakest) | Logical + Namespace (Strong) | Physical/Process (Strongest) |
| **"They don't talk"** | Risk of developer error | **Strict Data Boundary** | Strict Permissions Boundary |
| **Cost** | $ (Single DB) | $ (Single DB) | $$$ (Many DB instances) |
| **Migrations** | Easy (1 migration) | Moderate (Run for each schema) | Hard (Run for each DB) |
| **Scalability** | Good for < 1M rows | Excellent for B2B | Hardest to manage |

---

## The Solution: AWS RDS (Postgres) + Schema-Based Multitenancy

Replace Neon (Serverless) with **AWS RDS for PostgreSQL** (or Google Cloud SQL / Azure Database for PostgreSQL). This gives you the "Stable Enterprise" SLA, backups, and compliance (SOC2/HIPAA) universities often require.

### How it works:
1.  **One Database Instance**: You pay for one robust RDS instance (e.g., `db.t3.medium`).
2.  **Multitenancy**:
    *   **Customer A (Harvard)** -> `schema: harvard`
    *   **Customer B (MIT)** -> `schema: mit`
    *   **Shared Data** (e.g., Global config) -> `schema: public`
3.  **Isolation**:
    *   Postgres permissions ensure the `harvard` user CANNOT access the `mit` schema.
    *   "They don't talk to each other" is enforced by the database engine.

---

## Migration Steps

### 1. Provision Enterprise Database
*   **Provider**: AWS RDS (recommended) or Google Cloud SQL.
*   **Version**: PostgreSQL 16+.
*   **Config**: Enable "IAM Authentication" or "SCRAM-SHA-256" for security.
*   **New URL**: `postgresql://user:pass@ss-prod.cluster-xyz.us-east-1.rds.amazonaws.com:5432/studentsuccess`

### 2. Update Backend Code (@ `app/auth.py` and `app/db.py`)

You need a "Tenant Middleware" that intercepts requests and switches the Postgres Schema.

**Step A: Define Tenant**
Each university gets a unique subdomain (e.g., `harvard.studentsuccess.ai`) or a Header (`X-Tenant-ID`).

**Step B: Middleware Logic (Pseudocode)**
```python
@app.middleware("http")
async def tenant_middleware(request: Request, call_next):
    # 1. Identify Tenant
    host = request.headers.get("host", "")
    tenant_name = host.split(".")[0] # e.g. "harvard"
    
    # 2. Set Schema for this Request
    # SQLAlchemy: "SET search_path TO harvard"
    request.state.tenant = tenant_name
    
    response = await call_next(request)
    return response
```

**Step C: Update Database Connection**
In `app/auth.py`, modify the engine connection args to support schema switching (or do it per-session).

```python
# Create one engine, but configure the session to check tenant
def get_session(request: Request):
    tenant_schema = request.state.tenant
    
    # "SET search_path" ensures all queries only see this tenant's tables
    with engine.connect() as connection:
        connection.execute(text(f"SET search_path TO {tenant_schema}"))
        with Session(bind=connection) as session:
            yield session
```

### 3. Data Migration (The "Replace" part)
Since you are currently using `User.id` (Integer) across all tables, migration is cleaner if you export data and import it into the new schemas.

1.  **Dump Data**: `pg_dump -t user -t course ... neon_db_url > dump.sql`
2.  **Create Schemas**: 
    ```sql
    CREATE SCHEMA harvard;
    CREATE SCHEMA mit;
    ```
3.  **Restore**: Import data into the respective schemas.

## Why NOT pure "Database per Customer"?
Creating 100 separate databases (Physical DBs) creates connection pool limits. A standard Postgres server can handle ~500-100 connections. If you have 50 customers with 20 connections each, you crash the server. **Schemas** share the connection pool but keep data separate.

## Summary Checklist
1. [ ] **Purchase**: Spin up AWS RDS PostgreSQL.
2. [ ] **Refactor**: Update `get_session` in FastAPI to set `search_path`.
3. [ ] **Migrate**: Run Alembic migrations for *each* schema.
4. [ ] **Switch**: Change `DATABASE_URL` in `.env` to the new RDS endpoint.
