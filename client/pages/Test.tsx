import React from 'react';
import AdminLayout from '../components/AdminLayout';

export default function Test() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Test Page</h1>
        <p>This is a test page to verify the layout is working correctly.</p>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Content Area</h2>
          <p>This content should appear in the main area with proper spacing.</p>
        </div>
      </div>
    </AdminLayout>
  );
}
