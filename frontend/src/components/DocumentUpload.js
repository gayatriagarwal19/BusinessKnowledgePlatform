
import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { getDocuments } from '../redux/documentSlice';

function DocumentUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
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
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <Toaster />
      <h2 className="text-2xl font-bold mb-4">Upload Document</h2>
      <div className="mb-4">
        <input
          type="file"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-indigo-50 file:text-indigo-700
            hover:file:bg-indigo-100"
        />
        <p className="mt-2 px-2 text-sm text-gray-500">Supported formats: PDF, DOCX, TXT, MD</p>
      </div>
      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Upload
      </button>
    </div>
  );
}

export default DocumentUpload;
