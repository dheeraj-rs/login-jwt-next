"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/button";
import { LogOut, User, Shield, AlertCircle, Users, Settings, Lock, UserPlus } from "lucide-react";
import { toast } from "sonner";

type UserAction = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  adminOnly: boolean;
  handler: () => void;
};

export default function DashboardPage() {
  const { user, loading, logout, isAdmin } = useAuth();
  const router = useRouter();
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  const handleAction = async (actionId: string, handler: () => void) => {
    if (!isAdmin) {
      toast.error("You don't have permission to perform this action.");
      return;
    }

    try {
      setActionInProgress(actionId);
      await handler();
      toast.success("Action performed successfully!");
    } catch (error) {
      toast.error("Failed to perform action");
    } finally {
      setActionInProgress(null);
    }
  };

  const actions: UserAction[] = [
    {
      id: "manage-users",
      name: "Manage Users",
      description: "View and manage user accounts",
      icon: <Users className="h-5 w-5" />,
      adminOnly: true,
      handler: () => {
        // Implement user management logic
        console.log("Managing users");
      }
    },
    {
      id: "system-settings",
      name: "System Settings",
      description: "Configure system-wide settings",
      icon: <Settings className="h-5 w-5" />,
      adminOnly: true,
      handler: () => {
        // Implement settings management
        console.log("Accessing system settings");
      }
    },
    {
      id: "security",
      name: "Security Controls",
      description: "Manage security settings and permissions",
      icon: <Lock className="h-5 w-5" />,
      adminOnly: true,
      handler: () => {
        // Implement security controls
        console.log("Managing security");
      }
    },
    {
      id: "create-user",
      name: "Create User",
      description: "Add new user accounts",
      icon: <UserPlus className="h-5 w-5" />,
      adminOnly: true,
      handler: () => {
        // Implement user creation
        console.log("Creating new user");
      }
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            {isAdmin && (
              <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Admin
              </span>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-card shadow-sm rounded-lg p-6 border border-border">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-medium">Welcome!</h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Role: {user?.role === 'admin' ? 'Administrator' : 'Regular User'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {actions.map((action) => (
              <div
                key={action.id}
                className={`bg-card rounded-lg p-4 border border-border transition-all duration-200 ${
                  !isAdmin && action.adminOnly ? 'opacity-50' : 'hover:border-primary/50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-md bg-primary/10 text-primary">
                    {action.icon}
                  </div>
                  {action.adminOnly && (
                    <span className="text-xs bg-primary/5 text-primary px-2 py-1 rounded-full">
                      Admin Only
                    </span>
                  )}
                </div>
                <h3 className="font-medium mb-1">{action.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {action.description}
                </p>
                <Button
                  className="w-full"
                  variant={isAdmin ? "default" : "secondary"}
                  disabled={!isAdmin || actionInProgress === action.id}
                  onClick={() => handleAction(action.id, action.handler)}
                >
                  {actionInProgress === action.id ? (
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    action.name
                  )}
                </Button>
              </div>
            ))}
          </div>

          {!isAdmin && (
            <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">
                  Some actions are restricted to administrators only. Contact your system administrator for access.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}