import React, { createContext, useContext, useState, ReactNode } from "react";
import { Application, PositionCategory } from "@/types/position";

interface ApplicationContextType {
  applications: Application[];
  addApplication: (application: Omit<Application, "id" | "submittedAt" | "status" | "priority">) => void;
  cancelApplication: (id: string) => void;
  getAppliedCategories: (positionId: string) => PositionCategory[];
  hasAppliedToPosition: (positionId: string, category?: string) => boolean;
  reorderApplications: (reorderedApps: Application[]) => void;
  moveApplicationUp: (id: string) => void;
  moveApplicationDown: (id: string) => void;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider = ({ children }: { children: ReactNode }) => {
  const [applications, setApplications] = useState<Application[]>([]);

  const addApplication = (application: Omit<Application, "id" | "submittedAt" | "status" | "priority">) => {
    setApplications((prev) => {
      const activePendingApps = prev.filter(app => app.status === "pending");
      const nextPriority = activePendingApps.length > 0 
        ? Math.max(...activePendingApps.map(app => app.priority)) + 1 
        : 1;
      
      const newApplication: Application = {
        ...application,
        id: Math.random().toString(36).substr(2, 9),
        submittedAt: new Date(),
        status: "pending",
        priority: nextPriority,
      };
      
      return [...prev, newApplication];
    });
  };

  const cancelApplication = (id: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: "cancelled" as const } : app))
    );
  };

  const getAppliedCategories = (positionId: string): PositionCategory[] => {
    return applications
      .filter((app) => app.positionId === positionId && app.status === "pending")
      .map((app) => app.category)
      .filter((cat): cat is PositionCategory => cat !== undefined);
  };

  const hasAppliedToPosition = (positionId: string, category?: string) => {
    const activeApps = applications.filter(
      (app) => app.positionId === positionId && app.status === "pending"
    );
    
    if (category) {
      return activeApps.some((app) => app.category === category);
    }
    
    return activeApps.length > 0;
  };

  const reorderApplications = (reorderedApps: Application[]) => {
    const updatedApps = reorderedApps.map((app, index) => ({
      ...app,
      priority: index + 1,
    }));
    
    setApplications((prev) => {
      const cancelledApps = prev.filter(app => app.status === "cancelled");
      return [...updatedApps, ...cancelledApps];
    });
  };

  const moveApplicationUp = (id: string) => {
    setApplications((prev) => {
      const activeApps = prev.filter(app => app.status === "pending").sort((a, b) => a.priority - b.priority);
      const currentIndex = activeApps.findIndex(app => app.id === id);
      
      if (currentIndex <= 0) return prev;
      
      const newActiveApps = [...activeApps];
      [newActiveApps[currentIndex - 1], newActiveApps[currentIndex]] = 
        [newActiveApps[currentIndex], newActiveApps[currentIndex - 1]];
      
      const updatedApps = newActiveApps.map((app, index) => ({
        ...app,
        priority: index + 1,
      }));
      
      const cancelledApps = prev.filter(app => app.status === "cancelled");
      return [...updatedApps, ...cancelledApps];
    });
  };

  const moveApplicationDown = (id: string) => {
    setApplications((prev) => {
      const activeApps = prev.filter(app => app.status === "pending").sort((a, b) => a.priority - b.priority);
      const currentIndex = activeApps.findIndex(app => app.id === id);
      
      if (currentIndex < 0 || currentIndex >= activeApps.length - 1) return prev;
      
      const newActiveApps = [...activeApps];
      [newActiveApps[currentIndex], newActiveApps[currentIndex + 1]] = 
        [newActiveApps[currentIndex + 1], newActiveApps[currentIndex]];
      
      const updatedApps = newActiveApps.map((app, index) => ({
        ...app,
        priority: index + 1,
      }));
      
      const cancelledApps = prev.filter(app => app.status === "cancelled");
      return [...updatedApps, ...cancelledApps];
    });
  };

  return (
    <ApplicationContext.Provider 
      value={{ 
        applications, 
        addApplication, 
        cancelApplication, 
        getAppliedCategories,
        hasAppliedToPosition,
        reorderApplications,
        moveApplicationUp,
        moveApplicationDown
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplications = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error("useApplications must be used within ApplicationProvider");
  }
  return context;
};
