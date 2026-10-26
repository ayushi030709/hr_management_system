import { useState } from "react";
import { useRouter } from "next/router";
import { api, saveSession } from "../lib/api";
import { useAuth } from "../lib/AuthContext";

const DEMO_ACCOUNTS = [
  { label: "Admin", email: "admin@hrms.com", password: "admin123" },
  { label: "Manager", email: "rohan.kapoor@hrms.com", password: "manager123" },
  { label: "Employee", email: "neha.verma@hrms.com", password: "employee123" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const session = await api.login(email, password);
      saveSession(session);
      setUser({
        employee_id: session.employee_id,
        full_name: session.full_name,
        role: session.role,
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(account) {
    setEmail(account.email);
    setPassword(account.password);
  }

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="eyebrow text-teal-600/90 mb-2">HR-MGMT / SYSTEM ACCESS</div>
          <h1 className="font-display text-3xl font-semibold text-white">Personnel</h1>
          <p className="text-white/40 text-sm mt-2">
            Employee records, departments &amp; attendance in one place.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-ink-800 border border-white/10 rounded-lg p-7 space-y-4"
        >
          <div>
            <label className="eyebrow text-white/40 block mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-ink-900 border border-white/10 rounded-md px-3 py-2.5 text-white text-sm focus:border-teal-600 outline-none transition"
              placeholder="you@hrms.com"
            />
          </div>
          <div>
            <label className="eyebrow text-white/40 block mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-ink-900 border border-white/10 rounded-md px-3 py-2.5 text-white text-sm focus:border-teal-600 outline-none transition"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="text-rust-500 text-sm bg-rust-500/10 border border-rust-500/20 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium text-sm rounded-md py-2.5 transition"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-center gap-2">
          <span className="eyebrow text-white/30">Demo:</span>
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.label}
              onClick={() => fillDemo(acc)}
              className="eyebrow text-white/50 hover:text-teal-600 border border-white/10 rounded px-2 py-1 transition"
            >
              {acc.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
