import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Test from './pages/Test';
import Result from './pages/Result';
import Admin from './pages/Admin';
import { calculateResults } from './utils/calculator';

function App() {
  const [user, setUser] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load state from localStorage on mount
    const storedUser = localStorage.getItem('enneagramUser');
    const storedResult = localStorage.getItem('enneagramResult');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedResult) {
      setTestResult(JSON.parse(storedResult));
    }
    setLoading(false);
  }, []);

  const handleRegister = (userData) => {
    // Save user to state and localStorage
    // Add a random ID if not present, just for consistency
    const userWithId = { ...userData, id: userData.id || Date.now().toString() };
    setUser(userWithId);
    localStorage.setItem('enneagramUser', JSON.stringify(userWithId));
  };

  const handleTestComplete = (answers) => {
    const result = calculateResults(answers);
    setTestResult(result);
    localStorage.setItem('enneagramResult', JSON.stringify(result));
  };

  const handleReset = () => {
    // Clear state and localStorage
    setUser(null);
    setTestResult(null);
    localStorage.removeItem('enneagramUser');
    localStorage.removeItem('enneagramResult');
    window.location.href = "/";
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/register"
          element={<Register onRegister={handleRegister} />}
        />

        <Route
          path="/test"
          element={
            user ? (
              <Test onComplete={handleTestComplete} />
            ) : (
              <Navigate to="/register" replace />
            )
          }
        />

        <Route
          path="/result"
          element={
            testResult ? (
              <Result result={testResult} user={user} onReset={handleReset} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="/admin" element={<Admin />} />
        {/* Redirect any other route to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
