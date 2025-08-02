
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Chatbot from './Chatbot';

function Layout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <Outlet />
        </main>
      </div>
      <Chatbot />
    </div>
  );
}

export default Layout;
