import { motion } from 'framer-motion';

const AdminDashboard = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto p-4"
    >
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-gray-500 dark:text-gray-400">Event and user management tools for administrators would go here.</p>
    </motion.div>
  );
};

export default AdminDashboard;