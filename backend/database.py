import os
from typing import Generator
from sqlalchemy import (
    create_engine,
    String,
    ForeignKey,
    UniqueConstraint,
    DateTime,
    Text,
    Boolean,
    CheckConstraint,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, sessionmaker, Session
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid


DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://postgres:1234@localhost:5432/digi-voter")

class Base(DeclarativeBase):
    pass


# Status constants
COLLEGE_STATUS_ACTIVE = "ACTIVE"
COLLEGE_STATUS_INACTIVE = "INACTIVE"

ELECTION_STATUS_UPCOMING = "UPCOMING"
ELECTION_STATUS_ACTIVE = "ACTIVE"
ELECTION_STATUS_COMPLETED = "COMPLETED"
ELECTION_STATUS_ARCHIVED = "ARCHIVED"


class User(Base):
    """Stores all registered individuals, including students and administrative users, and tracks their eligibility."""
    __tablename__ = "users"
    
    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=False), nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=False), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    student: Mapped["Student"] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")
    candidates: Mapped[list["Candidate"]] = relationship(back_populates="student", cascade="all, delete-orphan")


class College(Base):
    """Stores college/campus information."""
    __tablename__ = "colleges"
    
    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default=COLLEGE_STATUS_ACTIVE)

    # Relationships
    departments: Mapped[list["Department"]] = relationship(back_populates="college", cascade="all, delete-orphan")
    
    # Check constraint for valid status values
    __table_args__ = (
        CheckConstraint(
            f"status IN ('{COLLEGE_STATUS_ACTIVE}', '{COLLEGE_STATUS_INACTIVE}')",
            name="ck_college_status"
        ),
    )


class Department(Base):
    """Stores department information within colleges."""
    __tablename__ = "departments"
    
    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    college_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("colleges.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    # Relationships
    college: Mapped["College"] = relationship(back_populates="departments")
    students: Mapped[list["Student"]] = relationship(back_populates="department", cascade="all, delete-orphan")


class Student(Base):
    """Stores voter-specific details."""
    __tablename__ = "students"
    
    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    year_of_study: Mapped[str] = mapped_column(String(50), nullable=False)
    department_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("departments.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=False), nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=False), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="student")
    department: Mapped["Department"] = relationship(back_populates="students")
    candidates: Mapped[list["Candidate"]] = relationship(back_populates="student", cascade="all, delete-orphan")
    ballots: Mapped[list["Ballot"]] = relationship(back_populates="student", cascade="all, delete-orphan")


class Election(Base):
    """Defines core properties, timing, and scope of each voting event."""
    __tablename__ = "elections"
    
    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    election_year: Mapped[str] = mapped_column(String(10), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=False), nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=False), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default=ELECTION_STATUS_UPCOMING)
    is_anonymous_tally: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Relationships
    positions: Mapped[list["Position"]] = relationship(back_populates="election", cascade="all, delete-orphan")
    candidates: Mapped[list["Candidate"]] = relationship(back_populates="election", cascade="all, delete-orphan")
    ballots: Mapped[list["Ballot"]] = relationship(back_populates="election", cascade="all, delete-orphan")
    
    # Check constraint for valid status values
    __table_args__ = (
        CheckConstraint(
            f"status IN ('{ELECTION_STATUS_UPCOMING}', '{ELECTION_STATUS_ACTIVE}', '{ELECTION_STATUS_COMPLETED}', '{ELECTION_STATUS_ARCHIVED}')",
            name="ck_election_status"
        ),
    )


class Position(Base):
    """Defines the roles candidates run for within an election."""
    __tablename__ = "positions"
    
    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    election_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("elections.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    # Relationships
    election: Mapped["Election"] = relationship(back_populates="positions")
    candidates: Mapped[list["Candidate"]] = relationship(back_populates="position", cascade="all, delete-orphan")
    vote_selections: Mapped[list["VoteSelection"]] = relationship(back_populates="position", cascade="all, delete-orphan")


class Candidate(Base):
    """Stores information about users running for specific positions."""
    __tablename__ = "candidates"
    
    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    position_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("positions.id", ondelete="CASCADE"), nullable=False)
    election_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("elections.id", ondelete="CASCADE"), nullable=False)
    platform_statement: Mapped[str] = mapped_column(Text, nullable=True)
    photo_url: Mapped[str] = mapped_column(String(500), nullable=True)
    is_approved: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Relationships
    student: Mapped["Student"] = relationship(back_populates="candidates")
    position: Mapped["Position"] = relationship(back_populates="candidates")
    election: Mapped["Election"] = relationship(back_populates="candidates")
    vote_selections: Mapped[list["VoteSelection"]] = relationship(back_populates="candidate", cascade="all, delete-orphan")

    # Combined Index: (election_id, student_id) (Unique Index) - Prevents a candidate from applying for more than one position in one election
    __table_args__ = (
        UniqueConstraint("election_id", "student_id", name="uq_candidate_per_student_per_election"),
    )


class Ballot(Base):
    """Tracks who has voted in which election. The only place the voter's ID is directly linked to the act of voting."""
    __tablename__ = "ballots"
    
    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    election_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("elections.id", ondelete="CASCADE"), nullable=False)
    student_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=False), nullable=False, default=datetime.utcnow)
    ip_address: Mapped[str] = mapped_column(String(45), nullable=True)  # IPv6 addresses can be up to 45 characters

    # Relationships
    election: Mapped["Election"] = relationship(back_populates="ballots")
    student: Mapped["Student"] = relationship(back_populates="ballots")
    vote_selections: Mapped[list["VoteSelection"]] = relationship(back_populates="ballot", cascade="all, delete-orphan")

    # Combined Index: (election_id, student_id) (Unique Index) - Prevents a user from voting more than once per election
    __table_args__ = (
        UniqueConstraint("election_id", "student_id", name="uq_ballot_per_student_per_election"),
    )


class VoteSelection(Base):
    """Holds the actual votes, maintaining voter anonymity by only linking to ballot_id."""
    __tablename__ = "vote_selections"
    
    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    ballot_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("ballots.id", ondelete="CASCADE"), nullable=False)
    position_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("positions.id", ondelete="CASCADE"), nullable=False)
    # FIX: Change data type from String(36) to UUID
    candidate_id: Mapped[str | None] = mapped_column(UUID(as_uuid=False), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=True)  # Null if 'None of the Above' option is used

    # Relationships
    ballot: Mapped["Ballot"] = relationship(back_populates="vote_selections")
    position: Mapped["Position"] = relationship(back_populates="vote_selections")
    candidate: Mapped["Candidate"] = relationship(back_populates="vote_selections")

pool_size = int(os.getenv("DB_POOL_SIZE", "5"))
max_overflow = int(os.getenv("DB_MAX_OVERFLOW", "10"))
pool_timeout = int(os.getenv("DB_POOL_TIMEOUT", "30"))
engine = create_engine(
    DATABASE_URL,
    echo=os.getenv("SQLALCHEMY_ECHO", "false").lower() == "true",
    pool_pre_ping=True,
    pool_size=pool_size,
    max_overflow=max_overflow,
    pool_timeout=pool_timeout,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


def ensure_database_initialized() -> None:
    Base.metadata.create_all(bind=engine)


def create_all_tables() -> None:
    Base.metadata.create_all(bind=engine)


def get_session() -> Generator[Session, None, None]:
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()



