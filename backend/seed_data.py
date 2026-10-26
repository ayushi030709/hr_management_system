"""
Seeds the database with demo departments, employees (with login credentials),
and two weeks of attendance history so the app is ready to explore immediately.

Run with:  python seed_data.py
"""
import random
from datetime import date, timedelta

from app.database import SessionLocal, engine, Base
from app import models
from app.auth import hash_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()

print("Seeding HR Management System demo data...")

if db.query(models.Employee).first():
    print("Database already has data. Skipping seed. Delete hr_management.db to reset.")
else:
    departments = [
        models.Department(name="Engineering", description="Product & platform engineering"),
        models.Department(name="Human Resources", description="People operations & recruiting"),
        models.Department(name="Sales", description="Revenue & client relationships"),
        models.Department(name="Design", description="Product & brand design"),
    ]
    db.add_all(departments)
    db.commit()
    for d in departments:
        db.refresh(d)

    dept_by_name = {d.name: d for d in departments}

    employees_data = [
        # (name, email, phone, title, role, department, password, salary, days_ago_joined)
        ("Ayushi Mishra", "admin@hrms.com", "+91 8418078023", "HR Administrator",
         models.Role.admin, "Human Resources", "admin123", 95000, 900),
        ("Rohan Kapoor", "rohan.kapoor@hrms.com", "+91 9811122233", "Engineering Manager",
         models.Role.manager, "Engineering", "manager123", 145000, 700),
        ("Neha Verma", "neha.verma@hrms.com", "+91 9822233344", "Software Engineer",
         models.Role.employee, "Engineering", "employee123", 82000, 400),
        ("Karan Singh", "karan.singh@hrms.com", "+91 9833344455", "Frontend Developer",
         models.Role.employee, "Engineering", "employee123", 78000, 250),
        ("Priya Nair", "priya.nair@hrms.com", "+91 9844455566", "Sales Executive",
         models.Role.employee, "Sales", "employee123", 65000, 320),
        ("Aman Gupta", "aman.gupta@hrms.com", "+91 9855566677", "Sales Manager",
         models.Role.manager, "Sales", "manager123", 110000, 600),
        ("Ishita Rao", "ishita.rao@hrms.com", "+91 9866677788", "Product Designer",
         models.Role.employee, "Design", "employee123", 76000, 180),
        ("Vikram Malhotra", "vikram.malhotra@hrms.com", "+91 9877788899", "Recruiter",
         models.Role.employee, "Human Resources", "employee123", 58000, 150),
    ]

    created_employees = []
    for name, email, phone, title, role, dept_name, password, salary, days_ago in employees_data:
        emp = models.Employee(
            full_name=name,
            email=email,
            phone=phone,
            job_title=title,
            role=role,
            department_id=dept_by_name[dept_name].id,
            date_joined=date.today() - timedelta(days=days_ago),
            salary=salary,
            is_active=True,
            hashed_password=hash_password(password),
        )
        db.add(emp)
        created_employees.append(emp)
    db.commit()
    for e in created_employees:
        db.refresh(e)

    # Two weeks of attendance history for each employee (skip weekends)
    statuses = [models.AttendanceStatus.present] * 8 + [
        models.AttendanceStatus.half_day,
        models.AttendanceStatus.leave,
        models.AttendanceStatus.absent,
    ]
    today = date.today()
    for emp in created_employees:
        for i in range(14):
            day = today - timedelta(days=i)
            if day.weekday() >= 5:  # skip Sat/Sun
                continue
            status = random.choice(statuses)
            record = models.Attendance(
                employee_id=emp.id,
                date=day,
                status=status,
                check_in="09:15 AM" if status in (
                    models.AttendanceStatus.present, models.AttendanceStatus.half_day
                ) else None,
                check_out="06:30 PM" if status == models.AttendanceStatus.present else (
                    "01:30 PM" if status == models.AttendanceStatus.half_day else None
                ),
            )
            db.add(record)
    db.commit()

    print(f"Seeded {len(departments)} departments and {len(created_employees)} employees.")
    print("\nDemo login credentials:")
    print("  Admin:    admin@hrms.com   / admin123")
    print("  Manager:  rohan.kapoor@hrms.com / manager123")
    print("  Employee: neha.verma@hrms.com   / employee123")

db.close()
