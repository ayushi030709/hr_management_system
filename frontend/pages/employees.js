import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useRequireAuth } from "../lib/useRequireAuth";
import { api } from "../lib/api";

const EMPTY_FORM = {
  full_name: "",
  email: "",
  phone: "",
  job_title: "",
  role: "employee",
  department_id: "",
  salary: "",
  password: "",
};

export default function Employees() {
  const { user, ready } = useRequireAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const canManage = user && (user.role === "admin" || user.role === "manager");
  const canDelete = user && user.role === "admin";

  async function loadData() {
    setLoading(true);
    try {
      const [emps, depts] = await Promise.all([api.listEmployees(), api.listDepartments()]);
      setEmployees(emps);
      setDepartments(depts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  if (!ready || !user) return null;

  const deptName = (id) => departments.find((d) => d.id === id)?.name || "—";

  const filtered = employees.filter((e) =>
    `${e.full_name} ${e.job_title} ${e.email}`.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(emp) {
    setEditing(emp);
    setForm({
      full_name: emp.full_name,
      email: emp.email,
      phone: emp.phone || "",
      job_title: emp.job_title,
      role: emp.role,
      department_id: emp.department_id || "",
      salary: emp.salary || "",
      password: "",
    });
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || null,
        job_title: form.job_title,
        role: form.role,
        department_id: form.department_id ? Number(form.department_id) : null,
        salary: form.salary ? Number(form.salary) : null,
      };
      if (editing) {
        await api.updateEmployee(editing.id, payload);
      } else {
        await api.createEmployee({ ...payload, password: form.password });
      }
      setModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(emp) {
    if (!confirm(`Remove ${emp.full_name} from the system?`)) return;
    try {
      await api.deleteEmployee(emp.id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Layout active="employees">
      <header className="flex items-center justify-between mb-6">
        <div>
          <div className="eyebrow text-teal-600 mb-1">DIRECTORY</div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Employees</h1>
        </div>
        {canManage && (
          <button
            onClick={openCreate}
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-md px-4 py-2 transition"
          >
            + Add employee
          </button>
        )}
      </header>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, title, or email…"
        className="w-full max-w-sm mb-5 bg-white border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-teal-600 transition"
      />

      {error && (
        <div className="text-rust-500 text-sm bg-rust-500/10 border border-rust-500/20 rounded-md px-4 py-3 mb-5">
          {error}
        </div>
      )}

      <div className="bg-white border border-line rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="eyebrow text-ink-600/50 px-4 py-3 font-medium">Name</th>
              <th className="eyebrow text-ink-600/50 px-4 py-3 font-medium">Title</th>
              <th className="eyebrow text-ink-600/50 px-4 py-3 font-medium">Department</th>
              <th className="eyebrow text-ink-600/50 px-4 py-3 font-medium">Role</th>
              <th className="eyebrow text-ink-600/50 px-4 py-3 font-medium">Status</th>
              {(canManage || canDelete) && <th className="px-4 py-3"></th>}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-600/50">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-600/50">
                  No employees match your search.
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((emp) => (
                <tr key={emp.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                  <td className="px-4 py-3">
                    <div className="font-medium">{emp.full_name}</div>
                    <div className="text-xs text-ink-600/50">{emp.email}</div>
                  </td>
                  <td className="px-4 py-3">{emp.job_title}</td>
                  <td className="px-4 py-3">{deptName(emp.department_id)}</td>
                  <td className="px-4 py-3">
                    <span className="eyebrow text-ink-600/60">{emp.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`eyebrow ${
                        emp.is_active ? "text-teal-600" : "text-ink-600/40"
                      }`}
                    >
                      {emp.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  {(canManage || canDelete) && (
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {canManage && (
                        <button
                          onClick={() => openEdit(emp)}
                          className="text-xs text-teal-600 hover:underline mr-3"
                        >
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(emp)}
                          className="text-xs text-rust-500 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-ink-900/50 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="font-display text-lg font-semibold mb-4">
              {editing ? "Edit employee" : "Add employee"}
            </h2>
            <form onSubmit={handleSave} className="space-y-3">
              <Field label="Full name">
                <input
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="input"
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  required
                  disabled={!!editing}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input disabled:opacity-50"
                />
              </Field>
              <Field label="Phone">
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input"
                />
              </Field>
              <Field label="Job title">
                <input
                  required
                  value={form.job_title}
                  onChange={(e) => setForm({ ...form, job_title: e.target.value })}
                  className="input"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Role">
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="input"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </Field>
                <Field label="Department">
                  <select
                    value={form.department_id}
                    onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                    className="input"
                  >
                    <option value="">None</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Salary (annual)">
                <input
                  type="number"
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  className="input"
                />
              </Field>
              {!editing && (
                <Field label="Temporary password">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input"
                  />
                </Field>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="text-sm text-ink-600/60 hover:text-ink-900 px-3 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-medium rounded-md px-4 py-2 transition"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #e2e5e1;
          border-radius: 6px;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
        }
        .input:focus {
          border-color: #0f6d66;
        }
      `}</style>
    </Layout>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="eyebrow text-ink-600/50 block mb-1">{label}</label>
      {children}
    </div>
  );
}
