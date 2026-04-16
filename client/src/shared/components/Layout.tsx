import { NavLink, Outlet } from 'react-router-dom';
import useAuth from '../../modules/auth/useAuth';

const navItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Subscriptions', to: '/subscriptions' },
  { label: 'Events', to: '/events' },
];

export default function Layout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-transparent text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <aside className="w-full border-b border-white/10 bg-slate-950/80 px-6 py-8 text-slate-100 backdrop-blur lg:w-72 lg:border-b-0 lg:border-r lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">NotifyHub</p>
            <h1 className="mt-3 text-2xl font-bold">Control Center</h1>
            <p className="mt-2 text-sm text-slate-400">Monitor every delivery path from one place.</p>
          </div>

          <nav className="mt-10 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }: { isActive: boolean }) =>
                  [
                    'block rounded-xl px-4 py-3 text-sm font-medium transition',
                    isActive
                      ? 'bg-cyan-400 text-slate-950'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={logout}
            className="mt-10 w-full rounded-xl border border-slate-800 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </aside>

        <main className="flex-1 p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
