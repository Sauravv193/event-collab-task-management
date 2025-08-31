import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createEvent } from '../services/eventService';

const CreateEventForm = ({ onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  // *** FIX: Default date to today and get it in YYYY-MM-DD format for the input. ***
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [location, setLocation] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      toast.success('Event created successfully!');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      onClose(); 
    },
    onError: (error) => {
      // Check for validation errors specifically
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const dateError = error.response.data.errors.find(e => e.field === 'date');
        if (dateError) {
          toast.error(dateError.defaultMessage);
          return;
        }
      }
      toast.error(error.response?.data?.message || 'Failed to create event.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ name, description, date, location });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Event Name</label>
        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm" />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
          {/* *** FIX: Add the 'min' attribute to prevent selecting past dates. *** */}
          <input type="date" id="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} required className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm" />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
          <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm" />
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={mutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
          {mutation.isPending ? 'Creating...' : 'Create Event'}
        </button>
      </div>
    </form>
  );
};

export default CreateEventForm;