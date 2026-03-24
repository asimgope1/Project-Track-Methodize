"use client";

import React, { useState, useEffect } from "react";

export default function Home() {
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleName, setNewModuleName] = useState("");
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/modules')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setModules(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load modules from Google Sheets API", err);
        setIsLoading(false);
      });
  }, []);

  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    let totalPercentSum = 0;
    let moduleCount = modules.length;

    modules.forEach((mod) => {
      let moduleSum = 0;
      Object.values(mod.tasks).forEach((val) => {
        moduleSum += Number(val) || 0;
      });
      totalPercentSum += moduleSum / 5; // average of 5 tasks is the module's progress
    });

    if (moduleCount > 0) {
      setOverallProgress(Math.round(totalPercentSum / moduleCount));
    } else {
      setOverallProgress(0);
    }
  }, [modules]);

  const updatePercentage = async (moduleId, taskType, newPercent) => {
    let clampedVal = parseInt(newPercent, 10);
    if (isNaN(clampedVal)) clampedVal = 0;
    if (clampedVal < 0) clampedVal = 0;
    if (clampedVal > 100) clampedVal = 100;
    
    // Optimistic Update
    setModules(prevModules => 
      prevModules.map(mod => {
        if (mod.id === moduleId) {
          return {
            ...mod,
            tasks: {
              ...mod.tasks,
              [taskType]: clampedVal
            }
          };
        }
        return mod;
      })
    );

    // Persist to Google Sheets Backend
    try {
       await fetch('/api/modules', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", id: moduleId, taskType, newStatus: clampedVal })
      });
    } catch(err) {
      console.error(err);
    }
  };

  const handleAddModule = async () => {
    if (newModuleName.trim()) {
      const tempId = `m${Date.now()}`;
      
      // Optimistic 
      setModules([
        ...modules,
        {
          id: tempId,
          name: newModuleName.trim(),
          tasks: {
            UI: 0,
            UX: 0,
            Backend: 0,
            Testing: 0,
            Deployment: 0,
          },
        },
      ]);
      setNewModuleName("");
      setIsAddingModule(false);
      
      try {
        await fetch('/api/modules', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create", name: newModuleName.trim(), id: tempId })
        });
      } catch(err) {
        console.error(err);
      }
    }
  };

  const getColorClass = (val) => {
    if (val === 100) return "bg-success text-white border-success";
    if (val >= 50) return "bg-warning text-dark border-warning";
    if (val > 0) return "bg-primary-subtle text-primary border-primary";
    return "bg-light text-secondary border-secondary";
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "#f8f9fa" }}>
      <header className="py-3 px-4 d-flex justify-content-between align-items-center shadow-sm sticky-top" style={{ background: "#ffffff", zIndex: 10 }}>
        <h4 className="m-0 fw-bold text-primary">📊 Individual Project Tracker</h4>
        <div className="d-flex align-items-center gap-3">
          <span className="text-secondary fw-semibold">Interactive Mode</span>
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold fs-5">{overallProgress}%</span>
            <div className="progress rounded-pill shadow-sm" style={{ width: "160px", height: "12px" }}>
              <div
                className="progress-bar bg-success"
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
            <h3 className="fw-bold mb-1">Development Modules</h3>
            <p className="text-muted mb-0">Enter the completion percentage (%) for each phase to update the tracker.</p>
          </div>
          <button 
            onClick={() => setIsAddingModule(!isAddingModule)}
            className="btn btn-primary d-flex align-items-center gap-2 shadow rounded-pill px-4 py-2"
          >
            <span className="fw-bold fs-5">{isAddingModule ? "×" : "+"}</span>
            {isAddingModule ? "Cancel" : "New Module"}
          </button>
        </div>

        <div className="card shadow border-0 rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ backgroundColor: "white" }}>
              <thead className="table-light">
                <tr>
                  <th className="ps-4 py-3 fw-bold text-secondary text-uppercase fs-7">Module Name</th>
                  <th className="text-center py-3 fw-bold text-secondary text-uppercase fs-7" style={{width: "120px"}}>UI Design</th>
                  <th className="text-center py-3 fw-bold text-secondary text-uppercase fs-7" style={{width: "120px"}}>UX Design</th>
                  <th className="text-center py-3 fw-bold text-secondary text-uppercase fs-7" style={{width: "120px"}}>Backend</th>
                  <th className="text-center py-3 fw-bold text-secondary text-uppercase fs-7" style={{width: "120px"}}>Testing</th>
                  <th className="text-center py-3 fw-bold text-secondary text-uppercase fs-7" style={{width: "120px"}}>Deployment</th>
                  <th className="text-center py-3 fw-bold text-secondary text-uppercase fs-7" style={{width: "150px"}}>Progress</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr><td colSpan="7" className="text-center py-5 text-secondary fw-semibold">
                    <div className="spinner-border spinner-border-sm me-2 text-primary" role="status"></div>
                    Loading Tracker Data from Google Sheets...
                  </td></tr>
                )}
                {!isLoading && modules.map((mod) => {
                  let moduleSum = 0;
                  Object.values(mod.tasks).forEach((v) => moduleSum += (Number(v) || 0));
                  const modProgress = Math.round(moduleSum / 5);

                  return (
                    <tr key={mod.id}>
                      <td className="ps-4 fw-bold py-3 border-bottom fs-5 text-dark">
                        {mod.name}
                      </td>
                      {["UI", "UX", "Backend", "Testing", "Deployment"].map((taskType) => {
                        const val = parseInt(mod.tasks[taskType]) || 0;
                        return (
                          <td
                            key={taskType}
                            className={`border-bottom p-2 text-center align-middle`}
                          >
                            <div className="d-flex align-items-center justify-content-center">
                              <div className={`input-group input-group-sm rounded-pill shadow-sm overflow-hidden ${getColorClass(val)}`} style={{ maxWidth: '85px', border: '1px solid' }}>
                                <input
                                  type="number"
                                  className="form-control text-center fw-bold border-0 bg-transparent text-inherit"
                                  min="0"
                                  max="100"
                                  value={val}
                                  onChange={(e) => updatePercentage(mod.id, taskType, e.target.value)}
                                  onBlur={(e) => updatePercentage(mod.id, taskType, e.target.value)}
                                  style={{ color: 'inherit', boxShadow: 'none' }}
                                />
                                <span className="input-group-text bg-transparent border-0 fw-bold px-2" style={{ color: 'inherit' }}>%</span>
                              </div>
                            </div>
                          </td>
                        );
                      })}
                      <td className="text-center fw-bold border-bottom px-3">
                        <div className="d-flex flex-column align-items-center gap-1">
                          <span className={modProgress === 100 ? "text-success fw-bold fs-5" : "text-dark fw-bold fs-5"}>{modProgress}%</span>
                          <div className="progress w-100 bg-light rounded-pill" style={{ height: "6px" }}>
                            <div
                              className={`progress-bar rounded-pill ${modProgress === 100 ? "bg-success" : "bg-primary"}`}
                              role="progressbar"
                              style={{ width: `${modProgress}%`, transition: "width 0.4s ease" }}
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
                          className="form-control shadow-sm border-1 rounded-pill" 
                          placeholder="Enter module name..." 
                          value={newModuleName}
                          onChange={(e) => setNewModuleName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddModule()}
                          autoFocus
                        />
                      </td>
                      <td colSpan="5" className="border-bottom border-top text-center align-middle">
                        <span className="text-secondary opacity-75 fst-italic">Tasks will initialize at 0%...</span>
                      </td>
                      <td className="text-center py-3 border-bottom border-top align-middle">
                        <div className="d-flex gap-2 justify-content-center">
                          <button className="btn btn-success btn-sm fw-bold px-4 rounded-pill shadow-sm" onClick={handleAddModule}>Save</button>
                        </div>
                      </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-muted fs-6 mt-auto">
        Individual Project Tracker • Google Sheets Integration API
      </footer>
    </div>
  );
}
