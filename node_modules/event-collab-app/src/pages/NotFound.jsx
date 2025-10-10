import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-6xl font-bold text-indigo-600">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mt-4">Page Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Sorry, the page you are looking for does not exist.</p>
        <Link to="/" className="mt-6 inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700">
          Go back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;