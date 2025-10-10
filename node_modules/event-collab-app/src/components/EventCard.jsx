import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, CheckCircle } from 'lucide-react';

const EventCard = ({ event }) => {
  // The 'expired' field comes directly from the backend's isExpired() method
  const isExpired = event.expired;

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
      className="relative h-full bg-white dark:bg-gray-800/50 backdrop-blur-xl border border-gray-200 dark:border-white/20 shadow-lg rounded-2xl overflow-hidden p-6 flex flex-col text-gray-900 dark:text-white"
    >
      {/* *** NEW: Show a "Finished" badge for expired events *** */}
      {isExpired && (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-semibold">
          <CheckCircle size={14} />
          <span>Finished</span>
        </div>
      )}

      <h3 className="text-xl font-bold mb-2">{event.name}</h3>
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Calendar className="w-4 h-4 mr-2" />
        {new Date(event.date).toLocaleDateString()}
      </div>
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
        <User className="w-4 h-4 mr-2" />
        Host: {event.createdBy.username}
      </div>
      <div className="mt-auto">
        <Link to={`/event/${event.id}`} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
          View Details &rarr;
        </Link>
      </div>
    </motion.div>
  );
};

export default EventCard;