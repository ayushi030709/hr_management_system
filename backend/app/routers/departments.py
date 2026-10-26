from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/departments", tags=["departments"])


def _to_out(dept: models.Department) -> schemas.DepartmentOut:
    out = schemas.DepartmentOut.model_validate(dept)
    out.employee_count = len(dept.employees)
    return out


@router.get("", response_model=List[schemas.DepartmentOut])
def list_departments(
    db: Session = Depends(get_db),
    current: models.Employee = Depends(auth.get_current_employee),
):
    depts = db.query(models.Department).all()
    return [_to_out(d) for d in depts]


@router.post("", response_model=schemas.DepartmentOut, status_code=201)
def create_department(
    payload: schemas.DepartmentCreate,
    db: Session = Depends(get_db),
    current: models.Employee = Depends(auth.require_roles(models.Role.admin, models.Role.manager)),
):
    if db.query(models.Department).filter(models.Department.name == payload.name).first():
        raise HTTPException(status_code=400, detail="Department already exists")
    dept = models.Department(**payload.model_dump())
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return _to_out(dept)


@router.put("/{dept_id}", response_model=schemas.DepartmentOut)
def update_department(
    dept_id: int,
    payload: schemas.DepartmentUpdate,
    db: Session = Depends(get_db),
    current: models.Employee = Depends(auth.require_roles(models.Role.admin, models.Role.manager)),
):
    dept = db.query(models.Department).filter(models.Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(dept, field, value)
    db.commit()
    db.refresh(dept)
    return _to_out(dept)


@router.delete("/{dept_id}", status_code=204)
def delete_department(
    dept_id: int,
    db: Session = Depends(get_db),
    current: models.Employee = Depends(auth.require_roles(models.Role.admin)),
):
    dept = db.query(models.Department).filter(models.Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    db.delete(dept)
    db.commit()
    return None
