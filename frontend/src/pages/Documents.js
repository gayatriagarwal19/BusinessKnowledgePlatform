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
        <div className="bg-white rounded-lg shadow-md p-4">
          {isLoading ? (
            <p>Loading documents...</p>
          ) : error ? (
            <p className="text-red-600">{error.msg || 'Error loading documents.'}</p>
          ) : (
            <ul>
              {documents.map((doc, index) => (
                <li key={doc._id} className="flex justify-between items-center p-2 border-b">
                  <div className="flex items-center">
                    <span className="mr-2">{index + 1}.</span>
                    <span>{doc.filename}</span>
                  </div>
                  <span>{new Date(doc.upload_date).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Documents;
