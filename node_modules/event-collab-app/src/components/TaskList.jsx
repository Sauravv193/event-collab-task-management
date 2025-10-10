import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTasksByEvent } from '../services/taskService';
import TaskItem from './TaskItem';
import Button from './ui/Button';
import CreateTaskForm from './CreateTaskForm';
import { Plus } from 'lucide-react';

// *** NEW: Accept 'isExpired' prop to control functionality ***
const TaskList = ({ eventId, isMember, isCreator, isExpired }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks', eventId],
    queryFn: () => getTasksByEvent(eventId),
    enabled: isMember,
  });

  return (
    <div>
      <div className="flex justify-end mb-4">
        {/* *** FIX: Only show "Add Task" button if the event is not expired *** */}
        {!showCreateForm && !isExpired && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus size={16} className="mr-2" />
            Add Task
          </Button>
        )}
      </div>

      {showCreateForm && <CreateTaskForm eventId={eventId} onComplete={() => setShowCreateForm(false)} />}

      {isLoading && <div className="text-center p-4">Loading tasks...</div>}
      
      {error && <div className="text-red-500 text-center p-4">Could not load tasks.</div>}

      {!isLoading && !error && (
        <div className="space-y-3">
          {tasks && tasks.length > 0 ? (
            tasks.map(task => <TaskItem key={task.id} task={task} eventId={eventId} isCreator={isCreator} />)
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">No tasks have been created yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskList;
