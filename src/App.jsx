import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Test from './pages/Test';
import Result from './pages/Result';
import Admin from './pages/Admin';
import { calculateResults } from './utils/calculator';
import { supabase } from './supabaseClient';
import { useEffect } from 'react';

function App() {
  const [user, setUser] = useState(null);
  const [testResult, setTestResult] = useState(null);



  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Fetch profile to get name
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
          .then(({ data }) => {
            if (data) setUser(data);
          });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
          .then(({ data }) => {
            if (data) setUser(data);
          });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleRegister = (userData) => {
    setUser(userData);
  };

  const handleTestComplete = (answers) => {
    const result = calculateResults(answers);
    setTestResult(result);
  };

  const handleReset = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTestResult(null);
    window.location.href = "/";
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

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
      </Routes>
    </Router>
  );
}

export default App;
