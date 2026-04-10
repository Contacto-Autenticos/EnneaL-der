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
import AdvancedTransition from './pages/AdvancedTransition';
import InitialTransition from './pages/InitialTransition';
import CourseLanding from './pages/CourseLanding';
import ResultVideoIntro from './pages/ResultVideoIntro';
import emailjs from '@emailjs/browser';
import { supabase } from './supabaseClient';
import { calculateResults, calculateAdvancedResults, getEnneagramEmailImage } from './utils/calculator';
import { advancedEnneagramInfo } from './data/advancedInfo';
import ScrollToTop from './components/ScrollToTop';
import FloatingScrollToTop from './components/FloatingScrollToTop';
import BasicTestIntro from './pages/BasicTestIntro';
import Analytics from './components/Analytics';
import Hub from './pages/Hub';
import MyResults from './pages/MyResults';
import FascinantesIntro from './pages/FascinantesIntro';
import FascinantesTest from './pages/FascinantesTest';
import FascinantesTransition from './pages/FascinantesTransition';
import FascinantesResult from './pages/FascinantesResult';
import GenuinosLanding from './pages/GenuinosLanding';
import MpStatus from './pages/MpStatus';
import Extraordinarios from './pages/Extraordinarios';
import Fascinantes from './pages/Fascinantes';
import Trascendentes from './pages/Trascendentes';
import Genuinos from './pages/Genuinos';
import Conscientes from './pages/Conscientes';
import AutodiagRegister from './pages/AutodiagRegister';
import AutodiagPayment from './pages/AutodiagPayment';
import AutodiagPaymentStatus from './pages/AutodiagPaymentStatus';

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

  const handleTestComplete = (answers, questionsUsed) => {
    const result = calculateResults(answers, questionsUsed);
    // Include questions in result for later use in advanced test or re-calculation
    const resultWithQuestions = { ...result, questionsUsed };
    setTestResult(resultWithQuestions);
    localStorage.setItem('enneagramResult', JSON.stringify(resultWithQuestions));
  };

  const handleAdvancedTestComplete = async (answers, advancedQuestionsUsed) => {
    const result = calculateAdvancedResults(answers, advancedQuestionsUsed);
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
        } else {
          console.log('Supabase response data:', data);
          if (data && data.length === 0) {
            console.warn('WARNING: No row was updated! Email might not match or row is missing.');
          } else {
            console.log('Enneatype updated in Supabase successfully');
          }
        }

        // Save detailed test responses
        const sliderLabels = ['Muy poco', 'Algo', 'Mucho', 'Totalmente'];
        const formattedAnswers = advancedQuestionsUsed.map(q => ({
          question_id: q.id,
          text: q.text,
          enneatype: q.enneatype,
          answer_value: answers[q.id] ?? null,
          answer_label: answers[q.id] !== undefined ? sliderLabels[answers[q.id]] : null
        }));

        const commercialName = localStorage.getItem('activeCommercial');

        await supabase.from('advanced_test_responses').insert([{
          user_name: user.name || null,
          user_email: normalizedEmail,
          enneatype: type,
          test_type: advancedQuestionsUsed.length > 50 ? '135' : '45',
          organization_code: user.organization || null,
          access_code: user.access_code || null,
          commercial_name: commercialName || null,
          answers: formattedAnswers
        }]);

        if (commercialName) {
          localStorage.removeItem('activeCommercial');
        }
        console.log('Advanced test responses saved to Supabase');

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
      <Analytics />
      <ScrollToTop />
      <FloatingScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hub" element={<Hub />} />
        <Route path="/my-results" element={<MyResults />} />
        <Route path="/Extraordinarios" element={<Extraordinarios />} />
        <Route path="/Fascinantes" element={<Fascinantes />} />
        <Route path="/Trascendentes" element={<Trascendentes />} />
        <Route path="/Genuinos" element={<Genuinos />} />
        <Route path="/Conscientes" element={<Conscientes />} />
        <Route path="/autodiag-intro" element={<FascinantesIntro />} />
        <Route path="/autodiag-test" element={<FascinantesTest />} />
        <Route path="/autodiag-transition" element={<FascinantesTransition />} />
        <Route path="/autodiag-result" element={<FascinantesResult />} />

        <Route path="/autodiag-register" element={<AutodiagRegister />} />
        <Route path="/autodiag-payment" element={<AutodiagPayment />} />
        <Route path="/autodiag-payment-status" element={<AutodiagPaymentStatus />} />

        <Route
          path="/test-intro"
          element={<BasicTestIntro />}
        />

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
          path="/mp-status"
          element={<MpStatus />}
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
          path="/advanced-transition"
          element={<AdvancedTransition />}
        />

        <Route
          path="/result-intro"
          element={
            advancedTestResult ? (
              <ResultVideoIntro type={advancedTestResult.confirmedType} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/initial-analysis"
          element={<InitialTransition result={testResult} />}
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
        <Route path="/programa" element={<CourseLanding />} />
        <Route path="/programa-genuinos" element={<GenuinosLanding />} />
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
