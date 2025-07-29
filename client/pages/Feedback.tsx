import React, { useState, useEffect } from 'react';
import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { api } from '../lib/api';
import { MessageSquare, Trash2, User, Calendar } from 'lucide-react';

interface Feedback {
  _id: string;
  userName: string;
  message: string;
  userId?: {
    _id: string;
    fullName: string;
    mobileNumber: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFeedbacks = async () => {
    try {
      const data = await api.getFeedbacks();
      setFeedbacks(data);
    } catch (error) {
      console.error('Failed to fetch feedbacks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;

    try {
      await api.deleteFeedback(id);
      fetchFeedbacks();
    } catch (error) {
      console.error('Failed to delete feedback:', error);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Feedback Management</h1>
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Feedback Management</h1>
          <div className="text-sm text-gray-500">
            Total: {feedbacks.length} feedback entries
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              User Feedback ({feedbacks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {feedbacks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>No feedback found. User feedback will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedbacks.map((feedback) => (
                  <div
                    key={feedback._id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <User key={`${feedback._id}-user-icon`} className="h-4 w-4 text-gray-400" />
                          <span key={`${feedback._id}-user-name`} className="font-medium text-gray-900">
                            {feedback.userName}
                          </span>
                          {feedback.userId && (
                            <span key={`${feedback._id}-user-mobile`} className="text-sm text-gray-500">
                              ({feedback.userId.mobileNumber})
                            </span>
                          )}
                          <div key={`${feedback._id}-date-info`} className="flex items-center text-xs text-gray-500">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(feedback.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-md p-3 mb-3">
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {feedback.message}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(feedback._id)}
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alternative table view */}
        <Card>
          <CardHeader>
            <CardTitle>Table View</CardTitle>
          </CardHeader>
          <CardContent>
            {feedbacks.length > 0 && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User Name</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedbacks.map((feedback) => (
                      <TableRow key={feedback._id}>
                        <TableCell className="font-medium">
                          {feedback.userName}
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div className="truncate" title={feedback.message}>
                            {feedback.message}
                          </div>
                        </TableCell>
                        <TableCell>
                          {feedback.userId?.mobileNumber || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(feedback._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
