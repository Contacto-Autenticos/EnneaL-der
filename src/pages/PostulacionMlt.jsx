import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ChevronRight, ChevronLeft, Send, CheckCircle2 } from 'lucide-react';
import './PostulacionMlt.css';

const PostulacionMlt = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState([]);

  // SEO & Meta Tags Update
  useEffect(() => {
    const originalTitle = document.title;
    const originalDescription = document.querySelector('meta[name="description"]')?.getAttribute('content');
    const originalOgTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
    const originalOgDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content');

    const newTitle = "Postulación MLT";
    const newDesc = "Inicia tu proceso de postulación a Master Live Training.";

    document.title = newTitle;
    
    const updateMeta = (selector, attr, value) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };

    updateMeta('meta[name="description"]', 'content', newDesc);
    updateMeta('meta[property="og:title"]', 'content', newTitle);
    updateMeta('meta[property="og:description"]', 'content', newDesc);
    updateMeta('meta[property="twitter:title"]', 'content', newTitle);
    updateMeta('meta[property="twitter:description"]', 'content', newDesc);

    return () => {
      document.title = originalTitle;
      if (originalDescription) updateMeta('meta[name="description"]', 'content', originalDescription);
      if (originalOgTitle) updateMeta('meta[property="og:title"]', 'content', originalOgTitle);
      if (originalOgDesc) updateMeta('meta[property="og:description"]', 'content', originalOgDesc);
    };
  }, []);

  const [formData, setFormData] = useState({
    // B1. Datos básicos
    name: '',
    email: '',
    whatsapp: '',
    location: '',
    ageRange: '',
    occupation: '',
    company: '',
    role: '',

    // B2. Momento actual
    currentMoment: '',
    mltReason: '',
    urgentChallenge: '',

    // B3. Responsabilidad e impacto
    decisionImpact: '',
    peopleInCharge: '',
    decisionLevel: '',

    // B4. Disposición al cambio
    questionBeliefsReadiness: 0,
    failureAttitude: '',
    feedbackComfort: 0,
    aspectToWork: '',

    // B5. Motivación y expectativas
    expectations: [],
    valuableResult: '',

    // B6. Compromiso real
    commitment90Days: '',
    activeParticipationReadiness: 0,
    processPriority: 0,
    impediments: ''
  });

  const totalSteps = 6;

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      const currentList = formData[name] || [];
      if (checked) {
        if (name === 'expectations' && currentList.length >= 3) return;
        setFormData(prev => ({ ...prev, [name]: [...currentList, value] }));
      } else {
        setFormData(prev => ({ ...prev, [name]: currentList.filter(item => item !== value) }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const nextStep = () => {
    if (step === 1) {
      const requiredFields = ['name', 'email', 'whatsapp', 'location', 'ageRange', 'occupation'];
      const missing = requiredFields.filter(f => !formData[f]);
      if (missing.length > 0) {
        setErrors(missing);
        alert('Por favor completa todos los campos obligatorios para continuar.');
        return;
      }
    }
    setErrors([]);
    setStep(s => Math.min(s + 1, totalSteps));
  };
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error: dbError } = await supabase
        .from('mlt_applications')
        .insert([{
          name: formData.name,
          email: formData.email,
          whatsapp: formData.whatsapp,
          location: formData.location,
          age_range: formData.ageRange,
          occupation: formData.occupation,
          company: formData.company,
          role: formData.role,
          current_moment: formData.currentMoment,
          mlt_reason: formData.mltReason,
          urgent_challenge: formData.urgentChallenge,
          decision_impact: formData.decisionImpact,
          people_in_charge: formData.peopleInCharge,
          decision_level: formData.decisionLevel,
          question_beliefs_readiness: formData.questionBeliefsReadiness,
          failure_attitude: formData.failureAttitude,
          feedback_comfort: formData.feedbackComfort,
          aspect_to_work: formData.aspectToWork,
          expectations: formData.expectations,
          valuable_result: formData.valuableResult,
          commitment_90_days: formData.commitment90Days,
          active_participation_readiness: formData.activeParticipationReadiness,
          process_priority: formData.processPriority,
          impediments: formData.impediments
        }]);

      if (dbError) console.error('Error guardando en base de datos:', dbError);

      const { data, error } = await supabase.functions.invoke('mlt-application', {
        body: formData
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('Hubo un error al enviar tu postulación. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="business-scan-container">
        <div className="business-scan-card success-card">
          <CheckCircle2 className="success-icon-large" size={80} />
          <h1>¡Postulación Recibida!</h1>
          <p>Gracias por dar este importante paso.</p>
          <p>Nuestro equipo revisará cuidadosamente tus respuestas para asegurar que Master Live Training es el programa adecuado para acompañar tu momento actual.</p>
          <p>Pronto recibirás noticias nuestras a través de correo electrónico o WhatsApp con los siguientes pasos.</p>
          <button className="submit-btn" onClick={() => window.location.href = 'https://www.autenticos.co/'}>Volver al Inicio</button>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="step-content animate-in">
            <h2>1. Datos Básicos</h2>
            <div className="form-grid">
              <div className="form-group"><label>Nombre Completo *</label><input className={errors.includes('name') ? 'error' : ''} name="name" value={formData.name} onChange={handleChange} required /></div>
              <div className="form-group"><label>Correo Electrónico *</label><input type="email" className={errors.includes('email') ? 'error' : ''} name="email" value={formData.email} onChange={handleChange} required /></div>
              <div className="form-group"><label>WhatsApp *</label><input className={errors.includes('whatsapp') ? 'error' : ''} name="whatsapp" value={formData.whatsapp} onChange={handleChange} required /></div>
              <div className="form-group"><label>Ciudad y País *</label><input className={errors.includes('location') ? 'error' : ''} name="location" value={formData.location} onChange={handleChange} required /></div>
              
              <div className="form-group">
                <label>Edad o Rango de Edad *</label>
                <select className={errors.includes('ageRange') ? 'error' : ''} name="ageRange" value={formData.ageRange} onChange={handleChange} required>
                  <option value="" disabled>Selecciona un rango...</option>
                  <option>18 a 25 años</option>
                  <option>26 a 35 años</option>
                  <option>36 a 45 años</option>
                  <option>46 a 55 años</option>
                  <option>Más de 55 años</option>
                </select>
              </div>

              <div className="form-group"><label>Ocupación Actual *</label><input className={errors.includes('occupation') ? 'error' : ''} name="occupation" value={formData.occupation} onChange={handleChange} required /></div>
              <div className="form-group"><label>Empresa u Organización (Opcional)</label><input name="company" value={formData.company} onChange={handleChange} /></div>
              <div className="form-group"><label>Cargo o Rol Actual (Opcional)</label><input name="role" value={formData.role} onChange={handleChange} /></div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="step-content animate-in">
            <h2>2. Momento Actual</h2>
            <div className="form-grid full-width">
              <div className="form-group">
                <label>¿Cuál frase describe mejor tu momento actual?</label>
                <select name="currentMoment" value={formData.currentMoment} onChange={handleChange} required>
                  <option value="" disabled>Selecciona una opción...</option>
                  <option>Estoy creciendo y quiero prepararme para un siguiente nivel.</option>
                  <option>Estoy en una etapa de transición o redefinición.</option>
                  <option>Tengo buenos resultados, pero siento que algo importante necesita cambiar.</option>
                  <option>Me siento agotado o sobrecargado y necesito recuperar claridad.</option>
                  <option>Solo estoy explorando opciones.</option>
                </select>
              </div>
              <div className="form-group">
                <label>¿Qué te llevó a considerar Master Live Training en este momento?</label>
                <textarea name="mltReason" value={formData.mltReason} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>¿Qué desafío personal o profesional sientes que necesitas atender con mayor urgencia?</label>
                <textarea name="urgentChallenge" value={formData.urgentChallenge} onChange={handleChange} required />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="step-content animate-in">
            <h2>3. Responsabilidad e Impacto</h2>
            <div className="form-grid full-width">
              <div className="form-group">
                <label>Actualmente tus decisiones impactan principalmente a:</label>
                <select name="decisionImpact" value={formData.decisionImpact} onChange={handleChange} required>
                  <option value="" disabled>Selecciona una opción...</option>
                  <option>Solo a mí.</option>
                  <option>A mi familia o círculo cercano.</option>
                  <option>A un equipo pequeño.</option>
                  <option>A un equipo grande o varias áreas.</option>
                  <option>A una empresa, comunidad u organización completa.</option>
                </select>
              </div>
              <div className="form-group">
                <label>¿Tienes personas a cargo directa o indirectamente?</label>
                <select name="peopleInCharge" value={formData.peopleInCharge} onChange={handleChange} required>
                  <option value="" disabled>Selecciona cantidad...</option>
                  <option>No.</option>
                  <option>1 a 3 personas.</option>
                  <option>4 a 10 personas.</option>
                  <option>11 a 30 personas.</option>
                  <option>Más de 30 personas.</option>
                </select>
              </div>
              <div className="form-group">
                <label>¿Qué nivel de toma de decisiones tienes actualmente?</label>
                <select name="decisionLevel" value={formData.decisionLevel} onChange={handleChange} required>
                  <option value="" disabled>Selecciona nivel...</option>
                  <option>Bajo: ejecuto decisiones tomadas por otros.</option>
                  <option>Medio: tomo decisiones sobre mi trabajo o proyectos.</option>
                  <option>Alto: tomo decisiones que afectan equipos, clientes o resultados.</option>
                  <option>Muy alto: tomo decisiones estratégicas para una empresa, comunidad u organización.</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="step-content animate-in">
            <h2>4. Disposición al Cambio</h2>
            <div className="form-grid full-width">
              <div className="form-group">
                <label>¿Qué tan dispuesto estás a cuestionar creencias, hábitos o patrones personales que han influido en tus resultados?</label>
                <div className="rating-segments full-width-segments">
                  {[1, 2, 3, 4, 5].map(num => (
                    <div 
                      key={num} 
                      className={`rating-segment ${num <= formData.questionBeliefsReadiness ? 'active' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, questionBeliefsReadiness: num }))}
                    ></div>
                  ))}
                </div>
                <div className="slider-labels"><span>Poco dispuesto</span><span>Muy dispuesto</span></div>
              </div>

              <div className="form-group">
                <label>Cuando algo no sale como esperas, normalmente tiendes a:</label>
                <select name="failureAttitude" value={formData.failureAttitude} onChange={handleChange} required>
                  <option value="" disabled>Selecciona una opción...</option>
                  <option>Culpar principalmente a otros o al entorno.</option>
                  <option>Sentirme frustrado, pero no siempre revisar mi responsabilidad.</option>
                  <option>Revisar qué pude haber hecho diferente.</option>
                  <option>Buscar activamente aprendizaje y asumir responsabilidad.</option>
                  <option>Pedir retroalimentación y trabajar sobre mí mismo.</option>
                </select>
              </div>

              <div className="form-group">
                <label>¿Qué tan cómodo te sientes recibiendo retroalimentación honesta sobre tu forma de liderar, decidir o relacionarte?</label>
                <div className="rating-segments full-width-segments">
                  {[1, 2, 3, 4, 5].map(num => (
                    <div 
                      key={num} 
                      className={`rating-segment ${num <= formData.feedbackComfort ? 'active' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, feedbackComfort: num }))}
                    ></div>
                  ))}
                </div>
                <div className="slider-labels"><span>Nada cómodo</span><span>Muy cómodo</span></div>
              </div>

              <div className="form-group">
                <label>¿Qué aspecto de ti mismo sabes que necesitas trabajar en esta etapa de tu vida?</label>
                <textarea name="aspectToWork" value={formData.aspectToWork} onChange={handleChange} required />
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="step-content animate-in">
            <h2>5. Motivación y Expectativas</h2>
            <div className="form-grid full-width">
              <div className="form-group">
                <label>¿Qué esperas obtener de esta experiencia? (Máximo 3)</label>
                <div className="checkbox-grid">
                  {[
                    'Mayor claridad personal', 'Mejor liderazgo', 'Recuperar dirección', 
                    'Fortalecer mi propósito', 'Mejorar mis relaciones', 'Aumentar mi impacto', 
                    'Gestionar mejor mi energía', 'Tomar mejores decisiones', 'Obtener un certificado', 
                    'Hacer networking', 'Vivir una experiencia profunda de crecimiento'
                  ].map(p => (
                    <label key={p} className={`checkbox-item ${!formData.expectations.includes(p) && formData.expectations.length >= 3 ? 'disabled' : ''}`}>
                      <input 
                        type="checkbox" 
                        name="expectations" 
                        value={p} 
                        checked={formData.expectations.includes(p)} 
                        onChange={handleChange} 
                        disabled={!formData.expectations.includes(p) && formData.expectations.length >= 3}
                      />
                      {p}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>¿Cuál sería para ti un resultado valioso al finalizar los 90 días?</label>
                <textarea name="valuableResult" value={formData.valuableResult} onChange={handleChange} required />
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="step-content animate-in">
            <h2>6. Compromiso Real</h2>
            <div className="form-grid full-width">
              <div className="form-group">
                <label>¿Puedes comprometerte con el proceso completo de 90 días?</label>
                <select name="commitment90Days" value={formData.commitment90Days} onChange={handleChange} required>
                  <option value="" disabled>Selecciona una opción...</option>
                  <option>Sí, completamente.</option>
                  <option>Sí, aunque debo organizar mi agenda.</option>
                  <option>Tengo dudas sobre mi disponibilidad.</option>
                  <option>No estoy seguro.</option>
                </select>
              </div>

              <div className="form-group">
                <label>¿Estás dispuesto a participar activamente en experiencias, conversaciones, ejercicios y prácticas personales?</label>
                <div className="rating-segments full-width-segments">
                  {[1, 2, 3, 4, 5].map(num => (
                    <div 
                      key={num} 
                      className={`rating-segment ${num <= formData.activeParticipationReadiness ? 'active' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, activeParticipationReadiness: num }))}
                    ></div>
                  ))}
                </div>
                <div className="slider-labels"><span>Poco dispuesto</span><span>Muy dispuesto</span></div>
              </div>

              <div className="form-group">
                <label>¿Qué tan prioritario es este proceso para ti en este momento?</label>
                <div className="rating-segments full-width-segments">
                  {[1, 2, 3, 4, 5].map(num => (
                    <div 
                      key={num} 
                      className={`rating-segment ${num <= formData.processPriority ? 'active' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, processPriority: num }))}
                    ></div>
                  ))}
                </div>
                <div className="slider-labels"><span>Baja prioridad</span><span>Máxima prioridad</span></div>
              </div>

              <div className="form-group">
                <label>¿Qué podría impedirte aprovechar plenamente esta experiencia?</label>
                <textarea name="impediments" value={formData.impediments} onChange={handleChange} />
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="business-scan-container">
      <div className="business-scan-card">
        <header className="business-scan-header">
          <div className="header-top">
            <img src="/logo-moneda.png" alt="Auténticos" className="business-scan-logo" />
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
            </div>
            <div className="step-indicator">Paso {step} de {totalSteps}</div>
          </div>
        </header>

        <form className="business-scan-form" onSubmit={step === totalSteps ? handleSubmit : (e) => e.preventDefault()}>
          {renderStep()}

          <div className="step-navigation">
            {step > 1 && (
              <button 
                key={`prev-${step}`}
                type="button" 
                className="nav-btn prev" 
                onClick={prevStep}
              >
                <ChevronLeft size={20} /> Anterior
              </button>
            )}
            
            {step < totalSteps ? (
              <button 
                key={`next-${step}`}
                type="button" 
                className="nav-btn next" 
                onClick={nextStep}
              >
                Siguiente <ChevronRight size={20} />
              </button>
            ) : (
              <button 
                key="submit-final"
                type="submit" 
                className="submit-btn" 
                disabled={loading}
              >
                {loading ? 'Enviando...' : (
                  <>Finalizar <Send size={20} /></>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostulacionMlt;
