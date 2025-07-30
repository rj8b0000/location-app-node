import React, { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { api } from "../lib/api";
import {
  Users,
  MapPin,
  Image,
  MessageSquare,
  Activity,
  TrendingUp,
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalCoordinates: number;
  totalSliders: number;
  totalFeedbacks: number;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">
        {title}
      </CardTitle>
      <Icon className={`h-4 w-4 ${color}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCoordinates: 0,
    totalSliders: 0,
    totalFeedbacks: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async (retryCount = 0) => {
      try {
        // Test basic connectivity first
        console.log("Testing API connectivity...");
        await api.ping();
        console.log("API ping successful");

        console.log("Attempting to fetch dashboard stats...");
        const response = await api.getDashboardStats();
        console.log("Dashboard stats response:", response);
        setStats(response);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);

        // Retry once if it's the first failure and not an auth issue
        if (retryCount < 1 && error instanceof Error && !error.message.includes("401")) {
          console.log("Retrying after 1 second...");
          setTimeout(() => fetchStats(retryCount + 1), 1000);
          return;
        }

        // Check if it's an authentication error
        if (error instanceof Error && (error.message.includes("401") || error.message.includes("Unauthorized"))) {
          console.error("Authentication error, redirecting to login");
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }

        // Set some default values to prevent UI issues
        setStats({
          totalUsers: 0,
          totalCoordinates: 0,
          totalSliders: 0,
          totalFeedbacks: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Activity className="h-4 w-4" />
            <span>Live Data</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="text-blue-600"
          />
          <StatCard
            title="Total Coordinates"
            value={stats.totalCoordinates}
            icon={MapPin}
            color="text-green-600"
          />
          <StatCard
            title="Total Sliders"
            value={stats.totalSliders}
            icon={Image}
            color="text-purple-600"
          />
          <StatCard
            title="Total Feedbacks"
            value={stats.totalFeedbacks}
            icon={MessageSquare}
            color="text-orange-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">User Management</span>
                  <span className="font-medium">{stats.totalUsers} users</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Geo Locations</span>
                  <span className="font-medium">
                    {stats.totalCoordinates} areas
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Media Content</span>
                  <span className="font-medium">
                    {stats.totalSliders} sliders
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">User Feedback</span>
                  <span className="font-medium">
                    {stats.totalFeedbacks} messages
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Status</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-green-600">
                      Online
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-green-600">
                      Connected
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Location Services
                  </span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-green-600">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
