import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { api } from '../lib/api';
import { Image as ImageIcon, Plus, Edit, Trash2, Eye, EyeOff, ExternalLink, FileText } from 'lucide-react';
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

interface Content {
  _id: string;
  title: string;
  content: string;
  isActive: boolean;
  order: number;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function Sliders() {
  // Slider state
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [isSliderLoading, setIsSliderLoading] = useState(true);
  const [isSliderDialogOpen, setIsSliderDialogOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null);
  const [sliderFormData, setSliderFormData] = useState({
    title: '',
    imageUrl: '',
    order: 0
  });
  const [sliderError, setSliderError] = useState('');

  // Content state
  const [contents, setContents] = useState<Content[]>([]);
  const [isContentLoading, setIsContentLoading] = useState(true);
  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [contentFormData, setContentFormData] = useState({
    title: '',
    content: '',
    order: 0
  });
  const [contentError, setContentError] = useState('');

  // Word count calculation
  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const fetchSliders = async () => {
    try {
      const data = await api.getSliders();
      setSliders(data);
    } catch (error) {
      console.error('Failed to fetch sliders:', error);
    } finally {
      setIsSliderLoading(false);
    }
  };

  const fetchContents = async () => {
    try {
      const data = await api.getContents();
      setContents(data);
    } catch (error) {
      console.error('Failed to fetch contents:', error);
    } finally {
      setIsContentLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
    fetchContents();
  }, []);

  // Slider functions
  const handleSliderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSliderError('');

    try {
      const sliderData = {
        title: sliderFormData.title || undefined,
        imageUrl: sliderFormData.imageUrl,
        order: sliderFormData.order
      };

      if (editingSlider) {
        await api.updateSlider(editingSlider._id, sliderData);
      } else {
        await api.createSlider(sliderData);
      }

      setIsSliderDialogOpen(false);
      setEditingSlider(null);
      setSliderFormData({ title: '', imageUrl: '', order: 0 });
      fetchSliders();
    } catch (error: any) {
      setSliderError(error.message || 'Operation failed');
    }
  };

  const handleSliderEdit = (slider: Slider) => {
    setEditingSlider(slider);
    setSliderFormData({
      title: slider.title || '',
      imageUrl: slider.imageUrl,
      order: slider.order
    });
    setIsSliderDialogOpen(true);
  };

  const handleSliderDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slider?')) return;

    try {
      await api.deleteSlider(id);
      fetchSliders();
    } catch (error) {
      console.error('Failed to delete slider:', error);
    }
  };

  const toggleSliderActive = async (slider: Slider) => {
    try {
      await api.updateSlider(slider._id, { isActive: !slider.isActive });
      fetchSliders();
    } catch (error) {
      console.error('Failed to update slider status:', error);
    }
  };

  // Content functions
  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContentError('');

    try {
      const wordCount = getWordCount(contentFormData.content);
      if (wordCount > 30) {
        setContentError('Content cannot exceed 30 words');
        return;
      }

      const contentData = {
        title: contentFormData.title,
        content: contentFormData.content,
        order: contentFormData.order
      };

      if (editingContent) {
        await api.updateContent(editingContent._id, contentData);
      } else {
        await api.createContent(contentData);
      }

      setIsContentDialogOpen(false);
      setEditingContent(null);
      setContentFormData({ title: '', content: '', order: 0 });
      fetchContents();
    } catch (error: any) {
      setContentError(error.message || 'Operation failed');
    }
  };

  const handleContentEdit = (content: Content) => {
    setEditingContent(content);
    setContentFormData({
      title: content.title,
      content: content.content,
      order: content.order
    });
    setIsContentDialogOpen(true);
  };

  const handleContentDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      await api.deleteContent(id);
      fetchContents();
    } catch (error) {
      console.error('Failed to delete content:', error);
    }
  };

  const toggleContentActive = async (content: Content) => {
    try {
      await api.updateContent(content._id, { isActive: !content.isActive });
      fetchContents();
    } catch (error) {
      console.error('Failed to update content status:', error);
    }
  };

  const resetSliderForm = () => {
    setSliderFormData({ title: '', imageUrl: '', order: 0 });
    setEditingSlider(null);
    setSliderError('');
  };

  const resetContentForm = () => {
    setContentFormData({ title: '', content: '', order: 0 });
    setEditingContent(null);
    setContentError('');
  };

  const currentWordCount = getWordCount(contentFormData.content);
  const isWordLimitExceeded = currentWordCount > 30;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Media & Content Management</h1>

        <Tabs defaultValue="sliders" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sliders" className="flex items-center">
              <ImageIcon className="mr-2 h-4 w-4" />
              Image Sliders
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Text Content
            </TabsTrigger>
          </TabsList>

          {/* Sliders Tab */}
          <TabsContent value="sliders" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Image Sliders</h2>
              <Dialog open={isSliderDialogOpen} onOpenChange={(open) => {
                setIsSliderDialogOpen(open);
                if (!open) resetSliderForm();
              }}>
                <DialogTrigger asChild>
                  <Button>
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
                  <form onSubmit={handleSliderSubmit} className="space-y-4">
                    {sliderError && (
                      <Alert variant="destructive">
                        <AlertDescription>{sliderError}</AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="slider-title">Title (Optional)</Label>
                      <Input
                        id="slider-title"
                        value={sliderFormData.title}
                        onChange={(e) => setSliderFormData({ ...sliderFormData, title: e.target.value })}
                        placeholder="Enter slider title"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slider-imageUrl">Image URL</Label>
                      <Input
                        id="slider-imageUrl"
                        type="url"
                        value={sliderFormData.imageUrl}
                        onChange={(e) => setSliderFormData({ ...sliderFormData, imageUrl: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slider-order">Display Order</Label>
                      <Input
                        id="slider-order"
                        type="number"
                        value={sliderFormData.order}
                        onChange={(e) => setSliderFormData({ ...sliderFormData, order: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    {sliderFormData.imageUrl && (
                      <div className="space-y-2">
                        <Label>Preview</Label>
                        <div className="border rounded-lg overflow-hidden">
                          <img
                            src={sliderFormData.imageUrl}
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
                      <Button type="button" variant="outline" onClick={() => setIsSliderDialogOpen(false)}>
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
                <CardTitle>All Sliders ({sliders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {isSliderLoading ? (
                  <div className="text-center py-8">Loading sliders...</div>
                ) : sliders.length === 0 ? (
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
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleSliderActive(slider)}
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
                                  onClick={() => handleSliderEdit(slider)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSliderDelete(slider._id)}
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
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Text Content</h2>
              <Dialog open={isContentDialogOpen} onOpenChange={(open) => {
                setIsContentDialogOpen(open);
                if (!open) resetContentForm();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Content
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingContent ? 'Edit Content' : 'Add New Content'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleContentSubmit} className="space-y-4">
                    {contentError && (
                      <Alert variant="destructive">
                        <AlertDescription>{contentError}</AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="content-title">Title</Label>
                      <Input
                        id="content-title"
                        value={contentFormData.title}
                        onChange={(e) => setContentFormData({ ...contentFormData, title: e.target.value })}
                        placeholder="Enter content title"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content-text">Content</Label>
                      <Textarea
                        id="content-text"
                        value={contentFormData.content}
                        onChange={(e) => setContentFormData({ ...contentFormData, content: e.target.value })}
                        placeholder="Enter your content here (max 30 words)"
                        rows={4}
                        required
                        className={isWordLimitExceeded ? 'border-red-500' : ''}
                      />
                      <div className="flex justify-between items-center text-xs">
                        <span className={isWordLimitExceeded ? 'text-red-500' : 'text-gray-500'}>
                          Words: {currentWordCount}/30
                        </span>
                        {isWordLimitExceeded && (
                          <span className="text-red-500">Word limit exceeded!</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content-order">Display Order</Label>
                      <Input
                        id="content-order"
                        type="number"
                        value={contentFormData.order}
                        onChange={(e) => setContentFormData({ ...contentFormData, order: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsContentDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isWordLimitExceeded}>
                        {editingContent ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Content ({contents.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {isContentLoading ? (
                  <div className="text-center py-8">Loading content...</div>
                ) : contents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p>No content found. Add your first content to get started.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Content</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Words</TableHead>
                          <TableHead>Order</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contents.map((content) => (
                          <TableRow key={content._id}>
                            <TableCell className="font-medium">{content.title}</TableCell>
                            <TableCell className="max-w-md">
                              <div className="truncate" title={content.content}>
                                {content.content}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={content.isActive ? 'default' : 'secondary'}>
                                {content.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>{content.wordCount}/30</TableCell>
                            <TableCell>{content.order}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleContentActive(content)}
                                >
                                  {content.isActive ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleContentEdit(content)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleContentDelete(content._id)}
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
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
