from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    employee = db.query(models.Employee).filter(models.Employee.email == payload.email).first()
    if not employee or not auth.verify_password(payload.password, employee.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not employee.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")

    access_token = auth.create_access_token(data={"sub": str(employee.id)})
    return schemas.Token(
        access_token=access_token,
        role=employee.role,
        full_name=employee.full_name,
        employee_id=employee.id,
    )


@router.get("/me", response_model=schemas.EmployeeOut)
def read_current_user(current: models.Employee = Depends(auth.get_current_employee)):
    return current
