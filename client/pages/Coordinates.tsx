import React, { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { api } from "../lib/api";
import { MapPin, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";

interface Coordinate {
  _id: string;
  name: string;
  description?: string;
  polygon: {
    type: "Polygon";
    coordinates: number[][][];
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Coordinates() {
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoordinate, setEditingCoordinate] = useState<Coordinate | null>(
    null,
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    coordinates: "",
  });
  const [error, setError] = useState("");

  const fetchCoordinates = async () => {
    try {
      const data = await api.getCoordinates();
      setCoordinates(data);
    } catch (error) {
      console.error("Failed to fetch coordinates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoordinates();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Parse coordinates string as JSON
      let parsedCoordinates;
      try {
        parsedCoordinates = JSON.parse(formData.coordinates);
      } catch {
        setError("Invalid coordinates format. Please provide valid JSON.");
        return;
      }

      const coordinateData = {
        name: formData.name,
        description: formData.description,
        polygon: {
          type: "Polygon",
          coordinates: parsedCoordinates,
        },
      };

      if (editingCoordinate) {
        await api.updateCoordinate(editingCoordinate._id, coordinateData);
      } else {
        await api.createCoordinate(coordinateData);
      }

      setIsDialogOpen(false);
      setEditingCoordinate(null);
      setFormData({ name: "", description: "", coordinates: "" });
      fetchCoordinates();
    } catch (error: any) {
      setError(error.message || "Operation failed");
    }
  };

  const handleEdit = (coordinate: Coordinate) => {
    setEditingCoordinate(coordinate);
    setFormData({
      name: coordinate.name,
      description: coordinate.description || "",
      coordinates: JSON.stringify(coordinate.polygon.coordinates, null, 2),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coordinate?")) return;

    try {
      await api.deleteCoordinate(id);
      fetchCoordinates();
    } catch (error) {
      console.error("Failed to delete coordinate:", error);
    }
  };

  const toggleActive = async (coordinate: Coordinate) => {
    try {
      await api.updateCoordinate(coordinate._id, {
        isActive: !coordinate.isActive,
      });
      fetchCoordinates();
    } catch (error) {
      console.error("Failed to update coordinate status:", error);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", coordinates: "" });
    setEditingCoordinate(null);
    setError("");
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Coordinate Management
          </h1>
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
          <h1 className="text-3xl font-bold text-gray-900">
            Coordinate Management
          </h1>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Coordinate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingCoordinate ? "Edit Coordinate" : "Add New Coordinate"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter coordinate name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coordinates">Coordinates (JSON Format)</Label>
                  <Textarea
                    id="coordinates"
                    value={formData.coordinates}
                    onChange={(e) =>
                      setFormData({ ...formData, coordinates: e.target.value })
                    }
                    placeholder="[[[lng1, lat1], [lng2, lat2], [lng3, lat3], [lng1, lat1]]]"
                    rows={6}
                    className="font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Example: [[[77.5946, 12.9716], [77.6946, 12.9716], [77.6946,
                    13.0716], [77.5946, 13.0716], [77.5946, 12.9716]]]
                  </p>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCoordinate ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Saved Coordinates ({coordinates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {coordinates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>
                  No coordinates found. Add your first coordinate to get
                  started.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coordinates.map((coordinate) => (
                      <TableRow key={coordinate._id}>
                        <TableCell className="font-medium">
                          {coordinate.name}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {coordinate.description || "No description"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              coordinate.isActive ? "default" : "secondary"
                            }
                          >
                            {coordinate.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {coordinate.polygon.coordinates[0]?.length || 0}{" "}
                          points
                        </TableCell>
                        <TableCell>
                          {new Date(coordinate.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleActive(coordinate)}
                            >
                              {coordinate.isActive ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(coordinate)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(coordinate._id)}
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
