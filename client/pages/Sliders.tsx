import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { api } from '../lib/api';
import { Image as ImageIcon, Plus, Edit, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

interface Slider {
  _id: string;
  title?: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Sliders() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    order: 0
  });
  const [error, setError] = useState('');

  const fetchSliders = async () => {
    try {
      const data = await api.getSliders();
      setSliders(data);
    } catch (error) {
      console.error('Failed to fetch sliders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const sliderData = {
        title: formData.title || undefined,
        imageUrl: formData.imageUrl,
        order: formData.order
      };

      if (editingSlider) {
        await api.updateSlider(editingSlider._id, sliderData);
      } else {
        await api.createSlider(sliderData);
      }

      setIsDialogOpen(false);
      setEditingSlider(null);
      setFormData({ title: '', imageUrl: '', order: 0 });
      fetchSliders();
    } catch (error: any) {
      setError(error.message || 'Operation failed');
    }
  };

  const handleEdit = (slider: Slider) => {
    setEditingSlider(slider);
    setFormData({
      title: slider.title || '',
      imageUrl: slider.imageUrl,
      order: slider.order
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slider?')) return;

    try {
      await api.deleteSlider(id);
      fetchSliders();
    } catch (error) {
      console.error('Failed to delete slider:', error);
    }
  };

  const toggleActive = async (slider: Slider) => {
    try {
      await api.updateSlider(slider._id, { isActive: !slider.isActive });
      fetchSliders();
    } catch (error) {
      console.error('Failed to update slider status:', error);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', imageUrl: '', order: 0 });
    setEditingSlider(null);
    setError('');
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Slider Management</h1>
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
          <h1 className="text-3xl font-bold text-gray-900">Slider Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Slider
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSlider ? 'Edit Slider' : 'Add New Slider'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="title">Title (Optional)</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter slider title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
                  />
                  <p className="text-xs text-gray-500">
                    Lower numbers appear first. Use 0 for default ordering.
                  </p>
                </div>

                {formData.imageUrl && (
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingSlider ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ImageIcon className="mr-2 h-5 w-5" />
              All Sliders ({sliders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sliders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>No sliders found. Add your first slider to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Preview</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sliders.map((slider) => (
                      <TableRow key={slider._id}>
                        <TableCell>
                          <div className="w-16 h-12 bg-gray-100 rounded overflow-hidden">
                            <img
                              src={slider.imageUrl}
                              alt={slider.title || 'Slider'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {slider.title || 'Untitled'}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <ExternalLink className="mr-1 h-3 w-3" />
                              <a
                                href={slider.imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="truncate max-w-xs hover:underline"
                              >
                                {slider.imageUrl}
                              </a>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={slider.isActive ? 'default' : 'secondary'}>
                            {slider.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>{slider.order}</TableCell>
                        <TableCell>
                          {new Date(slider.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleActive(slider)}
                            >
                              {slider.isActive ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(slider)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(slider._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
