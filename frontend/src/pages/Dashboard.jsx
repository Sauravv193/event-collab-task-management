import { useState } from 'react'; // Import useState
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { PlusCircle, Search } from 'lucide-react';
import { getAllEvents } from '../services/eventService';
import EventCard from '../components/EventCard';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal'; // Import Modal
import CreateEventForm from '../components/CreateEventForm'; // Import the form

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); // Add state for modal

  const { data: events, isLoading, error } = useQuery({ 
    queryKey: ['events'], 
    queryFn: getAllEvents 
  });

  if (isLoading) return <Loader />;

  return (
    <> {/* Use a fragment to wrap the page and the modal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="container mx-auto p-4 sm:p-6"
      >
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Welcome! Here are your upcoming events.</p>
          </div>
          {/* Add onClick handler to the button */}
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </header>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search events..." className="w-full pl-10 pr-4 py-2 rounded-md bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500" />
          </div>
          <input type="date" className="w-full sm:w-auto px-4 py-2 rounded-md bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white" />
        </div>

        {error && <div className="text-red-500 p-4 bg-red-100 rounded-md">Error loading events.</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events?.map((event, index) => (
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
      </motion.div>

      {/* Add the Modal component */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create a New Event"
      >
        <CreateEventForm onClose={() => setIsModalOpen(false)} />
      </Modal>
    </>
  );
};

export default Dashboard;