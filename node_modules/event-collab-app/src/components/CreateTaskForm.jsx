import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createTask } from '../services/taskService';
import Button from './ui/Button';

const CreateTaskForm = ({ eventId, onComplete }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      toast.success('Task created!');
      queryClient.invalidateQueries({ queryKey: ['tasks', eventId] });
      onComplete();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create task.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Task name cannot be empty.");
      return;
    }
    // *** FIX: Restructured the payload to match the updated service function. ***
    const taskData = {
      name,
      description,
      status: 'TO_DO',
    };
    mutation.mutate({ taskData, eventId });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 my-4 bg-gray-100 dark:bg-gray-700 rounded-lg space-y-3">
      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Add New Task</h3>
      <input 
        type="text" 
        placeholder="Task name (required)" 
        value={name} 
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm"
      />
      <textarea 
        placeholder="Task description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm"
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onComplete}>
          Cancel
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : 'Save Task'}
        </Button>
      </div>
    </form>
  );
};

export default CreateTaskForm;
