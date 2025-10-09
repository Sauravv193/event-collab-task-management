import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, File, Image, FileText, Archive, 
  X, Download, Eye, AlertCircle, CheckCircle 
} from 'lucide-react';
import Button from './Button';
import { notify } from '../../services/notificationService';

const FileUpload = ({
  onFileSelect,
  onFileRemove,
  files = [],
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/*', 'application/pdf', 'text/*', '.docx', '.xlsx'],
  showPreview = true,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(new Set());
  const fileInputRef = useRef(null);

  const getFileIcon = (fileType, fileName) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType.includes('pdf')) return FileText;
    if (fileType.includes('zip') || fileType.includes('rar')) return Archive;
    return File;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file) => {
    // Check file size
    if (file.size > maxFileSize) {
      notify.error(`File ${file.name} is too large. Maximum size is ${formatFileSize(maxFileSize)}`);
      return false;
    }

    // Check file type
    const isAccepted = acceptedTypes.some(type => {
      if (type.includes('*')) {
        return file.type.startsWith(type.replace('*', ''));
      }
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type === type;
    });

    if (!isAccepted) {
      notify.error(`File type ${file.type} is not supported`);
      return false;
    }

    return true;
  };

  const handleFileSelection = useCallback(async (selectedFiles) => {
    const fileList = Array.from(selectedFiles);
    
    // Check total file count
    if (files.length + fileList.length > maxFiles) {
      notify.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate and process files
    const validFiles = fileList.filter(validateFile);
    
    for (const file of validFiles) {
      const fileId = `${file.name}-${Date.now()}`;
      setUploading(prev => new Set([...prev, fileId]));
      
      try {
        // Create file object with preview
        const fileData = {
          id: fileId,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          preview: null,
          uploadProgress: 0
        };

        // Generate preview for images
        if (file.type.startsWith('image/') && showPreview) {
          const reader = new FileReader();
          reader.onload = (e) => {
            fileData.preview = e.target.result;
          };
          reader.readAsDataURL(file);
        }

        await onFileSelect(fileData);
        notify.success(`${file.name} uploaded successfully`);
      } catch (error) {
        notify.error(`Failed to upload ${file.name}`);
      } finally {
        setUploading(prev => {
          const newSet = new Set(prev);
          newSet.delete(fileId);
          return newSet;
        });
      }
    }
  }, [files.length, maxFiles, onFileSelect, showPreview]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelection(droppedFiles);
    }
  }, [handleFileSelection]);

  const handleFileInputChange = useCallback((e) => {
    if (e.target.files.length > 0) {
      handleFileSelection(e.target.files);
    }
    // Reset input value to allow same file selection
    e.target.value = '';
  }, [handleFileSelection]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (fileId) => {
    onFileRemove(fileId);
    notify.info('File removed');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <motion.div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragging 
            ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <motion.div
          animate={{ 
            scale: isDragging ? 1.1 : 1,
            rotate: isDragging ? 5 : 0 
          }}
          transition={{ duration: 0.2 }}
        >
          <Upload className={`mx-auto h-12 w-12 mb-4 ${
            isDragging ? 'text-indigo-500' : 'text-gray-400'
          }`} />
        </motion.div>
        
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            {isDragging ? 'Drop files here' : 'Upload files'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Drag and drop files here, or click to select files
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Maximum {maxFiles} files, up to {formatFileSize(maxFileSize)} each
          </p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInputChange}
          accept={acceptedTypes.join(',')}
          className="hidden"
        />
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Uploaded Files ({files.length})
            </h4>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((file, index) => {
                const FileIcon = getFileIcon(file.type, file.name);
                const isUploading = uploading.has(file.id);
                
                return (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {/* File Preview/Icon */}
                      <div className="flex-shrink-0">
                        {file.preview && showPreview ? (
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="w-10 h-10 rounded object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                            <FileIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Upload Progress */}
                    {isUploading && (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs text-gray-500">Uploading...</span>
                      </div>
                    )}
                    
                    {/* File Actions */}
                    {!isUploading && (
                      <div className="flex items-center space-x-2">
                        {/* Preview Button for images */}
                        {file.type.startsWith('image/') && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Open image preview modal
                              // You can implement this based on your modal system
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {/* Download Button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Create download link
                            const url = URL.createObjectURL(file.file);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = file.name;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        
                        {/* Remove Button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(file.id);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Type Info */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        <p>Supported file types: {acceptedTypes.join(', ')}</p>
      </div>
    </div>
  );
};

// File preview modal component
export const FilePreviewModal = ({ file, isOpen, onClose }) => {
  if (!isOpen || !file) return null;

  const FileIcon = file.type.startsWith('image/') ? Image : 
                   file.type.includes('pdf') ? FileText : File;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-full overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <FileIcon className="w-6 h-6 text-gray-500" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{file.name}</h3>
              <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          {file.type.startsWith('image/') ? (
            <img
              src={file.preview || URL.createObjectURL(file.file)}
              alt={file.name}
              className="max-w-full h-auto"
            />
          ) : (
            <div className="text-center py-8">
              <FileIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Preview not available for this file type
              </p>
              <Button
                onClick={() => {
                  const url = URL.createObjectURL(file.file);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = file.name;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="mt-4"
              >
                <Download className="w-4 h-4 mr-2" />
                Download File
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FileUpload;