
import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { getDocuments } from '../redux/documentSlice';
import imageCompression from 'browser-image-compression';

function DocumentUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      await processAndSetFile(file);
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      await processAndSetFile(file);
    }
  };

  const processAndSetFile = async (file) => {
    console.log('Processing file:', file.name, 'Type:', file.type);
    // Check if the file is an image type that can be compressed
    if (file.type.startsWith('image/') && (file.type.includes('jpeg') || file.type.includes('png'))) {
      try {
        const options = {
          maxSizeMB: 1,          // (max file size in MB)
          maxWidthOrHeight: 1920, // (max width or height in pixels)
          useWebWorker: true,    // (use web worker for faster compression)
        };
        const compressedFile = await imageCompression(file, options);
        console.log(`Original image size: ${file.size / 1024 / 1024} MB`);
        console.log(`Compressed image size: ${compressedFile.size / 1024 / 1024} MB`);
        setSelectedFile(compressedFile);
      } catch (error) {
        console.error('Image compression error:', error);
        toast.error('Failed to compress image. Uploading original file.');
        setSelectedFile(file); // Fallback to original file if compression fails
      }
    } else {
      setSelectedFile(file);
    }
    setUploadProgress(0);
    setIsUploading(false);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile, selectedFile.name);

    try {
      const response = await axios.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.min(99, Math.round((progressEvent.loaded * 100) / progressEvent.total));
          setUploadProgress(percentCompleted);
        },
      });
      toast.success(`File uploaded successfully: ${response.data.filename}`);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      dispatch(getDocuments());
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || 'Error uploading file.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <Toaster />
      <h2 className="text-2xl font-bold mb-4">Upload Document</h2>

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200
          ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <input
          type="file"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.docx,.txt,.md,.jpg,.jpeg,.png"
        />
        {selectedFile ? (
          <p className="text-gray-700 font-medium">Selected file: {selectedFile.name}</p>
        ) : (
          <p className="text-gray-500">Drag & drop a file here, or click to select</p>
        )}
        <p className="mt-2 text-sm text-gray-500">Supported formats: PDF, DOCX, TXT, MD, JPG, JPEG, PNG</p>
      </div>

      {isUploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-indigo-600 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">Uploading: {uploadProgress}%</p>
        </div>
      )}

      <button
        onClick={handleUpload}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        disabled={isUploading}
      >
        {isUploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}

export default DocumentUpload;
