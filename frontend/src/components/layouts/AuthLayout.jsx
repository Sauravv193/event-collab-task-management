import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:to-indigo-900">
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;