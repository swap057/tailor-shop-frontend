import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// 1. IMPORT THE PROVIDER
import { LangProvider } from "./context/LangContext"; 
import { ToastProvider } from './context/ToastContext';

// Import Components
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";

// Import Pages
import Dashboard from "./pages/Dashboard";
import AddCustomer from "./pages/AddCustomer";
import FindCustomer from "./pages/FindCustomer"; 
import PendingWork from "./pages/PendingWork";    
import Settings from "./pages/Settings"; // <-- FIXED THIS LINE!

function App() {
  
  const contentWrapperStyle = {
    // 1. MATCH SIDEBAR WIDTH (Changed from 280px to 260px)
    marginLeft: "260px", 
    minHeight: "100vh",
    backgroundColor: "#f4f6f9",
    display: "flex",
    flexDirection: "column",
    position: "relative" // Helps context
  };

  const pageContentStyle = {
    padding: "30px", 
    flex: 1,
    // 2. IMPORTANT: PUSH CONTENT DOWN
    // Since Topbar is now 'Fixed', we need to manually push the content down 
    // by the height of the Topbar (70px) so it doesn't hide behind it.
    marginTop: "70px" 
  };

  return (
    <LangProvider> 
      <ToastProvider>
      <Router>
        <div className="d-flex">
          
          <Sidebar />

          <div style={contentWrapperStyle} className="w-100">
              
            {/* Topbar is Fixed, so it floats above everything */}
            <Topbar /> 

            {/* Content is pushed down by marginTop: 70px */}
            <div style={pageContentStyle}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/add-customer" element={<AddCustomer />} />
                <Route path="/customers" element={<FindCustomer />} />
                <Route path="/pending-work" element={<PendingWork />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>

          </div>
        </div>
      </Router>
      </ToastProvider>
    </LangProvider>
  );
}

export default App;
