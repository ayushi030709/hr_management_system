from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine
from .routers import auth_router, employees, departments, attendance

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HR Management System API",
    description="Employee records, department tracking, and attendance for a full-stack HR management system.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://hr-management-system-xi00.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(employees.router)
app.include_router(departments.router)
app.include_router(attendance.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "HR Management System API"}


@app.get("/health")
def health():
    return {"status": "healthy"}
