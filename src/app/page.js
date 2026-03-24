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
    let clampedVal = newPercent === "" ? "" : parseInt(newPercent, 10);
    
    if (clampedVal !== "") {
      if (isNaN(clampedVal)) clampedVal = 0;
      if (clampedVal < 0) clampedVal = 0;
      if (clampedVal > 100) clampedVal = 100;
    }

    setModules(prevModules =>
      prevModules.map(mod => mod.id === moduleId ? { ...mod, tasks: { ...mod.tasks, [taskType]: clampedVal } } : mod)
    );

    const apiValue = clampedVal === "" ? 0 : clampedVal;

    try {
      await fetch('/api/modules', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", id: moduleId, taskType, newStatus: apiValue })
      });
    } catch (err) { console.error(err); }
  };

  const updateField = async (moduleId, field, newValue) => {
    setModules(prevModules =>
      prevModules.map(mod => mod.id === moduleId ? { ...mod, [field]: newValue } : mod)
    );

    try {
      await fetch('/api/modules', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateField", id: moduleId, field: field, newValue: newValue })
      });
    } catch (err) { console.error(err); }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm("Are you sure you want to permanently delete this module?")) return;

    setModules(prev => prev.filter(mod => mod.id !== moduleId));

    try {
      await fetch('/api/modules', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id: moduleId })
      });
    } catch (err) { console.error(err); }
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
          process: "",
          stage: "",
          remarks: "",
          tasks: { UI: 0, UX: 0, Backend: 0, Testing: 0, Deployment: 0 },
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
      } catch (err) {
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
      <header className="py-3 px-3 px-md-4 d-flex flex-column flex-md-row justify-content-between align-items-center shadow-sm sticky-top gap-3" style={{ background: "#ffffff", zIndex: 10 }}>
        <h4 className="m-0 fw-bold text-primary text-center text-md-start fs-5 fs-md-4">📊 Methodize Project Tracker</h4>
        <div className="d-flex flex-column flex-sm-row align-items-center gap-2 gap-md-3">
          <span className="text-secondary fw-semibold fs-7 fs-sm-6 d-none d-sm-inline">Interactive Mode</span>
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold fs-5">{overallProgress}%</span>
            <div className="progress rounded-pill shadow-sm" style={{ width: "130px", height: "12px" }}>
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

      <main className="container-fluid container-xl my-4 my-md-5 flex-grow-1 px-2 px-md-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3 text-center text-md-start">
          <div>
            <h3 className="fw-bold mb-1 fs-4 fs-md-3">Development Modules</h3>
            <p className="text-muted mb-0 small">Enter the completion percentage (%) for each phase to update the tracker.</p>
          </div>
          <button 
            onClick={() => setIsAddingModule(!isAddingModule)}
            className="btn btn-primary d-flex align-items-center justify-content-center gap-2 shadow rounded-pill px-4 py-2 w-100 w-md-auto"
            style={{ maxWidth: "250px" }}
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
                  <th className="ps-4 py-3 fw-bold text-secondary text-uppercase fs-7" style={{ width: "220px" }}>Module Name</th>
                  <th className="text-center py-3 fw-bold text-secondary text-uppercase fs-7" style={{ width: "150px" }}>Process</th>
                  <th className="text-center py-3 fw-bold text-secondary text-uppercase fs-7" style={{ width: "150px" }}>Stage</th>
                  <th className="text-center py-3 fw-bold text-secondary text-uppercase fs-7" style={{ width: "135px" }}>UI Design</th>
                  <th className="text-center py-3 fw-bold text-secondary text-uppercase fs-7" style={{ width: "135px" }}>UX Design</th>
                  <th className="text-center py-3 fw-bold text-secondary text-uppercase fs-7" style={{ width: "135px" }}>Backend</th>
                  <th className="text-center py-3 fw-bold text-secondary text-uppercase fs-7" style={{ width: "135px" }}>Testing</th>
                  <th className="text-center py-3 fw-bold text-secondary text-uppercase fs-7" style={{ width: "135px" }}>Deployment</th>
                  <th className="text-center py-3 fw-bold text-secondary text-uppercase fs-7" style={{ width: "100px" }}>Progress</th>
                  <th className="ps-3 py-3 fw-bold text-secondary text-uppercase fs-7" style={{ width: "250px", minWidth: "200px" }}>Remarks</th>
                  <th className="text-center py-3 fw-bold text-secondary text-uppercase fs-7" style={{ width: "50px" }}></th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr><td colSpan="11" className="text-center py-5 text-secondary fw-semibold">
                    <div className="spinner-border spinner-border-sm me-2 text-primary" role="status"></div>
                    Loading Tracker Data from Google Sheets...
                  </td></tr>
                )}
                {!isLoading && modules.map((mod) => {
                  let moduleSum = 0;
                  Object.values(mod.tasks).forEach((v) => moduleSum += (Number(v) || 0));
                  const modProgress = Math.round(moduleSum / 5);

                  return (
                    <tr key={mod.id} className="align-middle">
                      <td className="ps-3 fw-bold py-2 border-bottom text-dark">
                        <input
                          type="text"
                          className="form-control border-0 bg-transparent fw-bold fs-6 text-dark px-2 shadow-none"
                          value={mod.name || ""}
                          onChange={(e) => updateField(mod.id, 'name', e.target.value)}
                          onBlur={(e) => updateField(mod.id, 'name', e.target.value)}
                          title={mod.name || "Click to rename module"}
                        />
                      </td>
                      <td className="border-bottom p-2 align-middle">
                        <input
                          type="text"
                          className="form-control form-control-sm border-0 bg-light shadow-sm rounded-pill px-3 text-center"
                          placeholder="Process..."
                          value={mod.process || ""}
                          onChange={(e) => updateField(mod.id, 'process', e.target.value)}
                          onBlur={(e) => updateField(mod.id, 'process', e.target.value)}
                          title={mod.process || "Process"}
                        />
                      </td>
                      <td className="border-bottom p-2 align-middle">
                        <input
                          type="text"
                          className="form-control form-control-sm border-0 bg-light shadow-sm rounded-pill px-3 text-center"
                          placeholder="Stage..."
                          value={mod.stage || ""}
                          onChange={(e) => updateField(mod.id, 'stage', e.target.value)}
                          onBlur={(e) => updateField(mod.id, 'stage', e.target.value)}
                          title={mod.stage || "Stage"}
                        />
                      </td>
                      {["UI", "UX", "Backend", "Testing", "Deployment"].map((taskType) => {
                        const val = parseInt(mod.tasks[taskType]) || 0;
                        return (
                          <td key={taskType} className={`border-bottom p-2 text-center align-middle`}>
                            <div className="d-flex align-items-center justify-content-center">
                              <div className={`input-group input-group-sm rounded-pill shadow-sm overflow-hidden ${getColorClass(val)}`} style={{ minWidth: '100px', border: '1px solid' }}>
                                <input
                                  type="number"
                                  className="form-control text-center fw-bold border-0 bg-transparent text-inherit"
                                  style={{ color: 'inherit', boxShadow: 'none', paddingLeft: '10px' }}
                                  min="0" max="100"
                                  value={val}
                                  onChange={(e) => updatePercentage(mod.id, taskType, e.target.value)}
                                  onBlur={(e) => updatePercentage(mod.id, taskType, e.target.value)}
                                />
                                <span className="input-group-text bg-transparent border-0 py-0 px-2 fw-bold" style={{ color: 'inherit' }}>%</span>
                              </div>
                            </div>
                          </td>
                        );
                      })}
                      <td className="text-center fw-bold border-bottom px-2 align-middle">
                        <div className="d-flex flex-column align-items-center gap-1">
                          <span className={modProgress === 100 ? "text-success fw-bold flex-shrink-0" : "text-dark fw-bold flex-shrink-0"} style={{ fontSize: "0.95rem" }}>{modProgress}%</span>
                          <div className="progress w-100 bg-light rounded-pill" style={{ height: "4px" }}>
                            <div className={`progress-bar rounded-pill ${modProgress === 100 ? "bg-success" : "bg-primary"}`} style={{ width: `${modProgress}%`, transition: "width 0.4s ease" }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="border-bottom p-2 align-middle">
                        <textarea
                          className="form-control form-control-sm border-0 bg-light shadow-sm rounded-3 px-3 py-2 fst-italic"
                          style={{ resize: "vertical", minHeight: "38px", fontSize: "0.875rem" }}
                          rows={2}
                          placeholder="Type detailed remarks here..."
                          value={mod.remarks || ""}
                          onChange={(e) => updateField(mod.id, 'remarks', e.target.value)}
                          onBlur={(e) => updateField(mod.id, 'remarks', e.target.value)}
                          title={mod.remarks || "Remarks"}
                        />
                      </td>
                      <td className="text-center border-bottom p-2 align-middle">
                        <button
                          className="btn btn-sm btn-outline-danger border-0 rounded-circle fw-bold fs-5 d-flex align-items-center justify-content-center"
                          style={{ width: "32px", height: "32px" }}
                          onClick={() => handleDeleteModule(mod.id)}
                          title="Delete Module"
                        >
                          ×
                        </button>
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
                    <td colSpan="8" className="border-bottom border-top text-center align-middle">
                      <span className="text-secondary opacity-75 fst-italic">Tasks will initialize at 0%...</span>
                    </td>
                    <td className="text-center py-3 border-bottom border-top align-middle">
                      <div className="d-flex gap-2 justify-content-center">
                        <button className="btn btn-success btn-sm fw-bold px-4 rounded-pill shadow-sm" onClick={handleAddModule}>Save</button>
                      </div>
                    </td>
                    <td colSpan="2" className="border-bottom border-top bg-light"></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-muted fs-6 mt-auto">
        <p className="mb-2 fw-medium">Methodize Project Tracker • Node & Google Sheets API</p>
        <a 
          href="https://docs.google.com/spreadsheets/d/1Q7jKdXVxRkSx6JC51g65p_rTRAdUhejyKWpOhdDueAc/edit?gid=277571069#gid=277571069" 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-sm btn-outline-secondary rounded-pill shadow-sm px-3 fw-bold"
        >
          📊 View Master Google Sheet
        </a>
      </footer>
    </div>
  );
}
