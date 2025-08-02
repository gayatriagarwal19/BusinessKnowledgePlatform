import React from 'react';

function DocumentSearch() {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Search Documents</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by filename or content..."
          className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <button
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Search
      </button>
    </div>
  );
}

export default DocumentSearch;
