import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Search, Filter, X } from 'lucide-react';
import { getAllEvents } from '../services/eventService';
import EventCard from '../components/EventCard';
import { DashboardSkeleton, EventCardSkeleton } from '../components/ui/SkeletonLoader';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import CreateEventForm from '../components/CreateEventForm';
import { useApp } from '../context/AppContext';
import { notify } from '../services/notificationService';

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const { searchQuery, filters, setSearchQuery, setFilters, clearFilters } = useApp();

  const { data: events, isLoading, error, refetch } = useQuery({ 
    queryKey: ['events'], 
    queryFn: getAllEvents,
    onError: (error) => {
      notify.error('Failed to load events');
    }
  });

  // Filter and search events
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    
    return events.filter(event => {
      const matchesSearch = !searchTerm || 
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !categoryFilter || event.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [events, searchTerm, categoryFilter]);

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    if (!events) return [];
    const uniqueCategories = [...new Set(events.map(event => event.category).filter(Boolean))];
    return uniqueCategories;
  }, [events]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setShowFilters(false);
  };

  if (isLoading) return <DashboardSkeleton />;

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

        {/* Search and Filter Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search events..." 
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 rounded-md bg-white dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              {(searchTerm || categoryFilter) && (
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date
                    </label>
                    <input 
                      type="date" 
                      className="w-full px-3 py-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" 
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => refetch()}
                      variant="outline"
                      className="w-full"
                    >
                      Refresh
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-md mb-6"
          >
            <p>Failed to load events. Please try again.</p>
            <Button onClick={() => refetch()} className="mt-2" size="sm">
              Retry
            </Button>
          </motion.div>
        )}

        {/* Results Info */}
        {filteredEvents && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredEvents.length} of {events?.length || 0} events
            {(searchTerm || categoryFilter) && (
              <span className="ml-2">
                {searchTerm && `• Search: "${searchTerm}"`}
                {categoryFilter && `• Category: ${categoryFilter}`}
              </span>
            )}
          </div>
        )}
        
        {/* Events Grid */}
        <AnimatePresence mode="wait">
          {filteredEvents.length === 0 && !isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="text-gray-400 dark:text-gray-600 mb-4">
                <PlusCircle className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {searchTerm || categoryFilter ? 'No events found' : 'No events yet'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm || categoryFilter 
                    ? 'Try adjusting your search or filters' 
                    : 'Create your first event to get started'
                  }
                </p>
              </div>
              {!searchTerm && !categoryFilter && (
                <Button onClick={() => setIsModalOpen(true)}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
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