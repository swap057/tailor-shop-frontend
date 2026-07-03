import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";
import { FaRulerCombined, FaLock } from "react-icons/fa";
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
import Settings from "./pages/Settings";

const API = "https://my-tailor-app-backend.onrender.com";

// Attach the saved passcode to every request the app makes
axios.defaults.headers.common["X-App-Key"] = localStorage.getItem("appPasscode") || "";

// If the server ever rejects the passcode on a normal request, bounce back to login
axios.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || "";
    if (err.response?.status === 401 && !url.includes("/auth/")) {
      localStorage.removeItem("appPasscode");
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

function LoginScreen({ onLogin }) {
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await axios.post(`${API}/auth/verify`, { passcode: pass });
      localStorage.setItem("appPasscode", pass);
      axios.defaults.headers.common["X-App-Key"] = pass;
      onLogin();
    } catch (err) {
      setError("Wrong passcode. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
      background: "radial-gradient(circle at 50% 0%, #24243e 0%, #1a1a2e 45%, #12121f 100%)",
      fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      <form onSubmit={submit} style={{
        background: "#ffffff", padding: "44px 36px 32px", borderRadius: "22px", width: "100%", maxWidth: "380px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.45)", textAlign: "center", borderTop: "5px solid #f0a500"
      }}>
        <div style={{
          width: "78px", height: "78px", margin: "0 auto 18px", borderRadius: "50%", background: "#1a1a2e",
          display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(26,26,46,0.35)"
        }}>
          <FaRulerCombined size={34} color="#f0a500" />
        </div>

        <h3 style={{ fontWeight: 800, color: "#1a1a2e", marginBottom: "2px", letterSpacing: "0.5px", fontSize: "22px" }}>
          NEW STAR MENS WEAR
        </h3>
        <p style={{ color: "#f0a500", fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "26px" }}>
          Tailor Management
        </p>

        <div style={{ textAlign: "left", marginBottom: "6px" }}>
          <label style={{ fontSize: "12px", fontWeight: 700, color: "#6c757d", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Shop Passcode
          </label>
        </div>

        <div style={{
          display: "flex", alignItems: "center", borderRadius: "12px", padding: "0 14px", marginBottom: "4px",
          background: "#f8f9fa", border: `1.5px solid ${error ? "#dc3545" : "#e6e6e6"}`
        }}>
          <FaLock color="#adb5bd" size={15} />
          <input
            type="password" value={pass} onChange={(e) => setPass(e.target.value)}
            placeholder="Enter passcode" autoFocus
            style={{ flex: 1, border: "none", outline: "none", background: "transparent", padding: "14px 10px", fontSize: "16px", color: "#1a1a2e", letterSpacing: "1px" }}
          />
        </div>

        <div style={{ minHeight: "20px", marginBottom: "8px", textAlign: "left", paddingLeft: "4px" }}>
          {error && <span style={{ color: "#dc3545", fontSize: "13px", fontWeight: 600 }}>{error}</span>}
        </div>

        <button type="submit" disabled={busy} style={{
          width: "100%", padding: "13px", fontSize: "16px", fontWeight: 700,
          color: "#1a1a2e", background: busy ? "#d9a021" : "#f0a500",
          border: "none", borderRadius: "12px", cursor: busy ? "wait" : "pointer",
          boxShadow: "0 6px 16px rgba(240,165,0,0.4)", letterSpacing: "0.5px"
        }}>
          {busy ? "Checking..." : "Unlock"}
        </button>

        <p style={{ marginTop: "22px", fontSize: "11px", color: "#adb5bd" }}>
          Authorized staff only
        </p>
      </form>
    </div>
  );
}

function App() {
  // "checking" -> deciding, "login" -> show passcode screen, "ready" -> show app
  const [authState, setAuthState] = useState("checking");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await axios.get(`${API}/auth/status`);
        if (!active) return;
        if (!res.data?.required) {
          setAuthState("ready");
          return;
        }
        const stored = localStorage.getItem("appPasscode");
        if (!stored) {
          setAuthState("login");
          return;
        }
        // Confirm the saved passcode is still valid
        await axios.post(`${API}/auth/verify`, { passcode: stored });
        if (!active) return;
        axios.defaults.headers.common["X-App-Key"] = stored;
        setAuthState("ready");
      } catch (err) {
        if (!active) return;
        if (err.response?.status === 401) {
          localStorage.removeItem("appPasscode");
          setAuthState("login");
        } else {
          // Backend unreachable / waking up: let the app load; protected calls will re-gate if needed
          setAuthState("ready");
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const contentWrapperStyle = {
    marginLeft: "260px",
    minHeight: "100vh",
    backgroundColor: "#f4f6f9",
    display: "flex",
    flexDirection: "column",
    position: "relative"
  };

  const pageContentStyle = {
    padding: "30px",
    flex: 1,
    marginTop: "70px"
  };

  if (authState === "checking") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: "16px", background: "radial-gradient(circle at 50% 0%, #24243e 0%, #1a1a2e 45%, #12121f 100%)"
      }}>
        <FaRulerCombined size={32} color="#f0a500" />
        <div style={{ color: "#8a8aa0", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase" }}>Loading...</div>
      </div>
    );
  }

  if (authState === "login") {
    return <LoginScreen onLogin={() => setAuthState("ready")} />;
  }

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
