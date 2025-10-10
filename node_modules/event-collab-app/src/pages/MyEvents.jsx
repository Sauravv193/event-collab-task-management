import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { getMyEvents } from '../services/eventService';
import EventCard from '../components/EventCard';
import Loader from '../components/ui/Loader';

const MyEvents = () => {
  const { data: events, isLoading, error } = useQuery({ 
    queryKey: ['my-events'], 
    queryFn: getMyEvents 
  });

  if (isLoading) return <Loader />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto p-4 sm:p-6"
    >
      <header className="mb-6">
        <h1 className="text-3xl font-bold">My Events</h1>
        <p className="text-gray-500 dark:text-gray-400">All the events you are a member of.</p>
      </header>

      {error && <div className="text-red-500 p-4 bg-red-100 rounded-md">Error loading your events.</div>}
      
      {events && events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <EventCard event={event} />
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">You haven't joined any events yet.</p>
      )}
    </motion.div>
  );
};

export default MyEvents;