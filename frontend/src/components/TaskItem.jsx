import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateTask, deleteTask } from '../services/taskService';

// Pass down `isCreator` prop
const TaskItem = ({ task, eventId, isCreator }) => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      // No toast needed for status change, it feels more immediate.
      queryClient.invalidateQueries({ queryKey: ['tasks', eventId] });
    },
     onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update task.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      toast.success('Task deleted!');
      // No need to invalidate, real-time update will handle it.
    },
     onError: (error) => {
      toast.error(error.response?.data?.message || 'You do not have permission to delete this task.');
    }
  });

  const handleStatusChange = (e) => {
    updateMutation.mutate({ taskId: task.id, taskDetails: { ...task, status: e.target.value } });
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
      <div>
        <p className="font-semibold text-gray-900 dark:text-white">{task.name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{task.description}</p>
      </div>
      <div className="flex items-center gap-4">
        <select value={task.status} onChange={handleStatusChange} className="rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm text-sm">
          <option value="TO_DO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
        {/* Only show the delete button if the current user is the event creator */}
        {isCreator && (
          <button 
            onClick={() => deleteMutation.mutate(task.id)} 
            disabled={deleteMutation.isPending}
            className="text-red-500 hover:text-red-700 disabled:opacity-50"
            title="Delete task"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskItem;
