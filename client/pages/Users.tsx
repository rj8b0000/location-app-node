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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
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
import {
  Users as UsersIcon,
  Plus,
  Edit,
  Trash2,
  Phone,
  User,
} from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";

interface User {
  _id: string;
  fullName: string;
  mobileNumber: string;
  role: "admin" | "user";
  createdAt: string;
  updatedAt: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    password: "",
    role: "user" as "admin" | "user",
  });
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      // Check authentication before making API call
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No auth token found, redirecting to login");
        window.location.href = "/login";
        return;
      }

      const data = await api.getUsers();
      // Filter out any invalid user objects
      const validUsers = data.filter(
        (user: any) =>
          user &&
          user._id &&
          user.fullName &&
          user.mobileNumber &&
          user.role &&
          user.createdAt,
      );
      setUsers(validUsers);
    } catch (error: any) {
      console.error("Failed to fetch users:", error);
      if (error.message?.includes("401") || error.message?.includes("authorization")) {
        console.log("Authentication error, redirecting to login");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token missing. Please log in again.");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
      return;
    }

    try {
      const userData = {
        fullName: formData.fullName,
        mobileNumber: formData.mobileNumber,
        role: formData.role,
        ...(formData.password && { password: formData.password }),
      };

      console.log("Submitting user data:", userData);

      if (editingUser) {
        await api.updateUser(editingUser._id, userData);
      } else {
        if (!formData.password) {
          setError("Password is required for new users");
          return;
        }
        await api.createUser(userData);
      }

      setIsDialogOpen(false);
      setEditingUser(null);
      setFormData({
        fullName: "",
        mobileNumber: "",
        password: "",
        role: "user",
      });
      fetchUsers();
    } catch (error: any) {
      console.error("User operation error:", error);
      if (error.message?.includes("401") || error.message?.includes("authorization")) {
        setError("Authentication failed. Please log in again.");
        setTimeout(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }, 2000);
      } else {
        setError(error.message || "Operation failed");
      }
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      mobileNumber: user.mobileNumber,
      password: "",
      role: user.role,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.deleteUser(id);
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const resetForm = () => {
    setFormData({ fullName: "", mobileNumber: "", password: "", role: "user" });
    setEditingUser(null);
    setError("");
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
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
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? "Edit User" : "Add New User"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Mobile Number</Label>
                  <Input
                    id="mobileNumber"
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, mobileNumber: e.target.value })
                    }
                    placeholder="Enter mobile number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password{" "}
                    {editingUser && "(Leave empty to keep current password)"}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Enter password"
                    required={!editingUser}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: "admin" | "user") =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
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
                    {editingUser ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UsersIcon className="mr-2 h-5 w-5" />
              All Users ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <UsersIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>No users found. Add your first user to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Mobile Number</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4 text-gray-400" />
                            <span className="font-medium">
                              {user.fullName || "Unknown"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Phone className="mr-2 h-4 w-4 text-gray-400" />
                            {user.mobileNumber || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.role === "admin" ? "default" : "secondary"
                            }
                          >
                            {user.role || "user"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "Unknown"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(user._id)}
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
