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
import { Switch } from "../components/ui/switch";
import { api } from "../lib/api";
import {
  Settings as SettingsIcon,
  Save,
  Link as LinkIcon,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";

interface Settings {
  _id: string;
  modulesVisibility: {
    sliders: boolean;
    statistics: boolean;
    reports: boolean;
    feedback: boolean;
    help: boolean;
  };
  sliderAutoScrollInterval: number;
  statisticsLink?: string;
}

export default function Settings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      setMessage({ type: "error", text: "Failed to load settings" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    setMessage(null);

    try {
      await api.updateSettings(settings);
      setMessage({ type: "success", text: "Settings saved successfully!" });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to save settings",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateModuleVisibility = (
    module: keyof Settings["modulesVisibility"],
    value: boolean,
  ) => {
    if (!settings) return;

    setSettings({
      ...settings,
      modulesVisibility: {
        ...settings.modulesVisibility,
        [module]: value,
      },
    });
  };

  const updateSliderInterval = (value: number) => {
    if (!settings) return;

    setSettings({
      ...settings,
      sliderAutoScrollInterval: Math.max(1000, value), // Minimum 1 second
    });
  };

  const updateStatisticsLink = (value: string) => {
    if (!settings) return;

    setSettings({
      ...settings,
      statisticsLink: value,
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!settings) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load settings. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Module Visibility Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="mr-2 h-5 w-5" />
              Activity Management
            </CardTitle>
            <p className="text-sm text-gray-600">
              Control the visibility of app modules for end users
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(settings.modulesVisibility).map(
              ([module, isVisible]) => (
                <div
                  key={module}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center space-x-3">
                    {isVisible ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                    <div>
                      <Label className="text-sm font-medium capitalize">
                        {module}
                      </Label>
                      <p className="text-xs text-gray-500">
                        {isVisible ? "Visible to users" : "Hidden from users"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={isVisible}
                    onCheckedChange={(value) =>
                      updateModuleVisibility(
                        module as keyof Settings["modulesVisibility"],
                        value,
                      )
                    }
                  />
                </div>
              ),
            )}
          </CardContent>
        </Card>

        {/* Slider Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Slider Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sliderInterval">
                Auto-scroll Interval (milliseconds)
              </Label>
              <Input
                id="sliderInterval"
                type="number"
                value={settings.sliderAutoScrollInterval}
                onChange={(e) =>
                  updateSliderInterval(parseInt(e.target.value) || 5000)
                }
                min="1000"
                step="1000"
                placeholder="5000"
              />
              <p className="text-xs text-gray-500">
                Time between automatic slide transitions. Minimum: 1000ms (1
                second)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Link Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LinkIcon className="mr-2 h-5 w-5" />
              Statistics Link
            </CardTitle>
            <p className="text-sm text-gray-600">
              URL that will be opened when users access the Statistics section
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="statisticsLink">Statistics URL</Label>
              <Input
                id="statisticsLink"
                type="url"
                value={settings.statisticsLink || ""}
                onChange={(e) => updateStatisticsLink(e.target.value)}
                placeholder="https://example.com/statistics"
              />
              <p className="text-xs text-gray-500">
                Leave empty to disable the statistics section. This link will
                open in the app's browser or WebView.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <SettingsIcon className="mr-2 h-5 w-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Settings ID:</span>
                  <span className="font-mono text-xs">{settings._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Modules:</span>
                  <span>
                    {
                      Object.values(settings.modulesVisibility).filter(Boolean)
                        .length
                    }
                    /{Object.keys(settings.modulesVisibility).length}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Slider Interval:</span>
                  <span>{settings.sliderAutoScrollInterval}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Statistics Link:</span>
                  <span
                    className={
                      settings.statisticsLink
                        ? "text-green-600"
                        : "text-gray-400"
                    }
                  >
                    {settings.statisticsLink ? "Configured" : "Not set"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
