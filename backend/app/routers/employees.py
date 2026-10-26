from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/employees", tags=["employees"])


@router.get("", response_model=List[schemas.EmployeeOut])
def list_employees(
    department_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current: models.Employee = Depends(auth.get_current_employee),
):
    # Employees can only see the directory (read-only); admins/managers see everything too.
    query = db.query(models.Employee)
    if department_id:
        query = query.filter(models.Employee.department_id == department_id)
    return query.order_by(models.Employee.full_name).all()


@router.get("/{employee_id}", response_model=schemas.EmployeeOut)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current: models.Employee = Depends(auth.get_current_employee),
):
    emp = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp


@router.post("", response_model=schemas.EmployeeOut, status_code=201)
def create_employee(
    payload: schemas.EmployeeCreate,
    db: Session = Depends(get_db),
    current: models.Employee = Depends(auth.require_roles(models.Role.admin, models.Role.manager)),
):
    if db.query(models.Employee).filter(models.Employee.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    data = payload.model_dump(exclude={"password"})
    emp = models.Employee(**data, hashed_password=auth.hash_password(payload.password))
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return emp


@router.put("/{employee_id}", response_model=schemas.EmployeeOut)
def update_employee(
    employee_id: int,
    payload: schemas.EmployeeUpdate,
    db: Session = Depends(get_db),
    current: models.Employee = Depends(auth.get_current_employee),
):
    emp = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    is_self = current.id == emp.id
    is_privileged = current.role in (models.Role.admin, models.Role.manager)
    if not (is_self or is_privileged):
        raise HTTPException(status_code=403, detail="Not permitted to edit this employee")

    update_data = payload.model_dump(exclude_unset=True)
    if not is_privileged:
        # Regular employees editing their own profile can't change role, salary, or department
        for locked_field in ("role", "salary", "department_id", "is_active"):
            update_data.pop(locked_field, None)

    for field, value in update_data.items():
        setattr(emp, field, value)
    db.commit()
    db.refresh(emp)
    return emp


@router.delete("/{employee_id}", status_code=204)
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current: models.Employee = Depends(auth.require_roles(models.Role.admin)),
):
    emp = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(emp)
    db.commit()
    return None
