from datetime import date as date_cls
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/attendance", tags=["attendance"])


def _to_out(record: models.Attendance) -> schemas.AttendanceOut:
    out = schemas.AttendanceOut.model_validate(record)
    out.employee_name = record.employee.full_name if record.employee else None
    return out


@router.get("", response_model=List[schemas.AttendanceOut])
def list_attendance(
    employee_id: Optional[int] = None,
    date_filter: Optional[date_cls] = None,
    db: Session = Depends(get_db),
    current: models.Employee = Depends(auth.get_current_employee),
):
    query = db.query(models.Attendance)

    # Regular employees can only see their own attendance history
    if current.role == models.Role.employee:
        query = query.filter(models.Attendance.employee_id == current.id)
    elif employee_id:
        query = query.filter(models.Attendance.employee_id == employee_id)

    if date_filter:
        query = query.filter(models.Attendance.date == date_filter)

    records = query.order_by(models.Attendance.date.desc()).all()
    return [_to_out(r) for r in records]


@router.post("", response_model=schemas.AttendanceOut, status_code=201)
def mark_attendance(
    payload: schemas.AttendanceCreate,
    db: Session = Depends(get_db),
    current: models.Employee = Depends(auth.get_current_employee),
):
    is_privileged = current.role in (models.Role.admin, models.Role.manager)
    if not is_privileged and payload.employee_id != current.id:
        raise HTTPException(status_code=403, detail="You can only mark your own attendance")

    data = payload.model_dump()
    if not data.get("date"):
        data["date"] = date_cls.today()

    record = models.Attendance(**data)
    db.add(record)
    db.commit()
    db.refresh(record)
    return _to_out(record)


@router.put("/{record_id}", response_model=schemas.AttendanceOut)
def update_attendance(
    record_id: int,
    payload: schemas.AttendanceUpdate,
    db: Session = Depends(get_db),
    current: models.Employee = Depends(auth.require_roles(models.Role.admin, models.Role.manager)),
):
    record = db.query(models.Attendance).filter(models.Attendance.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return _to_out(record)


@router.delete("/{record_id}", status_code=204)
def delete_attendance(
    record_id: int,
    db: Session = Depends(get_db),
    current: models.Employee = Depends(auth.require_roles(models.Role.admin, models.Role.manager)),
):
    record = db.query(models.Attendance).filter(models.Attendance.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    db.delete(record)
    db.commit()
    return None
