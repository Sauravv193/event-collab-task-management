import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, Flag, Link2, Paperclip, 
  User, Plus, X, ChevronDown, Timer, Target 
} from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';
import { notify } from '../services/notificationService';

const PRIORITIES = [
  { value: 1, label: 'Low', color: 'bg-gray-500', textColor: 'text-gray-700' },
  { value: 2, label: 'Medium-Low', color: 'bg-blue-500', textColor: 'text-blue-700' },
  { value: 3, label: 'Medium', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
  { value: 4, label: 'High', color: 'bg-orange-500', textColor: 'text-orange-700' },
  { value: 5, label: 'Critical', color: 'bg-red-500', textColor: 'text-red-700' }
];

const TASK_STATUSES = [
  { value: 'TODO', label: 'To Do', color: 'bg-gray-500' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-500' },
  { value: 'REVIEW', label: 'In Review', color: 'bg-purple-500' },
  { value: 'DONE', label: 'Done', color: 'bg-green-500' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-500' }
];

const AdvancedTaskForm = ({
  task = null,
  eventId,
  availableUsers = [],
  availableTasks = [],
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 3,
    status: 'TODO',
    assignedTo: null,
    deadline: '',
    estimatedHours: '',
    dependencies: [],
    tags: [],
    attachments: [],
    checklist: []
  });

  const [activeTab, setActiveTab] = useState('details');
  const [showDependencyDropdown, setShowDependencyDropdown] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [timeTracking, setTimeTracking] = useState({
    isTracking: false,
    startTime: null,
    totalTime: 0
  });

  // Initialize form data
  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || '',
        description: task.description || '',
        priority: task.priority || 3,
        status: task.status || 'TODO',
        assignedTo: task.assignedTo?.id || null,
        deadline: task.deadline ? task.deadline.split('T')[0] : '',
        estimatedHours: task.estimatedHours || '',
        dependencies: task.dependencies?.map(dep => dep.id) || [],
        tags: task.tags || [],
        attachments: task.attachments || [],
        checklist: task.checklist || []
      });
      
      if (task.actualHours) {
        setTimeTracking(prev => ({
          ...prev,
          totalTime: task.actualHours * 3600000 // Convert hours to milliseconds
        }));
      }
    }
  }, [task]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      notify.error('Task name is required');
      return;
    }

    const taskData = {
      ...formData,
      eventId,
      actualHours: Math.floor(timeTracking.totalTime / 3600000), // Convert back to hours
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
    };

    try {
      await onSave(taskData);
      notify.success(task ? 'Task updated successfully' : 'Task created successfully');
    } catch (error) {
      notify.error('Failed to save task');
    }
  };

  const addDependency = (taskId) => {
    if (!formData.dependencies.includes(taskId)) {
      handleInputChange('dependencies', [...formData.dependencies, taskId]);
    }
    setShowDependencyDropdown(false);
  };

  const removeDependency = (taskId) => {
    handleInputChange('dependencies', 
      formData.dependencies.filter(id => id !== taskId)
    );
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    handleInputChange('tags', formData.tags.filter(t => t !== tag));
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      handleInputChange('checklist', [
        ...formData.checklist,
        { id: Date.now(), text: newChecklistItem.trim(), completed: false }
      ]);
      setNewChecklistItem('');
    }
  };

  const updateChecklistItem = (id, updates) => {
    handleInputChange('checklist', 
      formData.checklist.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const removeChecklistItem = (id) => {
    handleInputChange('checklist', 
      formData.checklist.filter(item => item.id !== id)
    );
  };

  const startTimeTracking = () => {
    setTimeTracking({
      isTracking: true,
      startTime: Date.now(),
      totalTime: timeTracking.totalTime
    });
  };

  const stopTimeTracking = () => {
    if (timeTracking.isTracking && timeTracking.startTime) {
      const sessionTime = Date.now() - timeTracking.startTime;
      setTimeTracking({
        isTracking: false,
        startTime: null,
        totalTime: timeTracking.totalTime + sessionTime
      });
    }
  };

  const formatTime = (milliseconds) => {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const tabs = [
    { id: 'details', label: 'Details', icon: Target },
    { id: 'dependencies', label: 'Dependencies', icon: Link2 },
    { id: 'attachments', label: 'Attachments', icon: Paperclip },
    { id: 'checklist', label: 'Checklist', icon: Plus },
    { id: 'tracking', label: 'Time Tracking', icon: Timer }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {task ? 'Update task details and settings' : 'Add a new task to your event'}
          </p>
        </div>
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <Input
          label="Task Name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter task name..."
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe the task..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Flag className="w-4 h-4 inline mr-1" />
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {PRIORITIES.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {TASK_STATUSES.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Assigned To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Assigned To
            </label>
            <select
              value={formData.assignedTo || ''}
              onChange={(e) => handleInputChange('assignedTo', e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Unassigned</option>
              {availableUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Deadline
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => handleInputChange('deadline', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Estimated Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Estimated Hours
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={formData.estimatedHours}
              onChange={(e) => handleInputChange('estimatedHours', e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <div className="flex space-x-1 mb-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-indigo-600 hover:text-indigo-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <Button type="button" onClick={addTag} variant="outline" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dependencies' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Task Dependencies
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Select tasks that must be completed before this task can start.
                </p>
                
                {formData.dependencies.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {formData.dependencies.map(depId => {
                      const depTask = availableTasks.find(t => t.id === depId);
                      return depTask ? (
                        <div key={depId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {depTask.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Status: {depTask.status}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDependency(depId)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowDependencyDropdown(!showDependencyDropdown)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex items-center justify-between"
                  >
                    Add Dependency
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {showDependencyDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg rounded-md border border-gray-300 dark:border-gray-600 max-h-60 overflow-auto">
                      {availableTasks
                        .filter(t => t.id !== task?.id && !formData.dependencies.includes(t.id))
                        .map(availableTask => (
                          <button
                            key={availableTask.id}
                            type="button"
                            onClick={() => addDependency(availableTask.id)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-between"
                          >
                            <div>
                              <div className="font-medium">{availableTask.name}</div>
                              <div className="text-sm text-gray-500">Status: {availableTask.status}</div>
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Checklist Items
                </label>
                
                {formData.checklist.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {formData.checklist.map(item => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={(e) => updateChecklistItem(item.id, { completed: e.target.checked })}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={item.text}
                          onChange={(e) => updateChecklistItem(item.id, { text: e.target.value })}
                          className={`flex-1 bg-transparent border-none focus:outline-none ${
                            item.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => removeChecklistItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    placeholder="Add checklist item..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <Button type="button" onClick={addChecklistItem} variant="outline" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tracking' && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Time Tracking</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Track time spent on this task
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {formatTime(timeTracking.totalTime + (timeTracking.isTracking ? Date.now() - timeTracking.startTime : 0))}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Total Time
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {!timeTracking.isTracking ? (
                    <Button
                      type="button"
                      onClick={startTimeTracking}
                      variant="success"
                      size="sm"
                    >
                      <Timer className="w-4 h-4 mr-2" />
                      Start Timer
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={stopTimeTracking}
                      variant="danger"
                      size="sm"
                    >
                      <Timer className="w-4 h-4 mr-2" />
                      Stop Timer
                    </Button>
                  )}
                </div>
                
                {timeTracking.isTracking && (
                  <div className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Timer running...
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isLoading}
        >
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

export default AdvancedTaskForm;