import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';

const AppLayout = () => (
  <div className="min-h-screen transition-colors duration-300" style={{ background: 'var(--app-bg)', color: 'var(--ink)' }}>
    <Navbar />
    <main className="min-h-screen pt-[72px]"><Outlet /></main>
  </div>
);

export default AppLayout;