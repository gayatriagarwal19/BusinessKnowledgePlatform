import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getDocuments } from '../redux/documentSlice';
import DocumentUpload from '../components/DocumentUpload';
import DocumentSearch from '../components/DocumentSearch';

function Documents() {
  const dispatch = useDispatch();
  const { documents, isLoading, error } = useSelector((state) => state.documents);

  useEffect(() => {
    dispatch(getDocuments());
  }, [dispatch]);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <DocumentSearch />
        <DocumentUpload />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">My Documents</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <p className="p-4">Loading documents...</p>
          ) : error ? (
            <p className="p-4 text-red-600">{error.msg || 'Error loading documents.'}</p>
          ) : (
            documents.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents.map((doc, index) => (
                    <tr key={doc._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="group relative">
                          <span className="text-gray-500 mr-3">{index + 1}.</span>
                          {doc.filename}
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            Size: {typeof doc.size === 'number' ? `${(doc.size / 1024).toFixed(2)} KB` : 'N/A'}<br />
                            Uploaded: {new Date(doc.upload_date).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{new Date(doc.upload_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-4">No documents found. Upload a document to get started!</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default Documents;