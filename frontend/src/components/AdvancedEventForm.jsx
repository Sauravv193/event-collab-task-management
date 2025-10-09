import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, MapPin, Users, Tag, Repeat, 
  Clock, Bell, BarChart3, Settings, 
  Plus, X, ChevronDown 
} from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';
import LazyImage from './ui/LazyImage';
import FileUpload from './ui/FileUpload';
import { notify } from '../services/notificationService';

const EVENT_CATEGORIES = [
  'Conference', 'Workshop', 'Meeting', 'Social', 'Training',
  'Webinar', 'Networking', 'Team Building', 'Presentation', 'Other'
];

const RECURRENCE_PATTERNS = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY', label: 'Yearly' },
  { value: 'CUSTOM', label: 'Custom' }
];

const REMINDER_OPTIONS = [
  { value: 5, label: '5 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' },
  { value: 10080, label: '1 week before' }
];

const AdvancedEventForm = ({
  event = null,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    tags: [],
    maxParticipants: '',
    isRecurring: false,
    recurrencePattern: 'WEEKLY',
    recurrenceInterval: 1,
    recurrenceEndDate: '',
    reminders: [30],
    isPrivate: false,
    allowWaitlist: true,
    requireApproval: false,
    eventImage: null,
    customFields: [],
    socialLinks: {
      website: '',
      facebook: '',
      twitter: '',
      linkedin: ''
    }
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [newTag, setNewTag] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [eventImageFiles, setEventImageFiles] = useState([]);

  // Initialize form data
  useEffect(() => {
    if (event) {
      const eventDate = new Date(event.date);
      setFormData({
        name: event.name || '',
        description: event.description || '',
        date: eventDate.toISOString().split('T')[0],
        time: eventDate.toTimeString().slice(0, 5),
        location: event.location || '',
        category: event.category || '',
        tags: event.tags?.split(',').filter(Boolean) || [],
        maxParticipants: event.maxParticipants || '',
        isRecurring: event.isRecurring || false,
        recurrencePattern: event.recurrencePattern || 'WEEKLY',
        recurrenceInterval: event.recurrenceInterval || 1,
        recurrenceEndDate: event.recurrenceEndDate || '',
        reminders: event.reminders || [30],
        isPrivate: event.isPrivate || false,
        allowWaitlist: event.allowWaitlist !== false,
        requireApproval: event.requireApproval || false,
        eventImage: event.imageUrl || null,
        customFields: event.customFields || [],
        socialLinks: event.socialLinks || {
          website: '',
          facebook: '',
          twitter: '',
          linkedin: ''
        }
      });
    }
  }, [event]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      notify.error('Event name is required');
      return;
    }

    if (!formData.date) {
      notify.error('Event date is required');
      return;
    }

    // Combine date and time
    const eventDateTime = formData.time 
      ? new Date(`${formData.date}T${formData.time}`)
      : new Date(formData.date);

    const eventData = {
      ...formData,
      date: eventDateTime.toISOString(),
      tags: formData.tags.join(','),
      imageUrl: eventImageFiles[0]?.preview || formData.eventImage
    };

    try {
      await onSave(eventData);
      notify.success(event ? 'Event updated successfully' : 'Event created successfully');
    } catch (error) {
      notify.error('Failed to save event');
    }
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

  const addReminder = (minutes) => {
    if (!formData.reminders.includes(minutes)) {
      handleInputChange('reminders', [...formData.reminders, minutes].sort((a, b) => a - b));
    }
  };

  const removeReminder = (minutes) => {
    handleInputChange('reminders', formData.reminders.filter(r => r !== minutes));
  };

  const addCustomField = () => {
    const newField = {
      id: Date.now(),
      label: '',
      type: 'text',
      required: false,
      options: []
    };
    handleInputChange('customFields', [...formData.customFields, newField]);
  };

  const updateCustomField = (id, updates) => {
    handleInputChange('customFields', 
      formData.customFields.map(field => 
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const removeCustomField = (id) => {
    handleInputChange('customFields', 
      formData.customFields.filter(field => field.id !== id)
    );
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Settings },
    { id: 'recurring', label: 'Recurring', icon: Repeat },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'branding', label: 'Branding', icon: BarChart3 }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {event ? 'Edit Event' : 'Create New Event'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {event ? 'Update event details and settings' : 'Create a new event for collaboration'}
          </p>
        </div>
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <Input
          label="Event Name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter event name..."
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your event..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Time
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => handleInputChange('time', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Max Participants */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Max Participants
            </label>
            <input
              type="number"
              min="1"
              value={formData.maxParticipants}
              onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
              placeholder="No limit"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Event location..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Category */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Category
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-left flex items-center justify-between"
              >
                {formData.category || 'Select category'}
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg rounded-md border border-gray-300 dark:border-gray-600 max-h-60 overflow-auto">
                  {EVENT_CATEGORIES.map(category => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        handleInputChange('category', category);
                        setShowCategoryDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
          {activeTab === 'basic' && (
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

              {/* Reminders */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Bell className="w-4 h-4 inline mr-1" />
                  Reminders
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.reminders.map(minutes => (
                    <span
                      key={minutes}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    >
                      {REMINDER_OPTIONS.find(r => r.value === minutes)?.label || `${minutes} minutes`}
                      <button
                        type="button"
                        onClick={() => removeReminder(minutes)}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <select
                  onChange={(e) => {
                    const minutes = parseInt(e.target.value);
                    if (minutes) {
                      addReminder(minutes);
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Add reminder...</option>
                  {REMINDER_OPTIONS
                    .filter(option => !formData.reminders.includes(option.value))
                    .map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          )}

          {activeTab === 'recurring' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  This is a recurring event
                </label>
              </div>

              {formData.isRecurring && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Repeat Pattern
                    </label>
                    <select
                      value={formData.recurrencePattern}
                      onChange={(e) => handleInputChange('recurrencePattern', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {RECURRENCE_PATTERNS.map(pattern => (
                        <option key={pattern.value} value={pattern.value}>
                          {pattern.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Repeat Every
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={formData.recurrenceInterval}
                        onChange={(e) => handleInputChange('recurrenceInterval', parseInt(e.target.value))}
                        className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formData.recurrencePattern.toLowerCase()}(s)
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={formData.recurrenceEndDate}
                      onChange={(e) => handleInputChange('recurrenceEndDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={formData.isPrivate}
                    onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPrivate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Private Event (invitation only)
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="requireApproval"
                    checked={formData.requireApproval}
                    onChange={(e) => handleInputChange('requireApproval', e.target.checked)}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="requireApproval" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Require approval to join
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="allowWaitlist"
                    checked={formData.allowWaitlist}
                    onChange={(e) => handleInputChange('allowWaitlist', e.target.checked)}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="allowWaitlist" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Allow waitlist when full
                  </label>
                </div>
              </div>

              {/* Social Links */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Social Links
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Website"
                    value={formData.socialLinks.website}
                    onChange={(e) => handleNestedChange('socialLinks', 'website', e.target.value)}
                    placeholder="https://example.com"
                  />
                  <Input
                    label="Facebook"
                    value={formData.socialLinks.facebook}
                    onChange={(e) => handleNestedChange('socialLinks', 'facebook', e.target.value)}
                    placeholder="https://facebook.com/event"
                  />
                  <Input
                    label="Twitter"
                    value={formData.socialLinks.twitter}
                    onChange={(e) => handleNestedChange('socialLinks', 'twitter', e.target.value)}
                    placeholder="https://twitter.com/event"
                  />
                  <Input
                    label="LinkedIn"
                    value={formData.socialLinks.linkedin}
                    onChange={(e) => handleNestedChange('socialLinks', 'linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/event"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Event Image
                </label>
                <FileUpload
                  files={eventImageFiles}
                  onFileSelect={(file) => {
                    setEventImageFiles([file]);
                  }}
                  onFileRemove={(fileId) => {
                    setEventImageFiles([]);
                  }}
                  maxFiles={1}
                  acceptedTypes={['image/*']}
                  className="mb-4"
                />
                
                {(formData.eventImage || eventImageFiles[0]) && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Image
                    </h4>
                    <LazyImage
                      src={eventImageFiles[0]?.preview || formData.eventImage}
                      alt="Event preview"
                      className="w-full h-48 rounded-lg"
                    />
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
          {event ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </form>
  );
};

export default AdvancedEventForm;