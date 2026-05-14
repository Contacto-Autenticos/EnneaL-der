import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ChevronRight, ChevronLeft, Send, CheckCircle2 } from 'lucide-react';
import './BusinessScan.css';

const BusinessScan = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    // S1. Información General
    companyName: '',
    industry: '',
    employeeCount: '',
    location: '',
    coverage: 'Nacional',
    respName: '',
    respRole: '',
    email: '',
    phone: '',
    orgLevel: 'Todos los niveles',
    interventionArea: 'Liderazgo transversal',

    // S2. Contexto Estratégico
    challenges: '',
    changes: '',
    goals: '',
    priorities: [], // Multi-select
    expectedImpact: '',
    expectedResults: '', // New field for S2

    // S3. Necesidades y Brechas
    performanceIssues: '',
    areaBreaches: '',
    missingSkills: '',
    breachesScores: {
      liderazgo: 3, comunicacion: 3, gestionEmocional: 3, planeacion: 3,
      productividad: 3, trabajoEquipo: 3, cultura: 3, innovacion: 3,
      adaptabilidad: 3, gestionTiempo: 3, conflictos: 3, compromiso: 3
    },
    urgency: 'Media',
    consequences: [],

    // S4. Cultura y Cambio
    cultureDescription: '',
    cultureStrengths: '',
    cultureBarriers: '',
    changeReadiness: 3,
    leadershipCommitment: '',
    hasPrevPrograms: 'No',
    prevWhatWorked: '',
    prevWhatNotWorked: '',

    // S5. Población Objetivo
    targetPublic: [],
    participantCount: '11 a 30',
    needsByLevel: '',

    // S6. Formato y Logística
    preferredModality: 'Presencial',
    idealDuration: 'Taller (4 a 8 horas)',
    logisticsRestrictions: '',

    // S7. Presupuesto y Decisión
    investmentRange: 'USD 1.000 a USD 5.000',
    investmentPriority: 'Media',
    decisionMaker: '',
    decisionFactors: []
  });

  const totalSteps = 7;

  // Scroll to top on step change
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      const currentList = formData[name] || [];
      if (checked) {
        setFormData(prev => ({ ...prev, [name]: [...currentList, value] }));
      } else {
        setFormData(prev => ({ ...prev, [name]: currentList.filter(item => item !== value) }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleScoreChange = (key, val) => {
    setFormData(prev => ({
      ...prev,
      breachesScores: { ...prev.breachesScores, [key]: parseInt(val) }
    }));
  };

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('business-scan', {
        body: formData
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('Hubo un error al enviar tu diagnóstico. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="business-scan-container">
        <div className="business-scan-card success-card">
          <CheckCircle2 className="success-icon-large" size={80} />
          <h1>¡Diagnóstico Completado!</h1>
          <p>Gracias por compartir esta información.</p>
          <p>Este diagnóstico constituye el primer paso para diseñar una solución estratégica, humana y altamente efectiva que fortalezca el liderazgo, la cultura y los resultados de su organización.</p>
          <p>En Auténticos creemos que transformar empresas requiere primero desarrollar líderes más conscientes, auténticos y estratégicos.</p>
          <button className="submit-btn" onClick={() => window.location.href = 'https://www.autenticos.co/'}>Conoce más acerca de Auténticos</button>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="step-content animate-in">
            <h2>1. Información General</h2>
            <div className="form-grid">
              <div className="form-group"><label>Nombre de la Empresa</label><input name="companyName" value={formData.companyName} onChange={handleChange} required /></div>
              <div className="form-group"><label>Industria</label><input name="industry" value={formData.industry} onChange={handleChange} /></div>
              <div className="form-group"><label>Colaboradores</label><input name="employeeCount" value={formData.employeeCount} onChange={handleChange} placeholder="Ej: 150" /></div>
              <div className="form-group"><label>Ubicación</label><input name="location" value={formData.location} onChange={handleChange} /></div>
              <div className="form-group"><label>Cobertura</label>
                <select name="coverage" value={formData.coverage} onChange={handleChange}>
                  <option>Local</option><option>Nacional</option><option>Internacional</option>
                </select>
              </div>
              <div className="form-group"><label>Tu Nombre</label><input name="respName" value={formData.respName} onChange={handleChange} required /></div>
              <div className="form-group"><label>Tu Cargo</label><input name="respRole" value={formData.respRole} onChange={handleChange} /></div>
              <div className="form-group"><label>Correo electrónico</label><input type="email" name="email" value={formData.email} onChange={handleChange} required /></div>
              <div className="form-group"><label>Teléfono</label><input name="phone" value={formData.phone} onChange={handleChange} /></div>
              <div className="form-group">
                <label>Nivel organizacional de interés principal</label>
                <select name="orgLevel" value={formData.orgLevel} onChange={handleChange}>
                  <option>Estratégico (Alta dirección, gerencia, liderazgo)</option>
                  <option>Táctico (Mandos medios, coordinadores, jefaturas)</option>
                  <option>Operativo (Equipos técnicos, ejecutores, servicio)</option>
                  <option>Todos los niveles</option>
                </select>
              </div>
              <div className="form-group">
                <label>Área principal de intervención</label>
                <select name="interventionArea" value={formData.interventionArea} onChange={handleChange}>
                  <option>Comercial / Ventas</option>
                  <option>Administrativa</option>
                  <option>Operativa / Productiva</option>
                  <option>Liderazgo transversal</option>
                  <option>Cultura organizacional</option>
                  <option>Innovación / Transformación</option>
                  <option>Bienestar integral</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="step-content animate-in">
            <h2>2. Contexto Estratégico</h2>
            <div className="form-grid full-width">
              <div className="form-group"><label>¿Cuáles son los principales desafíos estratégicos que enfrenta actualmente la empresa?</label><textarea name="challenges" value={formData.challenges} onChange={handleChange} /></div>
              <div className="form-group"><label>¿Qué cambios está viviendo la organización?</label><textarea name="changes" value={formData.changes} onChange={handleChange} placeholder="crecimiento, transformación, expansión, crisis, cambio cultural, innovación, reestructuración" /></div>
              <div className="form-group"><label>Objetivos estratégicos en los próximos 12 a 24 meses</label><textarea name="goals" value={formData.goals} onChange={handleChange} /></div>
              <div className="form-group">
                <label>Prioridades Organizacionales</label>
                <div className="checkbox-grid">
                  {['Ventas', 'Liderazgo', 'Cultura', 'Productividad', 'Comunicación', 'Rotación', 'Compromiso', 'Innovación', 'Bienestar'].map(p => (
                    <label key={p} className="checkbox-item">
                      <input type="checkbox" name="priorities" value={p} checked={formData.priorities.includes(p)} onChange={handleChange} />
                      {p}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group"><label>¿Qué resultados concretos esperan lograr mediante una intervención de formación o consultoría?</label><textarea name="expectedResults" value={formData.expectedResults} onChange={handleChange} /></div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="step-content animate-in">
            <h2>3. Necesidades y Brechas</h2>
            <div className="form-grid full-width">
              <div className="form-group"><label>¿Qué problemas de desempeño o resultados están afectando actualmente a la empresa?</label><textarea name="performanceIssues" value={formData.performanceIssues} onChange={handleChange} /></div>
              <div className="form-group"><label>¿En qué áreas o equipos se evidencian mayores brechas?</label><textarea name="areaBreaches" value={formData.areaBreaches} onChange={handleChange} /></div>
              <div className="form-group"><label>¿Qué habilidades consideran insuficientemente desarrolladas en sus líderes o equipos?</label><textarea name="missingSkills" value={formData.missingSkills} onChange={handleChange} /></div>
              <div className="form-group">
                <label>Califica el nivel de brecha (1: Sin brecha, 5: Brecha crítica)</label>
                <div className="likert-grid">
                  {Object.entries(formData.breachesScores).map(([key, val]) => (
                    <div key={key} className="likert-item">
                      <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                      <div className="rating-segments">
                        {[1, 2, 3, 4, 5].map(num => (
                          <div 
                            key={num} 
                            className={`rating-segment ${num <= val ? 'active' : ''}`}
                            onClick={() => handleScoreChange(key, num)}
                          ></div>
                        ))}
                      </div>
                      <span className="score-val">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Urgencia de Intervención</label>
                <select name="urgency" value={formData.urgency} onChange={handleChange}>
                  <option>Baja</option><option>Media</option><option>Alta</option><option>Crítica</option>
                </select>
              </div>
              <div className="form-group">
                <label>Consecuencias actuales</label>
                <select name="consequences" value={formData.consequences[0] || ''} onChange={(e) => setFormData(prev => ({ ...prev, consequences: [e.target.value] }))}>
                  <option value="">Selecciona una opción</option>
                  <option>Baja productividad</option>
                  <option>Desmotivación</option>
                  <option>Alta rotación</option>
                  <option>Problemas de liderazgo</option>
                  <option>Fallas de comunicación</option>
                  <option>Pérdida comercial</option>
                  <option>Conflictos internos</option>
                  <option>Desgaste emocional</option>
                  <option>Dificultades de adaptación</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="step-content animate-in">
            <h2>4. Cultura y Disposición al Cambio</h2>
            <div className="form-grid full-width">
              <div className="form-group"><label>Describe la cultura actual de la empresa</label><textarea name="cultureDescription" value={formData.cultureDescription} onChange={handleChange} /></div>
              <div className="form-group"><label>Fortalezas culturales que poseen</label><textarea name="cultureStrengths" value={formData.cultureStrengths} onChange={handleChange} /></div>
              <div className="form-group"><label>Barreras culturales que limintan el crecimiento</label><textarea name="cultureBarriers" value={formData.cultureBarriers} onChange={handleChange} /></div>
              <div className="form-group">
                <label>Disposición al cambio (1-5)</label>
                <div className="rating-segments full-width-segments">
                  {[1, 2, 3, 4, 5].map(num => (
                    <div 
                      key={num} 
                      className={`rating-segment ${num <= formData.changeReadiness ? 'active' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, changeReadiness: num }))}
                    ></div>
                  ))}
                </div>
                <div className="slider-labels"><span>Muy Baja</span><span>Muy Alta</span></div>
              </div>
              <div className="form-group"><label>¿Qué tan comprometidos están los líderes con procesos de transformación?</label><textarea name="leadershipCommitment" value={formData.leadershipCommitment} onChange={handleChange} /></div>
              <div className="form-group">
                <label>¿Han realizado programas de formación previamente?</label>
                <select name="hasPrevPrograms" value={formData.hasPrevPrograms} onChange={handleChange}>
                  <option value="No">No</option>
                  <option value="Sí">Sí</option>
                </select>
              </div>
              
              {formData.hasPrevPrograms === 'Sí' && (
                <div className="conditional-fields animate-in">
                  <div className="form-group"><label>¿Qué funcionó?</label><textarea name="prevWhatWorked" value={formData.prevWhatWorked} onChange={handleChange} /></div>
                  <div className="form-group"><label>¿Qué no funcionó?</label><textarea name="prevWhatNotWorked" value={formData.prevWhatNotWorked} onChange={handleChange} /></div>
                </div>
              )}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="step-content animate-in">
            <h2>5. Población Objetivo</h2>
            <div className="form-grid full-width">
              <div className="form-group">
                <label>Público a intervenir</label>
                <div className="checkbox-grid">
                  {['Directivos', 'Gerentes', 'Jefaturas', 'Coordinadores', 'Comercial', 'Administrativo', 'Operativo', 'Toda la organización'].map(p => (
                    <label key={p} className="checkbox-item">
                      <input type="checkbox" name="targetPublic" value={p} checked={formData.targetPublic.includes(p)} onChange={handleChange} />
                      {p}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Número estimado de participantes</label>
                <select name="participantCount" value={formData.participantCount} onChange={handleChange}>
                  <option>1 a 10</option><option>11 a 30</option><option>31 a 100</option><option>101 a 300</option><option>Más de 300</option>
                </select>
              </div>
              <div className="form-group"><label>Necesidades específicas por nivel</label><textarea name="needsByLevel" value={formData.needsByLevel} onChange={handleChange} /></div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="step-content animate-in">
            <h2>6. Formato y Logística</h2>
            <div className="form-grid full-width">
              <div className="form-group">
                <label>Modalidad preferida</label>
                <select name="preferredModality" value={formData.preferredModality} onChange={handleChange}>
                  <option>Presencial</option><option>Virtual sincrónica</option><option>Virtual asincrónica</option><option>Híbrida</option><option>Mentoría</option><option>Consultoría</option>
                </select>
              </div>
              <div className="form-group">
                <label>Duración ideal</label>
                <select name="idealDuration" value={formData.idealDuration} onChange={handleChange}>
                  <option>Conferencia (1 a 3 h)</option><option>Taller (4 a 8 h)</option><option>Bootcamp (1 a 3 días)</option><option>Programa modular (varias semanas o meses)</option><option>Ruta integral</option>
                </select>
              </div>
              <div className="form-group">
                <label>Restricciones logísticas</label>
                <select name="logisticsRestrictions" value={formData.logisticsRestrictions} onChange={handleChange}>
                  <option value="">Selecciona una restricción principal</option>
                  <option>Tiempo disponible</option>
                  <option>Disponibilidad de líderes</option>
                  <option>Presupuesto</option>
                  <option>Ubicación</option>
                  <option>Tecnología</option>
                  <option>Cultura interna</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="step-content animate-in">
            <h2>7. Presupuesto y Decisión</h2>
            <div className="form-grid full-width">
              <div className="form-group">
                <label>Inversión estimada disponible</label>
                <select name="investmentRange" value={formData.investmentRange} onChange={handleChange}>
                  <option>Menos de USD 1.000</option><option>USD 1.000 a USD 5.000</option><option>USD 5.000 a USD 15.000</option><option>USD 15.000 a USD 50.000</option><option>Más de USD 50.000</option>
                </select>
              </div>
              <div className="form-group">
                <label>Prioridad de inversión</label>
                <select name="investmentPriority" value={formData.investmentPriority} onChange={handleChange}>
                  <option>Baja</option>
                  <option>Media</option>
                  <option>Alta</option>
                  <option>Estratégica</option>
                </select>
              </div>
              <div className="form-group"><label>¿Quién toma la decisión final?</label><input name="decisionMaker" value={formData.decisionMaker} onChange={handleChange} placeholder="Ej: Gerente General, Junta Directiva" /></div>
              <div className="form-group">
                <label>Factores clave de aprobación</label>
                <div className="checkbox-grid">
                  {['ROI esperado', 'Cultura', 'Productividad', 'Ventas', 'Liderazgo', 'Bienestar'].map(f => (
                    <label key={f} className="checkbox-item">
                      <input type="checkbox" name="decisionFactors" value={f} checked={formData.decisionFactors.includes(f)} onChange={handleChange} />
                      {f}
                    </label>
                  ))}
                </div>
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
                  <>Finalizar Diagnóstico <Send size={20} /></>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessScan;
