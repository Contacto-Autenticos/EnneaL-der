import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';

import Test from './pages/Test';
import Result from './pages/Result';
import DetailedResult from './pages/DetailedResult';
import SingleEnneatypeResult from './pages/SingleEnneatypeResult';
import Admin from './pages/Admin';
import AdvancedIntro from './pages/AdvancedIntro';
import AdvancedTest from './pages/AdvancedTest';
import AdvancedAnalysisResult from './pages/AdvancedAnalysisResult';
import PaymentPage from './pages/PaymentPage';
import PaymentStatus from './pages/PaymentStatus';
import PaymentSuccess from './pages/PaymentSuccess';
import AdvancedLanding from './pages/AdvancedLanding';
import emailjs from '@emailjs/browser';
import { supabase } from './supabaseClient';
import { calculateResults, calculateAdvancedResults, getEnneagramEmailImage } from './utils/calculator';
import { advancedEnneagramInfo } from './data/advancedInfo';
import ScrollToTop from './components/ScrollToTop';
import FloatingScrollToTop from './components/FloatingScrollToTop';


function App() {
  const [user, setUser] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [advancedTestResult, setAdvancedTestResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load state from localStorage on mount
    const storedUser = localStorage.getItem('enneagramUser');
    const storedResult = localStorage.getItem('enneagramResult');
    const storedAdvancedResult = localStorage.getItem('enneagramAdvancedResult');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedResult) {
      setTestResult(JSON.parse(storedResult));
    }
    if (storedAdvancedResult) {
      setAdvancedTestResult(JSON.parse(storedAdvancedResult));
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

  const handleAdvancedTestComplete = async (answers) => {
    const result = calculateAdvancedResults(answers);
    setAdvancedTestResult(result);
    localStorage.setItem('enneagramAdvancedResult', JSON.stringify(result));

    // Send enriched personalized email via EmailJS
    if (user && user.email) {
      try {
        emailjs.init('jvBHZwalOIEABW7qV');

        const type = result.confirmedType;
        console.log('Attempting to update Supabase:', { email: user.email, enneatype: type });

        if (!type) {
          console.error('CRITICAL: Enneatype is null or undefined!');
          return;
        }

        // Update Supabase with the confirmed enneatype
        const normalizedEmail = user.email.trim().toLowerCase();
        const { data, error: supabaseError } = await supabase
          .from('user_leads')
          .update({ enneatype: type })
          .eq('email', normalizedEmail)
          .select(); // Select to verify if row was actually found and updated

        if (supabaseError) {
          console.error('Error updating Supabase:', supabaseError);
          // Fallback: try creating a new record if update passes but row missing? 
          // Unlikely for update error, but maybe RLS.
        } else {
          console.log('Supabase response data:', data);
          if (data && data.length === 0) {
            console.warn('WARNING: No row was updated! Email might not match or row is missing.');
          } else {
            console.log('Enneatype updated in Supabase successfully');
          }
        }

        const details = advancedEnneagramInfo[type];
        const resultLink = `${window.location.origin}/advanced-analysis-result/${type}`;

        // Clean up growth and stress paths for better sentence flow
        const cleanGrowth = details.paths.growth.includes(':')
          ? details.paths.growth.split(':')[1].trim()
          : details.paths.growth;
        const cleanStress = details.paths.stress.includes(':')
          ? details.paths.stress.split(':')[1].trim()
          : details.paths.stress;

        await emailjs.send(
          'service_29pk8s1',
          'template_6emj63o',
          {
            to_name: user.name,
            to_email: user.email,
            result_link: resultLink,
            result_image: getEnneagramEmailImage(type),
            enneatype_name: result.winner.name,
            enneatype_number: type,
            miedo_basico: details.motivations.fear,
            deseo_basico: details.motivations.desire,
            mensaje_motivacion: details.motivations.msg,
            centro_inteligencia: details.triads.center,
            estilo_social: details.triads.social,
            estilo_afrontamiento: details.triads.coping,
            camino_crecimiento: cleanGrowth,
            camino_estres: cleanStress
          }
        );
        console.log('Advanced results email sent with enriched data!');
      } catch (error) {
        console.error('Failed to send advanced results email or update DB:', error);
      }
    } else {
      console.warn('User or email missing, cannot update Supabase or send email', user);
    }
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
      <ScrollToTop />
      <FloatingScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />



        <Route
          path="/test"
          element={<Test onComplete={handleTestComplete} />}
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


        <Route
          path="/payment"
          element={<PaymentPage />}
        />

        <Route
          path="/advanced-landing"
          element={<AdvancedLanding result={testResult} setTestResult={setTestResult} />}
        />

        <Route
          path="/payment-status"
          element={<PaymentStatus />}
        />

        <Route
          path="/payment-success"
          element={<PaymentSuccess />}
        />

        <Route
          path="/detailed-result"
          element={
            testResult ? (
              <DetailedResult result={testResult} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/advanced-intro"
          element={<AdvancedIntro onRegister={handleRegister} user={user} initialEnneatype={testResult?.enneatype} />}
        />

        <Route
          path="/advanced-test"
          element={
            testResult ? (
              <AdvancedTest
                topTypes={testResult.enneatypes.slice(0, 3).map(e => e.type)}
                onComplete={handleAdvancedTestComplete}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/advanced-analysis-result"
          element={
            advancedTestResult ? (
              <AdvancedAnalysisResult result={advancedTestResult} user={user} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/advanced-analysis-result/:type"
          element={<AdvancedAnalysisResult />}
        />

        <Route
          path="/result/:type"
          element={<SingleEnneatypeResult />}
        />

        <Route path="/admin" element={<Admin />} />
        <Route
          path="/test-liderazgo"
          element={
            <AdvancedIntro
              onRegister={handleRegister}
              user={user}
              targetRoute="/advanced-test-full"
              showOrganization={true}
              requireAccessCode={true}
              initialEnneatype={testResult?.enneatype}
            />
          }
        />

        <Route
          path="/advanced-test-full"
          element={
            <AdvancedTest
              fullTest={true}
              onComplete={handleAdvancedTestComplete}
            />
          }
        />

        {/* Redirect any other route to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
