import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateTask, deleteTask } from '../services/taskService';

const TaskItem = ({ task, eventId, isCreator }) => {
  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', eventId] }),
    onError: error => toast.error(error.response?.data?.message || 'Failed to update task.'),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      toast.success('Task deleted.');
      queryClient.invalidateQueries({ queryKey: ['tasks', eventId] });
    },
    onError: error => toast.error(error.response?.data?.message || 'You do not have permission to delete this task.'),
  });
  const handleStatusChange = e => updateMutation.mutate({ taskId: task.id, taskDetails: { ...task, status: e.target.value } });

  return (
    <article className="rounded-xl border p-3.5 transition hover:-translate-y-0.5 hover:shadow-lg" style={{ background: 'var(--surface-solid)', borderColor: 'var(--line)', boxShadow: '0 4px 14px rgba(31,41,75,.035)' }}>
      <div className="flex items-start justify-between gap-2">
        <h4 className="break-words text-sm font-bold leading-5" style={{ color: 'var(--ink)' }}>{task.name || 'Untitled task'}</h4>
        {isCreator && <button type="button" onClick={() => { if (window.confirm('Delete this task?')) deleteMutation.mutate(task.id); }} disabled={deleteMutation.isPending} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 dark:hover:bg-rose-500/10" title="Delete task" aria-label={'Delete task ' + task.name}><Trash2 size={15} /></button>}
      </div>
      {task.description && <p className="mt-2 line-clamp-3 text-xs leading-5 muted-text">{task.description}</p>}
      <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3" style={{ borderColor: 'var(--line)' }}>
        <span className="inline-flex min-w-0 items-center gap-1.5 truncate text-[10px] font-medium muted-text"><CalendarClock size={12} />{typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo?.username || 'Unassigned'}</span>
        <select aria-label={'Change status for ' + task.name} value={task.status || 'TO_DO'} onChange={handleStatusChange} disabled={updateMutation.isPending} className="max-w-[130px] rounded-lg border px-2 py-1.5 text-[10px] font-bold disabled:opacity-50" style={{ background: 'var(--surface-muted)', color: 'var(--ink)', borderColor: 'var(--line)' }}>
          <option value="TO_DO">To do</option><option value="IN_PROGRESS">In progress</option><option value="DONE">Done</option>
        </select>
      </div>
    </article>
  );
};

export default TaskItem;