# AI Agent Database Design Rulebook 🗄️

## 📌 Purpose

## 1. Project Context Reminder
* **Database Type:** Relational (e.g., MySQL)
* **Usage:** Backend services built in Node.js without ORM
* **AI Role:** Generate `CREATE TABLE`, `ALTER TABLE`, `INDEX`, and query examples

## 2. Design Principles & Naming

1. **Normalization:**
   we may need to add new features so accordingly you need denormalisation. 
2. **Consistent Naming Conventions:**
   * Tables: **singular** lowercase with underscores, e.g., `user`, `order_item`
   * Columns: lowercase with underscores, e.g., `created_at`, `user_id`
   * Primary keys: always `id` (auto-increment or UUID)
   * Foreign keys: `{referenced_table}_id`
3. **Data Types:** Choose smallest type that fits (e.g., `SMALLINT` vs `INT`, `VARCHAR(n)` with appropriate length).
4. **Timestamp Columns:** Include `created_at` and `updated_at` with `DATETIME` or `TIMESTAMP` and default values.

## 3. Indexing & Keys

1. **Primary Keys:** Single-column primary key named `id`.
2. **Foreign Keys:** Add `FOREIGN KEY` constraints with `ON DELETE` and `ON UPDATE` actions.
3. **Indexes:**
   * Index columns used in `WHERE`, `JOIN`, `ORDER BY`, and `GROUP BY` clauses.
   * Use **composite indexes** for multi-column filter patterns in queries.
   * Avoid over-indexing; each index adds write overhead.
4. **Unique Constraints:**
   * Enforce data integrity with `UNIQUE` constraints on natural keys (e.g., `email`, `username`).


## 4. Relationships & Joins
1. **One-to-Many:** Use a foreign key in the child table.
2. **Many-to-Many:** Create a join table with two foreign keys and a composite primary key.
3. **One-to-One:** Enforce with a unique foreign key in one of the tables.
4. **Eager vs Lazy Joins:** Suggest joining only needed tables for each query to optimize performance.

## 5. Query Optimization
1. **Select Only Needed Columns:** Avoid `SELECT *`.
2. **Pagination:** Use `LIMIT`/`OFFSET` or keyset pagination for large datasets.
3. **Prepared Statements:** Use parameterized queries to improve parsing and prevent injection.
4. **Explain Plans:** Recommend running `EXPLAIN` on complex queries and adjust indexes accordingly.

## 6. Data Integrity & Constraints
1. **NOT NULL:** Enforce on columns that must have values.
2. **CHECK Constraints:** Validate values (e.g., `CHECK (status IN ('active','inactive'))`).
3. **Default Values:** Set sensible defaults (e.g., `status = 'active'`).
4. **Triggers & Stored Procedures:** Avoid business logic in database; prefer application layer unless necessary for audit.

## 7. Migrations & Versioning
1. **Migration Scripts:** Generate reversible migrations (e.g., using SQL files or a tool).
2. **Version Control:** Keep migrations in source control, named sequentially (e.g., `001_create_user.sql`).
3. **Rollback Support:** Ensure every migration has a down script.


## 8. Security & Access Control
1. **Least Privilege:** Grant minimal permissions per role (e.g., read-only for reporting users).
2. **Encryption:** Use TLS for connections and consider column-level encryption for sensitive data.
3. **Password Storage:** Always store hashed passwords (e.g., `bcrypt`).
4. **Audit Fields:** Include `created_by`, `updated_by` if audit trails are required.

## 10. Documentation
2. **Data Dictionary:** Document each table and column meaning, type, and constraints.
3. **Query Examples:** Offer sample queries for common use cases (CRUD + reports).


## 11. What to Avoid
* Using ambiguous column names (e.g., `data`, `info`).
* Over-normalizing to more than 3NF without need.
* Excessive indexes on low-selectivity columns.
* Business logic inside triggers or stored procedures.
* Commit secrets or raw SQL logs to source control.

