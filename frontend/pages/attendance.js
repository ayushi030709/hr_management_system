import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useRequireAuth } from "../lib/useRequireAuth";
import { api } from "../lib/api";

const STATUS_STYLE = {
  present: "text-teal-600",
  half_day: "text-amber-500",
  leave: "text-amber-500",
  absent: "text-rust-500",
};

export default function Attendance() {
  const { user, ready } = useRequireAuth();
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [marking, setMarking] = useState(false);
  const [status, setStatus] = useState("present");
  const [targetEmployee, setTargetEmployee] = useState("");

  const canManage = user && (user.role === "admin" || user.role === "manager");

  async function load() {
    setLoading(true);
    try {
      const [att, emps] = await Promise.all([
        api.listAttendance(),
        canManage ? api.listEmployees() : Promise.resolve([]),
      ]);
      setRecords(att);
      setEmployees(emps);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!ready || !user) return null;

  async function handleMark(e) {
    e.preventDefault();
    setMarking(true);
    setError("");
    try {
      const employeeId = canManage && targetEmployee ? Number(targetEmployee) : user.employee_id;
      await api.markAttendance({ employee_id: employeeId, status });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setMarking(false);
    }
  }

  return (
    <Layout active="attendance">
      <header className="mb-6">
        <div className="eyebrow text-teal-600 mb-1">TIME &amp; PRESENCE</div>
        <h1 className="font-display text-2xl font-semibold text-ink-900">Attendance</h1>
      </header>

      {error && (
        <div className="text-rust-500 text-sm bg-rust-500/10 border border-rust-500/20 rounded-md px-4 py-3 mb-5">
          {error}
        </div>
      )}

      <div className="bg-white border border-line rounded-lg p-5 mb-6">
        <h2 className="eyebrow text-ink-600 mb-4">Mark attendance</h2>
        <form onSubmit={handleMark} className="flex flex-wrap items-end gap-3">
          {canManage && (
            <div className="w-56">
              <label className="eyebrow text-ink-600/50 block mb-1">Employee</label>
              <select
                value={targetEmployee}
                onChange={(e) => setTargetEmployee(e.target.value)}
                className="w-full border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-teal-600 transition"
              >
                <option value="">Myself ({user.full_name})</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="w-44">
            <label className="eyebrow text-ink-600/50 block mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 text-sm outline-none focus:border-teal-600 transition"
            >
              <option value="present">Present</option>
              <option value="half_day">Half day</option>
              <option value="leave">Leave</option>
              <option value="absent">Absent</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={marking}
            className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-medium rounded-md px-4 py-2 transition"
          >
            {marking ? "Marking…" : "Mark today"}
          </button>
        </form>
      </div>

      <div className="bg-white border border-line rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="eyebrow text-ink-600/50 px-4 py-3 font-medium">Date</th>
              {canManage && (
                <th className="eyebrow text-ink-600/50 px-4 py-3 font-medium">Employee</th>
              )}
              <th className="eyebrow text-ink-600/50 px-4 py-3 font-medium">Status</th>
              <th className="eyebrow text-ink-600/50 px-4 py-3 font-medium">Check-in</th>
              <th className="eyebrow text-ink-600/50 px-4 py-3 font-medium">Check-out</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-600/50">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && records.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink-600/50">
                  No attendance records yet.
                </td>
              </tr>
            )}
            {!loading &&
              records.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{r.date}</td>
                  {canManage && <td className="px-4 py-3">{r.employee_name}</td>}
                  <td className={`px-4 py-3 eyebrow ${STATUS_STYLE[r.status]}`}>
                    {r.status.replace("_", " ")}
                  </td>
                  <td className="px-4 py-3 text-ink-600/60">{r.check_in || "—"}</td>
                  <td className="px-4 py-3 text-ink-600/60">{r.check_out || "—"}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
