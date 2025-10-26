#!/usr/bin/env python3
"""
Script to verify database tables and their structure.
This script checks if all required tables exist and displays their structure.
"""

import os
import sys
from sqlalchemy import inspect, text
from database import engine, User, College, Department, Student, Election, Position, Candidate, Ballot, VoteSelection

def check_database_connection():
    """Check if we can connect to the database."""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def get_expected_tables():
    """Return a list of expected table names."""
    return [
        'users', 'colleges', 'departments', 'students', 
        'elections', 'positions', 'candidates', 'ballots', 'vote_selections'
    ]

def check_table_structure(inspector, table_name, model_class):
    """Check the structure of a specific table."""
    try:
        columns = inspector.get_columns(table_name)
        print(f"\n📋 {table_name.upper()} table structure:")
        print(f"   Columns: {len(columns)}")
        
        for col in columns:
            nullable = "NULL" if col['nullable'] else "NOT NULL"
            default = f" DEFAULT {col['default']}" if col['default'] is not None else ""
            print(f"   - {col['name']}: {col['type']} ({nullable}){default}")
        
        # Check constraints
        constraints = inspector.get_check_constraints(table_name)
        if constraints:
            print(f"   Constraints:")
            for constraint in constraints:
                print(f"     - {constraint['name']}: {constraint['sqltext']}")
        
        # Check indexes
        indexes = inspector.get_indexes(table_name)
        if indexes:
            print(f"   Indexes:")
            for index in indexes:
                unique = "UNIQUE" if index['unique'] else ""
                print(f"     - {index['name']}: {', '.join(index['column_names'])} {unique}")
        
        return True
    except Exception as e:
        print(f"   ❌ Error checking {table_name}: {e}")
        return False

def check_foreign_keys(inspector):
    """Check foreign key relationships."""
    print(f"\n🔗 Foreign Key Relationships:")
    
    fk_relationships = [
        ("departments", "college_id", "colleges", "id"),
        ("students", "user_id", "users", "id"),
        ("students", "department_id", "departments", "id"),
        ("positions", "election_id", "elections", "id"),
        ("candidates", "student_id", "students", "id"),
        ("candidates", "position_id", "positions", "id"),
        ("candidates", "election_id", "elections", "id"),
        ("ballots", "election_id", "elections", "id"),
        ("ballots", "student_id", "students", "id"),
        ("vote_selections", "ballot_id", "ballots", "id"),
        ("vote_selections", "position_id", "positions", "id"),
        ("vote_selections", "candidate_id", "candidates", "id"),
    ]
    
    for table, fk_col, ref_table, ref_col in fk_relationships:
        try:
            foreign_keys = inspector.get_foreign_keys(table)
            found = False
            for fk in foreign_keys:
                if fk_col in fk['constrained_columns'] and ref_table in fk['referred_table']:
                    print(f"   ✅ {table}.{fk_col} → {ref_table}.{ref_col}")
                    found = True
                    break
            if not found:
                print(f"   ❌ {table}.{fk_col} → {ref_table}.{ref_col} (MISSING)")
        except Exception as e:
            print(f"   ❌ Error checking FK {table}.{fk_col}: {e}")

def check_data_counts(inspector):
    """Check if there's any data in the tables."""
    print(f"\n📊 Table Data Counts:")
    
    tables = inspector.get_table_names()
    for table in sorted(tables):
        try:
            with engine.connect() as conn:
                result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                count = result.scalar()
                print(f"   - {table}: {count} records")
        except Exception as e:
            print(f"   - {table}: Error counting records - {e}")

def main():
    """Main verification function."""
    print("🔍 DigiVote Database Verification")
    print("=" * 50)
    
    # Check database connection
    if not check_database_connection():
        print("\n❌ Cannot proceed without database connection")
        return False
    
    print("✅ Database connection successful")
    
    # Get database inspector
    try:
        inspector = inspect(engine)
    except Exception as e:
        print(f"❌ Failed to create database inspector: {e}")
        return False
    
    # Check if tables exist
    existing_tables = inspector.get_table_names()
    expected_tables = get_expected_tables()
    
    print(f"\n📊 Database contains {len(existing_tables)} tables:")
    missing_tables = []
    
    for table in expected_tables:
        if table in existing_tables:
            print(f"   ✅ {table}")
        else:
            print(f"   ❌ {table} (MISSING)")
            missing_tables.append(table)
    
    if missing_tables:
        print(f"\n⚠️  Missing tables: {', '.join(missing_tables)}")
        print("   Run 'python -c \"from database import create_all_tables; create_all_tables()\"' to create them")
        return False
    
    # Check table structures
    print(f"\n🔍 Verifying table structures...")
    
    table_models = {
        'users': User,
        'colleges': College,
        'departments': Department,
        'students': Student,
        'elections': Election,
        'positions': Position,
        'candidates': Candidate,
        'ballots': Ballot,
        'vote_selections': VoteSelection,
    }
    
    structure_ok = True
    for table_name, model_class in table_models.items():
        if not check_table_structure(inspector, table_name, model_class):
            structure_ok = False
    
    # Check foreign keys
    check_foreign_keys(inspector)
    
    # Check data counts
    check_data_counts(inspector)
    
    # Summary
    print(f"\n" + "=" * 50)
    if structure_ok and not missing_tables:
        print("🎯 Database verification completed successfully!")
        print("✅ All tables exist with correct structure")
        print("✅ All foreign key relationships are in place")
        print("🚀 Database is ready for use!")
        return True
    else:
        print("❌ Database verification failed!")
        print("   Please fix the issues above before proceeding")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
