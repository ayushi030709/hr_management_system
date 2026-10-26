import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useRequireAuth } from "../lib/useRequireAuth";
import { api } from "../lib/api";

const STATUS_COLOR = {
  present: "bg-teal-600",
  half_day: "bg-amber-500",
  leave: "bg-amber-500",
  absent: "bg-rust-500",
};

export default function Dashboard() {
  const { user, ready } = useRequireAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [emps, depts, att] = await Promise.all([
          api.listEmployees(),
          api.listDepartments(),
          api.listAttendance(),
        ]);
        setEmployees(emps);
        setDepartments(depts);
        setAttendance(att);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (!ready || !user) return null;

  const today = new Date().toISOString().slice(0, 10);
  const todayRecords = attendance.filter((a) => a.date === today);
  const presentToday = todayRecords.filter((a) => a.status === "present").length;
  const activeEmployees = employees.filter((e) => e.is_active).length;

  return (
    <Layout active="overview">
      <header className="mb-8">
        <div className="eyebrow text-teal-600 mb-1">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">
          Welcome back, {user.full_name.split(" ")[0]}
        </h1>
      </header>

      {error && (
        <div className="text-rust-500 text-sm bg-rust-500/10 border border-rust-500/20 rounded-md px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Active employees" value={loading ? "—" : activeEmployees} />
        <StatCard label="Departments" value={loading ? "—" : departments.length} />
        <StatCard
          label="Present today"
          value={loading ? "—" : `${presentToday} / ${employees.length}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-line rounded-lg p-5">
          <h2 className="eyebrow text-ink-600 mb-4">Departments</h2>
          <div className="space-y-3">
            {loading && <div className="text-sm text-ink-600/60">Loading…</div>}
            {!loading &&
              departments.map((d) => (
                <div key={d.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{d.name}</div>
                    <div className="text-xs text-ink-600/50">{d.description}</div>
                  </div>
                  <div className="font-mono text-sm text-ink-600">
                    {d.employee_count}
                  </div>
                </div>
              ))}
          </div>
        </section>

        <section className="bg-white border border-line rounded-lg p-5">
          <h2 className="eyebrow text-ink-600 mb-4">Today&apos;s attendance</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {loading && <div className="text-sm text-ink-600/60">Loading…</div>}
            {!loading && todayRecords.length === 0 && (
              <div className="text-sm text-ink-600/50">No attendance marked yet today.</div>
            )}
            {!loading &&
              todayRecords.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <span>{a.employee_name}</span>
                  <span className="flex items-center gap-1.5 font-mono text-xs text-ink-600/70">
                    <span className={`status-dot ${STATUS_COLOR[a.status]}`} />
                    {a.status.replace("_", " ")}
                  </span>
                </div>
              ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-line rounded-lg p-5">
      <div className="eyebrow text-ink-600/50 mb-1.5">{label}</div>
      <div className="font-display text-3xl font-semibold text-ink-900">{value}</div>
    </div>
  );
}
