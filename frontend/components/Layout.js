import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "../lib/AuthContext";

const NAV = [
  { href: "/dashboard", label: "Overview", key: "overview" },
  { href: "/employees", label: "Employees", key: "employees" },
  { href: "/departments", label: "Departments", key: "departments" },
  { href: "/attendance", label: "Attendance", key: "attendance" },
];

const ROLE_LABEL = {
  admin: "Administrator",
  manager: "Manager",
  employee: "Employee",
};

export default function Layout({ children, active }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen flex bg-paper font-body">
      <aside className="w-60 shrink-0 bg-ink-900 text-white flex flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          <div className="eyebrow text-white/40">HR-MGMT / v1.0</div>
          <div className="font-display font-semibold text-lg mt-1">Personnel</div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {NAV.map((item) => {
            const isActive = active === item.key;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`block px-3 py-2.5 rounded-md text-sm font-medium transition ${
                  isActive
                    ? "bg-teal-600 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-5 border-t border-white/10">
          {user && (
            <div className="mb-3">
              <div className="text-sm font-medium truncate">{user.full_name}</div>
              <div className="eyebrow text-teal-600/90 mt-0.5">
                {ROLE_LABEL[user.role] || user.role}
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full text-left text-xs text-white/50 hover:text-white transition"
          >
            Sign out →
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
