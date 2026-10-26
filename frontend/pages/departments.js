import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useRequireAuth } from "../lib/useRequireAuth";
import { api } from "../lib/api";

export default function Departments() {
  const { user, ready } = useRequireAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const canManage = user && (user.role === "admin" || user.role === "manager");
  const canDelete = user && user.role === "admin";

  async function load() {
    setLoading(true);
    try {
      setDepartments(await api.listDepartments());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) load();
  }, [user]);

  if (!ready || !user) return null;

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.createDepartment({ name, description });
      setName("");
      setDescription("");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(dept) {
    if (!confirm(`Delete "${dept.name}"? Employees keep their record but lose this department.`))
      return;
    try {
      await api.deleteDepartment(dept.id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Layout active="departments">
      <header className="mb-6">
        <div className="eyebrow text-teal-600 mb-1">ORG STRUCTURE</div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Departments</h1>
      </header>

      {error && (
        <div className="text-rust-500 text-sm bg-rust-500/10 border border-rust-500/20 rounded-md px-4 py-3 mb-5">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          {loading && <div className="text-sm text-ink-600/50">Loading…</div>}
          {!loading &&
            departments.map((d) => (
              <div key={d.id} className="bg-white border border-line rounded-lg p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-display font-semibold">{d.name}</h3>
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(d)}
                      className="text-xs text-rust-500 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="text-sm text-ink-600/60 mb-4">{d.description}</p>
                <div className="eyebrow text-ink-600/50">
                  {d.employee_count} {d.employee_count === 1 ? "member" : "members"}
                </div>
              </div>
            ))}
          {!loading && departments.length === 0 && (
            <div className="text-sm text-ink-600/50">No departments yet.</div>
          )}
        </div>

        {canManage && (
          <div className="bg-white border border-line rounded-lg p-5 h-fit">
            <h2 className="eyebrow text-ink-600 mb-4">New department</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="eyebrow text-ink-600/50 block mb-1">Name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-teal-600 transition"
                />
              </div>
              <div>
                <label className="eyebrow text-ink-600/50 block mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-teal-600 transition"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-medium rounded-md py-2 transition"
              >
                {saving ? "Creating…" : "Create department"}
              </button>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
}
