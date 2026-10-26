import enum
from datetime import date, datetime

from sqlalchemy import (
    Column, Integer, String, Float, Date, DateTime, ForeignKey, Enum, Boolean
)
from sqlalchemy.orm import relationship

from .database import Base


class Role(str, enum.Enum):
    admin = "admin"
    manager = "manager"
    employee = "employee"


class AttendanceStatus(str, enum.Enum):
    present = "present"
    absent = "absent"
    leave = "leave"
    half_day = "half_day"


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)
    description = Column(String, nullable=True)

    employees = relationship("Employee", back_populates="department")


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    phone = Column(String, nullable=True)
    job_title = Column(String, nullable=False)
    role = Column(Enum(Role), default=Role.employee, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    date_joined = Column(Date, default=date.today)
    salary = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)

    # auth
    hashed_password = Column(String, nullable=False)

    department = relationship("Department", back_populates="employees")
    attendance_records = relationship(
        "Attendance", back_populates="employee", cascade="all, delete-orphan"
    )


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    date = Column(Date, default=date.today, nullable=False)
    status = Column(Enum(AttendanceStatus), default=AttendanceStatus.present, nullable=False)
    check_in = Column(String, nullable=True)
    check_out = Column(String, nullable=True)
    note = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    employee = relationship("Employee", back_populates="attendance_records")
