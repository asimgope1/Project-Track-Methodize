"use client";

import React, { useState, useEffect } from "react";

export default function Home() {
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleName, setNewModuleName] = useState("");
  const [modules, setModules] = useState([
    {
      id: "m1",
      name: "Authentication & Authorization",
      tasks: {
        UI: "completed",
        UX: "completed",
        Backend: "completed",
        Testing: "pending",
        Deployment: "pending",
      },
    },
    {
      id: "m2",
      name: "User Dashboard",
      tasks: {
        UI: "completed",
        UX: "completed",
        Backend: "pending",
        Testing: "pending",
        Deployment: "pending",
      },
    },
    {
      id: "m3",
      name: "Billing & Subscriptions",
      tasks: {
        UI: "pending",
        UX: "pending",
        Backend: "pending",
        Testing: "pending",
        Deployment: "pending",
      },
    },
    {
      id: "m4",
      name: "Settings & Profile",
      tasks: {
        UI: "pending",
        UX: "pending",
        Backend: "pending",
        Testing: "pending",
        Deployment: "pending",
      },
    }
  ]);

  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    // Calculate overall progress
    let totalTasks = 0;
    let completedTasks = 0;

    modules.forEach((mod) => {
      Object.values(mod.tasks).forEach((status) => {
        totalTasks++;
        if (status === "completed") completedTasks++;
      });
    });

    if (totalTasks > 0) {
      setOverallProgress(Math.round((completedTasks / totalTasks) * 100));
    }
  }, [modules]);

  const toggleStatus = (moduleId, taskType) => {
    setModules(prevModules => 
      prevModules.map(mod => {
        if (mod.id === moduleId) {
          const currentStatus = mod.tasks[taskType];
          // Toggle between completed and pending
          const newStatus = currentStatus === "completed" ? "pending" : "completed";
          return {
            ...mod,
            tasks: {
              ...mod.tasks,
              [taskType]: newStatus
            }
          };
        }
        return mod;
      })
    );
  };

  const handleAddModule = () => {
    if (newModuleName.trim()) {
      setModules([
        ...modules,
        {
          id: `m${Date.now()}`,
          name: newModuleName.trim(),
          tasks: {
            UI: "pending",
            UX: "pending",
            Backend: "pending",
            Testing: "pending",
            Deployment: "pending",
          },
        },
      ]);
      setNewModuleName("");
      setIsAddingModule(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-success-subtle text-success";
      case "pending":
      default:
        return "bg-light text-secondary";
    }
  };

  // Modern Checkbox look
  const renderCheckbox = (status) => {
    if (status === "completed") {
      return (
        <div className="d-flex align-items-center justify-content-center h-100">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
      );
    }
    return (
        <div className="d-flex align-items-center justify-content-center h-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-secondary"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
        </div>
    );
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "#f4f7f6" }}>
      <header className="py-3 px-4 d-flex justify-content-between align-items-center shadow-sm" style={{ background: "#ffffff" }}>
        <h4 className="m-0 fw-bold text-primary">📊 Individual Project Tracker</h4>
        <div className="d-flex align-items-center gap-3">
          <span className="text-secondary fw-semibold">Interactive Mode</span>
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold">{overallProgress}%</span>
            <div className="progress" style={{ width: "150px", height: "8px" }}>
              <div
                className="progress-bar bg-primary"
                role="progressbar"
                style={{ width: `${overallProgress}%`, transition: "width 0.4s ease" }}
                aria-valuenow={overallProgress}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
          </div>
        </div>
      </header>

      <main className="container my-5 flex-grow-1">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-1">Development Modules</h2>
            <p className="text-muted mb-0">Click on any module phase checkbox to toggle its completion and update progress.</p>
          </div>
          <button 
            onClick={() => setIsAddingModule(!isAddingModule)}
            className="btn btn-primary d-flex align-items-center gap-2 shadow-sm rounded-pill px-4"
          >
            <span className="fw-bold">{isAddingModule ? "-" : "+"}</span>
            {isAddingModule ? "Cancel" : "New Module"}
          </button>
        </div>

        <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
          <table className="table table-hover align-middle mb-0" style={{ backgroundColor: "white" }}>
            <thead className="table-light">
              <tr>
                <th className="ps-4 py-3 fw-bold text-secondary">Module Name</th>
                <th className="text-center py-3 fw-bold text-secondary">UI Design</th>
                <th className="text-center py-3 fw-bold text-secondary">UX Design</th>
                <th className="text-center py-3 fw-bold text-secondary">Backend</th>
                <th className="text-center py-3 fw-bold text-secondary">Testing</th>
                <th className="text-center py-3 fw-bold text-secondary">Deployment</th>
                <th className="text-center py-3 fw-bold text-secondary">Progress</th>
              </tr>
            </thead>
            <tbody>
              {modules.map((mod) => {
                const total = Object.values(mod.tasks).length;
                const done = Object.values(mod.tasks).filter(
                  (s) => s === "completed"
                ).length;
                const modProgress = Math.round((done / total) * 100);

                return (
                  <tr key={mod.id}>
                    <td className="ps-4 fw-medium py-3 border-bottom fs-5 text-dark">
                      {mod.name}
                    </td>
                    {["UI", "UX", "Backend", "Testing", "Deployment"].map((taskType) => {
                      const status = mod.tasks[taskType];
                      return (
                        <td
                          key={taskType}
                          onClick={() => toggleStatus(mod.id, taskType)}
                          className={`border-bottom p-0`}
                          style={{ cursor: "pointer", width: "100px", transition: "all 0.2s" }}
                          title={`Click to mark ${taskType} as ${status === "completed" ? "pending" : "completed"}`}
                        >
                          <div className={`w-100 h-100 p-3 ${getStatusClass(status)}`} style={{ transition: "background-color 0.3s" }}>
                            {renderCheckbox(status)}
                          </div>
                        </td>
                      );
                    })}
                    <td className="text-center fw-bold border-bottom" style={{ width: "120px" }}>
                      <div className="d-flex flex-column align-items-center gap-1">
                        <span className={modProgress === 100 ? "text-success fw-bold" : "text-muted fw-bold"}>{modProgress}%</span>
                        <div className="progress w-100 bg-light" style={{ height: "6px" }}>
                          <div
                            className={`progress-bar ${modProgress === 100 ? "bg-success" : "bg-primary"}`}
                            role="progressbar"
                            style={{ width: `${modProgress}%`, transition: "width 0.4s ease, background-color 0.4s ease" }}
                            aria-valuenow={modProgress}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {isAddingModule && (
                  <tr style={{ backgroundColor: "#fdfdfd" }}>
                    <td className="ps-4 fw-medium py-3 border-bottom border-top">
                      <input 
                        type="text" 
                        className="form-control shadow-none border-1" 
                        placeholder="Enter module name..." 
                        value={newModuleName}
                        onChange={(e) => setNewModuleName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddModule()}
                        autoFocus
                      />
                    </td>
                    <td colSpan="5" className="border-bottom border-top text-center">
                      <span className="text-secondary opacity-75 fst-italic">Tasks will initialize as pending...</span>
                    </td>
                    <td className="text-center py-3 border-bottom border-top">
                      <div className="d-flex gap-2 justify-content-center">
                        <button className="btn btn-success btn-sm fw-bold px-3 rounded-pill shadow-sm" onClick={handleAddModule}>Save</button>
                      </div>
                    </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      <footer className="py-4 text-center text-muted fs-6 mt-auto">
        Individual Project Tracker • Interactive Checklist
      </footer>
    </div>
  );
}
