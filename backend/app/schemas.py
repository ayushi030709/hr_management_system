from datetime import date as date_type, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr

from .models import Role, AttendanceStatus


# ---------- Department ----------
class DepartmentBase(BaseModel):
    name: str
    description: Optional[str] = None


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class DepartmentOut(DepartmentBase):
    id: int
    employee_count: int = 0

    class Config:
        from_attributes = True


# ---------- Employee ----------
class EmployeeBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    job_title: str
    role: Role = Role.employee
    department_id: Optional[int] = None
    date_joined: Optional[date_type] = None
    salary: Optional[float] = None
    is_active: bool = True


class EmployeeCreate(EmployeeBase):
    password: str


class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    job_title: Optional[str] = None
    role: Optional[Role] = None
    department_id: Optional[int] = None
    date_joined: Optional[date_type] = None
    salary: Optional[float] = None
    is_active: Optional[bool] = None


class EmployeeOut(EmployeeBase):
    id: int
    department: Optional[DepartmentBase] = None

    class Config:
        from_attributes = True


# ---------- Attendance ----------
class AttendanceBase(BaseModel):
    employee_id: int
    date: Optional[date_type] = None
    status: AttendanceStatus = AttendanceStatus.present
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    note: Optional[str] = None


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceUpdate(BaseModel):
    status: Optional[AttendanceStatus] = None
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    note: Optional[str] = None


class AttendanceOut(AttendanceBase):
    id: int
    created_at: datetime
    employee_name: Optional[str] = None

    class Config:
        from_attributes = True


# ---------- Auth ----------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: Role
    full_name: str
    employee_id: int
