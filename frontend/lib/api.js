const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("hrms_token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = (data && data.detail) || `Request failed (${res.status})`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }
  return data;
}

export const api = {
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password }, auth: false }),
  me: () => request("/auth/me"),

  listEmployees: (departmentId) =>
    request(`/employees${departmentId ? `?department_id=${departmentId}` : ""}`),
  getEmployee: (id) => request(`/employees/${id}`),
  createEmployee: (payload) => request("/employees", { method: "POST", body: payload }),
  updateEmployee: (id, payload) => request(`/employees/${id}`, { method: "PUT", body: payload }),
  deleteEmployee: (id) => request(`/employees/${id}`, { method: "DELETE" }),

  listDepartments: () => request("/departments"),
  createDepartment: (payload) => request("/departments", { method: "POST", body: payload }),
  updateDepartment: (id, payload) => request(`/departments/${id}`, { method: "PUT", body: payload }),
  deleteDepartment: (id) => request(`/departments/${id}`, { method: "DELETE" }),

  listAttendance: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/attendance${qs ? `?${qs}` : ""}`);
  },
  markAttendance: (payload) => request("/attendance", { method: "POST", body: payload }),
  updateAttendance: (id, payload) => request(`/attendance/${id}`, { method: "PUT", body: payload }),
  deleteAttendance: (id) => request(`/attendance/${id}`, { method: "DELETE" }),
};

export function saveSession(session) {
  localStorage.setItem("hrms_token", session.access_token);
  localStorage.setItem(
    "hrms_user",
    JSON.stringify({
      employee_id: session.employee_id,
      full_name: session.full_name,
      role: session.role,
    })
  );
}

export function getSession() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("hrms_user");
  const token = localStorage.getItem("hrms_token");
  if (!raw || !token) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem("hrms_token");
  localStorage.removeItem("hrms_user");
}
