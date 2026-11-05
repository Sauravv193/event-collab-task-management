import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, Menu, X, LayoutDashboard, CalendarDays, Users, UserCircle, ShieldCheck } from 'lucide-react';
import Button from './ui/Button';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/my-events', label: 'My Events', icon: Users },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  const linkClass = ({ isActive }) =>
    `inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
    }`;

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-sm shadow-slate-900/[0.03] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex min-w-0 items-center gap-8">
          <NavLink to="/" onClick={closeMenu} className="flex shrink-0 items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-black text-white shadow-lg shadow-indigo-600/20">EC</span>
            <span className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">Event<span className="text-indigo-600 dark:text-indigo-400">Collab</span></span>
          </NavLink>

          <div className="hidden items-center gap-1 lg:flex">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={linkClass}>
                <Icon size={16} />{label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin" className={linkClass}>
                <ShieldCheck size={16} />Admin
              </NavLink>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} className="text-amber-400" />}
          </button>
          <NavLink to="/profile" className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 sm:flex">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
              <UserCircle size={18} />
            </span>
            <span className="max-w-28 truncate">{user?.username || 'Account'}</span>
          </NavLink>
          <Button onClick={logout} variant="ghost" className="hidden rounded-xl p-2 sm:inline-flex" aria-label="Sign out">
            <LogOut size={18} />
          </Button>
          <button
            type="button"
            onClick={() => setMenuOpen(value => !value)}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            className="grid h-10 w-10 place-items-center rounded-xl text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 shadow-xl dark:border-slate-800 dark:bg-slate-950 lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-1">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} onClick={closeMenu} className={linkClass}>
                <Icon size={17} />{label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin" onClick={closeMenu} className={linkClass}>
                <ShieldCheck size={17} />Admin
              </NavLink>
            )}
            <NavLink to="/profile" onClick={closeMenu} className={linkClass}>
              <UserCircle size={17} />Profile
            </NavLink>
            <button type="button" onClick={() => { closeMenu(); logout(); }} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10">
              <LogOut size={17} />Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
