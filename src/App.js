import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";
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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#1a1a2e" }}>
      <form onSubmit={submit} style={{ background: "#fff", padding: "40px", borderRadius: "16px", width: "340px", boxShadow: "0 10px 40px rgba(0,0,0,0.35)", textAlign: "center" }}>
        <h3 style={{ fontWeight: "bold", color: "#1a1a2e", marginBottom: "4px" }}>NEW STAR MENS WEAR</h3>
        <p style={{ color: "#6c757d", fontSize: "14px", marginBottom: "24px" }}>Enter shop passcode to continue</p>
        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="Passcode"
          autoFocus
          style={{ width: "100%", padding: "12px", fontSize: "16px", borderRadius: "8px", border: "1px solid #ced4da", marginBottom: "12px", textAlign: "center" }}
        />
        {error && <div style={{ color: "#dc3545", fontSize: "13px", marginBottom: "12px" }}>{error}</div>}
        <button type="submit" disabled={busy} style={{ width: "100%", padding: "12px", fontSize: "16px", fontWeight: "bold", color: "#fff", backgroundColor: "#f0a500", border: "none", borderRadius: "8px", cursor: "pointer" }}>
          {busy ? "Checking..." : "Enter"}
        </button>
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
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#6c757d" }}>Loading...</div>;
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
