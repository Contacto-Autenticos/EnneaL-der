import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Home from './pages/Home';
import AdvancedLanding from './pages/AdvancedLanding';

// Función para reintentar cargar módulos lazy (previene pantallas en blanco tras nuevos despliegues)
const lazyRetry = (componentImport) => {
  return new Promise((resolve, reject) => {
    const hasRefreshed = JSON.parse(
      window.sessionStorage.getItem('retry-lazy-refreshed') || 'false'
    );
    componentImport()
      .then((component) => {
        window.sessionStorage.setItem('retry-lazy-refreshed', 'false');
        resolve(component);
      })
      .catch((error) => {
        if (!hasRefreshed) {
          window.sessionStorage.setItem('retry-lazy-refreshed', 'true');
          return window.location.reload();
        }
        reject(error);
      });
  });
};

import emailjs from '@emailjs/browser';
import { supabase } from './supabaseClient';
import { calculateResults, calculateAdvancedResults, getEnneagramEmailImage } from './utils/calculator';
import { advancedEnneagramInfo } from './data/advancedInfo';
import ScrollToTop from './components/ScrollToTop';
import FloatingScrollToTop from './components/FloatingScrollToTop';
import PwaInstallBanner from './components/PwaInstallBanner';
import Analytics from './components/Analytics';
import ErrorBoundary from './components/ErrorBoundary';
import { sendWebPushNotification } from './utils/notifications';

const Test = lazy(() => lazyRetry(() => import('./pages/Test')));
const Result = lazy(() => lazyRetry(() => import('./pages/Result')));
const DetailedResult = lazy(() => lazyRetry(() => import('./pages/DetailedResult')));
const SingleEnneatypeResult = lazy(() => lazyRetry(() => import('./pages/SingleEnneatypeResult')));
const Admin = lazy(() => lazyRetry(() => import('./pages/Admin')));
const AdvancedIntro = lazy(() => lazyRetry(() => import('./pages/AdvancedIntro')));
const AdvancedTest = lazy(() => lazyRetry(() => import('./pages/AdvancedTest')));
const AdvancedAnalysisResult = lazy(() => lazyRetry(() => import('./pages/AdvancedAnalysisResult')));
const PaymentPage = lazy(() => lazyRetry(() => import('./pages/PaymentPage')));
const PaymentStatus = lazy(() => lazyRetry(() => import('./pages/PaymentStatus')));
const PaymentSuccess = lazy(() => lazyRetry(() => import('./pages/PaymentSuccess')));
// AdvancedLanding is eagerly loaded (imported at top) to prevent blank screen on navigation
const AdvancedTransition = lazy(() => lazyRetry(() => import('./pages/AdvancedTransition')));
const CourseLanding = lazy(() => lazyRetry(() => import('./pages/CourseLanding')));
const ResultVideoIntro = lazy(() => lazyRetry(() => import('./pages/ResultVideoIntro')));
const BasicTestIntro = lazy(() => lazyRetry(() => import('./pages/BasicTestIntro')));
const Gateway = lazy(() => lazyRetry(() => import('./pages/Gateway')));
const Hub = lazy(() => lazyRetry(() => import('./pages/Hub')));
const MyResults = lazy(() => lazyRetry(() => import('./pages/MyResults')));
const FascinantesIntro = lazy(() => lazyRetry(() => import('./pages/FascinantesIntro')));
const FascinantesTest = lazy(() => lazyRetry(() => import('./pages/FascinantesTest')));
const FascinantesTransition = lazy(() => lazyRetry(() => import('./pages/FascinantesTransition')));
const FascinantesResult = lazy(() => lazyRetry(() => import('./pages/FascinantesResult')));
const GenuinosLanding = lazy(() => lazyRetry(() => import('./pages/GenuinosLanding')));
const MpStatus = lazy(() => lazyRetry(() => import('./pages/MpStatus')));
const Extraordinarios = lazy(() => lazyRetry(() => import('./pages/Extraordinarios')));
const Fascinantes = lazy(() => lazyRetry(() => import('./pages/Fascinantes')));
const Trascendentes = lazy(() => lazyRetry(() => import('./pages/Trascendentes')));
const Genuinos = lazy(() => lazyRetry(() => import('./pages/Genuinos')));
const Conscientes = lazy(() => lazyRetry(() => import('./pages/Conscientes')));
const AutodiagRegister = lazy(() => lazyRetry(() => import('./pages/AutodiagRegister')));
const AutodiagPayment = lazy(() => lazyRetry(() => import('./pages/AutodiagPayment')));
const AutodiagPaymentStatus = lazy(() => lazyRetry(() => import('./pages/AutodiagPaymentStatus')));
const PartnerGatewayDominios = lazy(() => lazyRetry(() => import('./pages/PartnerGatewayDominios')));
const WorkshopInscripcion = lazy(() => lazyRetry(() => import('./pages/WorkshopInscripcion')));
const WorkshopInscripcionHazQueSuceda = lazy(() => lazyRetry(() => import('./pages/WorkshopInscripcionHazQueSuceda')));
const WorkshopPaymentStatus = lazy(() => lazyRetry(() => import('./pages/WorkshopPaymentStatus')));
const DominiosLanding = lazy(() => lazyRetry(() => import('./pages/DominiosLanding')));
const MltLanding = lazy(() => lazyRetry(() => import('./pages/MltLanding')));
const EneagramaLanding = lazy(() => lazyRetry(() => import('./pages/EneagramaLanding')));
const LiderazgoTest = lazy(() => lazyRetry(() => import('./pages/LiderazgoTest')));
const LiderazgoResults = lazy(() => lazyRetry(() => import('./pages/LiderazgoResults')));
const Agenda = lazy(() => lazyRetry(() => import('./pages/Agenda')));
const LiderazgoTestIntro = lazy(() => lazyRetry(() => import('./pages/LiderazgoTestIntro')));
const BusinessScan = lazy(() => lazyRetry(() => import('./pages/BusinessScan')));
const PostulacionMlt = lazy(() => lazyRetry(() => import('./pages/PostulacionMlt')));
const PartnerGateway = lazy(() => lazyRetry(() => import('./pages/PartnerGateway')));
const TemperamentoTestIntro = lazy(() => lazyRetry(() => import('./pages/TemperamentoTestIntro')));
const TemperamentoTest = lazy(() => lazyRetry(() => import('./pages/TemperamentoTest')));
const TemperamentoResult = lazy(() => lazyRetry(() => import('./pages/TemperamentoResult')));
const PresentationsDashboard = lazy(() => lazyRetry(() => import('./pages/PresentationsDashboard')));
const PresentationEditorPage = lazy(() => lazyRetry(() => import('./pages/PresentationEditorPage')));

function App() {
  const [user, setUser] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [advancedTestResult, setAdvancedTestResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load state from localStorage on mount safely
    try {
      const storedUser = localStorage.getItem('enneagramUser');
      const storedResult = localStorage.getItem('enneagramResult');
      const storedAdvancedResult = localStorage.getItem('enneagramAdvancedResult');

      if (storedUser && storedUser !== 'undefined') {
        setUser(JSON.parse(storedUser));
      }
      if (storedResult && storedResult !== 'undefined') {
        setTestResult(JSON.parse(storedResult));
      }
      if (storedAdvancedResult && storedAdvancedResult !== 'undefined') {
        setAdvancedTestResult(JSON.parse(storedAdvancedResult));
      }
    } catch (e) {
      console.error('Error loading or parsing session state from localStorage:', e);
    } finally {
      setLoading(false);
    }
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

    // Enviar notificación a Web Push
    const mainType = result.enneatypes?.[0]?.type || 'Desconocido';
    sendWebPushNotification('free_test', { 
      name: user?.name || 'Anónimo', 
      email: user?.email || 'Anónimo', 
      enneatype: mainType 
    });
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
        const partnerSource = localStorage.getItem('partner_source');

        let finalCommercialName = commercialName || null;
        if (partnerSource) {
            finalCommercialName = finalCommercialName ? `${finalCommercialName} | alianza_${partnerSource}` : `alianza_${partnerSource}`;
        }

        await supabase.from('advanced_test_responses').insert([{
          user_name: user.name || null,
          user_email: normalizedEmail,
          enneatype: type,
          test_type: advancedQuestionsUsed.length > 50 ? '135' : '45',
          organization_code: user.organization || null,
          access_code: user.access_code || null,
          commercial_name: finalCommercialName,
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

        // 4. Sync with Odoo CRM
        try {
          const resultsSummary = `
Eneatipo Confirmado: ${type} - ${result.winner.name}
Centro de Inteligencia: ${details.triads.center}
Estilo Social: ${details.triads.social}
Miedo Básico: ${details.motivations.fear}
Deseo Básico: ${details.motivations.desire}
          `.trim();

          const scoresMap = (result.results || []).reduce((acc, curr) => ({ 
            ...acc, 
            [`Tipo ${curr.type}`]: curr.score 
          }), {});

          await supabase.functions.invoke('odoo-integration', {
            body: {
              email: normalizedEmail,
              name: user.name,
              test_type: 'Eneagrama Avanzado',
              results_summary: resultsSummary,
              scores: scoresMap
            }
          });
          console.log('Odoo sync successful (Advanced Test)');
        } catch (odooError) {
          console.error('Error syncing with Odoo (Advanced):', odooError);
        }
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
    window.location.href = "/eneagrama";
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <Router>
      <Analytics />
      <ScrollToTop />
      <FloatingScrollToTop />
      <PwaInstallBanner />
      <ErrorBoundary fallback={
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#002d44', color: '#ffffff', textAlign: 'center', padding: '20px' }}>
          <h2 style={{ color: '#ddbe3d', marginBottom: '10px' }}>Actualización de Sistema</h2>
          <p style={{ maxWidth: '400px', marginBottom: '20px' }}>
            Hemos implementado nuevas mejoras. Para continuar, por favor recarga la página.
          </p>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button 
              onClick={() => window.location.reload()} 
              style={{ padding: '12px 24px', background: '#ddbe3d', color: '#002d44', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
            >
              Recargar Página
            </button>
            <a 
              href="https://wa.me/573164287586?text=Hola,%20tuve%20un%20inconveniente%20t%C3%A9cnico%20en%20la%20plataforma%20y%20necesito%20ayuda." 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ padding: '12px 24px', background: '#25D366', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              Contactar Soporte
            </a>
          </div>
        </div>
      }>
        <Suspense fallback={
          <div className="premium-loader-container">
            <div className="premium-spinner"></div>
            <div className="premium-loader-text">Cargando</div>
          </div>
        }>
        <Routes>
        <Route path="/alianza/:partnerId" element={<PartnerGateway />} />
        <Route path="/alianza-dominios/:partnerId" element={<PartnerGatewayDominios />} />
        <Route path="/eneagrama" element={<Home />} />
        <Route path="/" element={<Gateway />} />
        <Route path="/hub" element={<Hub />} />
        <Route path="/my-results" element={<MyResults />} />
        <Route path="/Extraordinarios" element={<Extraordinarios />} />
        <Route path="/Fascinantes" element={<Fascinantes />} />
        <Route path="/Trascendentes" element={<Trascendentes />} />
        <Route path="/Genuinos" element={<Genuinos />} />
        <Route path="/Conscientes" element={<Conscientes />} />
        <Route path="/dominios-intro" element={<FascinantesIntro />} />
        <Route path="/dominios-test" element={<FascinantesTest />} />
        <Route path="/dominios-transition" element={<FascinantesTransition />} />
        <Route path="/dominios-result" element={<FascinantesResult />} />
        <Route path="/liderazgo-test-intro" element={<LiderazgoTestIntro />} />
        <Route path="/liderazgo-test" element={<LiderazgoTest />} />
        <Route path="/liderazgo-results" element={<LiderazgoResults />} />
        <Route path="/test-temperamento-intro" element={<TemperamentoTestIntro />} />
        <Route path="/test-temperamento" element={<TemperamentoTest />} />
        <Route path="/test-temperamento-resultado" element={<TemperamentoResult />} />

        <Route path="/dominios" element={<AutodiagRegister />} />
        <Route path="/dominios-payment" element={<AutodiagPayment />} />
        <Route path="/dominios-payment-status" element={<AutodiagPaymentStatus />} />

        <Route path="/dominios-landing" element={<DominiosLanding result={testResult} setTestResult={setTestResult} />} />
        <Route path="/mlt-Landing" element={<MltLanding result={testResult} setTestResult={setTestResult} />} />
        <Route path="/eneagrama-landing" element={<EneagramaLanding result={testResult} setTestResult={setTestResult} />} />

        <Route path="/inscripcion" element={<WorkshopInscripcion />} />
        <Route path="/inscripcion-haz-que-suceda" element={<WorkshopInscripcionHazQueSuceda />} />
        <Route path="/inscripcion-status" element={<WorkshopPaymentStatus />} />

        <Route
          path="/eneagrama-test-intro"
          element={<BasicTestIntro />}
        />

        <Route
          path="/eneagrama-test"
          element={<Test onComplete={handleTestComplete} />}
        />

        <Route
          path="/eneagrama-result"
          element={
            testResult ? (
              <Result result={testResult} user={user} onReset={handleReset} />
            ) : (
              <Navigate to="/eneagrama" replace />
            )
          }
        />


        <Route
          path="/eneagrama-payment"
          element={<PaymentPage />}
        />

        <Route
          path="/eneagrama-advanced-test-landing"
          element={<AdvancedLanding result={testResult} setTestResult={setTestResult} />}
        />

        <Route
          path="/eneagrama-payment-status"
          element={<PaymentStatus />}
        />

        <Route
          path="/eneagrama-mp-status"
          element={<MpStatus />}
        />

        <Route
          path="/eneagrama-payment-success"
          element={<PaymentSuccess />}
        />

        <Route
          path="/eneagrama-detailed-result"
          element={
            testResult ? (
              <DetailedResult result={testResult} />
            ) : (
              <Navigate to="/eneagrama" replace />
            )
          }
        />

        <Route
          path="/eneagrama-advanced-register"
          element={<AdvancedIntro onRegister={handleRegister} user={user} initialEnneatype={testResult?.enneatype} targetRoute="/eneagrama-advanced-test" />}
        />

        <Route
          path="/eneagrama-advanced-test"
          element={
            testResult ? (
              <AdvancedTest
                topTypes={testResult.enneatypes.slice(0, 3).map(e => e.type)}
                onComplete={handleAdvancedTestComplete}
              />
            ) : (
              <Navigate to="/eneagrama" replace />
            )
          }
        />

        <Route
          path="/eneagrama-advanced-transition"
          element={<AdvancedTransition />}
        />

        <Route
          path="/eneagrama-result-intro"
          element={
            advancedTestResult ? (
              <ResultVideoIntro type={advancedTestResult.confirmedType} />
            ) : (
              <Navigate to="/eneagrama" replace />
            )
          }
        />

        <Route
          path="/eneagrama-initial-analysis"
          element={<Navigate to="/eneagrama-advanced-test-landing" replace />}
        />

        <Route
          path="/eneagrama-advanced-analysis-result"
          element={
            advancedTestResult ? (
              <AdvancedAnalysisResult result={advancedTestResult} user={user} />
            ) : (
              <Navigate to="/eneagrama" replace />
            )
          }
        />

        <Route
          path="/eneagrama-advanced-analysis-result/:type"
          element={<AdvancedAnalysisResult />}
        />

        <Route
          path="/eneagrama-result/:type"
          element={<SingleEnneatypeResult />}
        />

        <Route path="/admin" element={<Admin />} />
        <Route path="/programa" element={<CourseLanding />} />
        <Route path="/programa-genuinos" element={<GenuinosLanding />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/diagnostico-empresarial" element={<BusinessScan />} />
        <Route path="/postulacion-mlt" element={<PostulacionMlt />} />
        <Route path="/presentaciones" element={<PresentationsDashboard />} />
        <Route path="/presentaciones/editor/:id" element={<PresentationEditorPage />} />

        <Route
          path="/eneagrama-empresas"
          element={
            <AdvancedIntro
              onRegister={handleRegister}
              user={user}
              targetRoute="/eneagrama-advanced-test-full"
              showOrganization={true}
              requireAccessCode={true}
              initialEnneatype={testResult?.enneatype}
            />
          }
        />

        <Route
          path="/eneagrama-advanced-test-full"
          element={
            <AdvancedTest
              fullTest={true}
              onComplete={handleAdvancedTestComplete}
            />
          }
        />

        {/* Redirect any other route to home */}
        <Route path="*" element={<Navigate to="/eneagrama" replace />} />
      </Routes>
      </Suspense>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
