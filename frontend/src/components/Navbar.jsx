import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut } from 'lucide-react';
import Button from './ui/Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  // Role check based on User model
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-white/20 dark:border-gray-700/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <NavLink to="/" className="text-xl font-bold">EventCollab</NavLink>
            <div className="hidden md:flex items-baseline space-x-4">
              <NavLink to="/" className={({isActive}) => isActive ? 'nav-link-active' : 'nav-link'}>Dashboard</NavLink>
              <NavLink to="/my-events" className={({isActive}) => isActive ? 'nav-link-active' : 'nav-link'}>My Events</NavLink> 

              <NavLink to="/calendar" className={({isActive}) => isActive ? 'nav-link-active' : 'nav-link'}>Calendar</NavLink>
              {isAdmin && <NavLink to="/admin" className={({isActive}) => isActive ? 'nav-link-active' : 'nav-link'}>Admin</NavLink>}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              {theme === 'light' ? <Moon /> : <Sun className="text-yellow-400"/>}
            </button>
            <NavLink to="/profile" className="nav-link">{user?.username}</NavLink>
            <Button onClick={logout} variant="ghost" className="p-2 rounded-full"><LogOut className="w-5 h-5"/></Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;