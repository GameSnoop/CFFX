import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { User as FirebaseUser } from "firebase/auth";

import WelcomeScreen from "./components/WelcomeScreen";
import Login from "./components/Login";
import LogUp from "./components/LogUp";
import Dashboard from "./components/Dashboard";
import Home from "./components/Home";
import Settings from "./components/Settings";
import Scripts from "./components/Scripts";
import AITools from "./components/AITools";
import ServerManagement from "./components/ServerManagement";
import Branding from "./components/Branding";

const App: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <WelcomeScreen />}
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/logup"
          element={user ? <Navigate to="/dashboard" /> : <LogUp />}
        />

        {/* Dashboard routes */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" />}
        >
          <Route index element={<Home />} />
          <Route path="scripts" element={<Scripts />} />
          <Route path="ai-tools" element={<AITools />} />
          <Route path="server-management" element={<ServerManagement />} />
          <Route path="branding" element={<Branding />} />
          <Route path="settings" element={<Settings />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch-all route for unknown paths */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
