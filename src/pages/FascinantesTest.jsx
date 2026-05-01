import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, ChevronRight, Send, User, Brain, HeartPulse, 
    Handshake, Eye, TrendingUp, Zap, Target 
} from 'lucide-react';
import { fascinantesQuestions, fascinantesDomains } from '../data/fascinantesData';
import FascinantesSpeedometer from '../components/FascinantesSpeedometer';
import './FascinantesTest.css';

const FascinantesTest = () => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(() => {
        const saved = localStorage.getItem('fascinantesProgress');
        if (saved) {
            try {
                const { index } = JSON.parse(saved);
                return index || 0;
            } catch { return 0; }
        }
        return 0;
    });
    const [answers, setAnswers] = useState(() => {
        const saved = localStorage.getItem('fascinantesProgress');
        if (saved) {
            try {
                const { answers: savedAnswers } = JSON.parse(saved);
                return savedAnswers || {};
            } catch { return {}; }
        }
        return {};
    });
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [activeScreen, setActiveScreen] = useState(null);
    const [showResumeModal, setShowResumeModal] = useState(false);

    // Check for saved progress on mount
    useEffect(() => {
        const saved = localStorage.getItem('fascinantesProgress');
        if (saved) {
            try {
                const { index, answers: savedAnswers } = JSON.parse(saved);
                if (index > 0 && savedAnswers && Object.keys(savedAnswers).length > 0) {
                    setShowResumeModal(true);
                }
            } catch { /* ignore */ }
        }
    }, []);

    // Protection Logic
    useEffect(() => {
        const isPaid = localStorage.getItem('autodiagPaid') === 'true';
        const hasUser = localStorage.getItem('tempAutodiagUser');
        if (!isPaid || !hasUser) {
            navigate('/dominios');
        }
    }, [navigate]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Numeric keys 1-5 for answers (only when not on a transition screen)
            if (!activeScreen && /^[1-5]$/.test(e.key)) {
                handleAnswer(parseInt(e.key));
                return;
            }

            // Enter key to advance
            if (e.key === 'Enter') {
                if (activeScreen) {
                    goToNext();
                } else if (answers[currentQuestion.id] && currentIndex < fascinantesQuestions.length - 1) {
                    goToNext();
                } else if (currentIndex === fascinantesQuestions.length - 1 && Object.keys(answers).length === fascinantesQuestions.length) {
                    handleSubmit();
                }
                return;
            }

            // Arrow navigation
            if (!activeScreen) {
                if (e.key === 'ArrowRight' && answers[currentQuestion.id]) {
                    goToNext();
                } else if (e.key === 'ArrowLeft') {
                    goToPrev();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, answers, activeScreen]);

    const PROGRESS_SCREENS = {
        // Motivación cada 14 preguntas (punto medio de cada dominio: 7, 21, 35, 49, 63, 77)
        7: {
            type: 'motivation',
            title: 'Estás reconociendo algunos aspectos importantes de tu dominio corporal.',
            text: 'Recuerda contestar de la forma más honesta posible.',
            button: 'Continuar'
        },
        21: {
            type: 'motivation',
            title: 'El verdadero cambio comienza cuando somos capaces de observarnos de manera honesta.',
            text: 'Continúa el ejercicio, consciente de que este resultado es el insumo que necesitas para evolucionar.',
            button: 'Seguir avanzando'
        },
        35: {
            type: 'motivation',
            title: 'Has logrado avanzar muy bien.',
            text: 'Continúa el proceso respondiendo de manera honesta.',
            button: 'Continuar el proceso'
        },
        49: {
            type: 'motivation',
            title: 'Las relaciones son una parte fundamental de la vida, y su calidad contribuirá a tu crecimiento personal y profesional.',
            text: 'Continúa con la misma concentración.',
            button: 'Continuar'
        },
        63: {
            type: 'motivation',
            title: '“Conocerte a ti mismo es, quizá, una de las estrategias más poderosas para el desarrollo personal, y eso es precisamente lo que estás haciendo aquí.',
            text: 'Continúa por ese camino.',
            button: 'Seguir'
        },
        77: {
            type: 'motivation',
            title: 'Ya estás a pocas preguntas de terminar.',
            text: 'Pronto tendrás un instrumento de autoevaluación muy poderoso.',
            button: 'Finalizar test'
        },
        // Descanso cada 14 preguntas (al finalizar cada dominio: 14, 28, 42, 56, 70)
        14: {
            type: 'rest',
            title: 'Puedes tomar un momento para respirar.',
            text: 'Este proceso no es una carrera, es un espacio para ti.',
            instruction: '“Respira profundo 3 veces antes de continuar”',
            subtext: 'Cuando estés listo, continuamos con el dominio mental.',
            button: 'Continuar'
        },
        28: {
            type: 'rest',
            title: 'Estás avanzando muy bien.',
            text: 'Detenerte unos segundos también hace parte del proceso.',
            instruction: '“Respira profundo 3 veces antes de continuar”',
            subtext: 'Vuelve cuando te sientas enfocado y pasamos al dominio emocional.',
            button: 'Seguir'
        },
        42: {
            type: 'rest',
            title: 'Has llegado a la mitad del camino.',
            text: 'Lo que has respondido ya contiene información valiosa sobre ti.',
            instruction: '“Respira profundo 3 veces antes de continuar”',
            subtext: ' Pasemos ahora al dominio social, el de las relaciones.',
            button: 'Continuar'
        },
        56: {
            type: 'rest',
            title: 'Estás sosteniendo el proceso con intención.',
            text: 'Eso ya habla de un nivel de conciencia superior.',
            instruction: '“Respira profundo 3 veces antes de continuar”',
            subtext: 'Tómate un momento antes de continuar con el dominio espiritual.',
            button: 'Seguir'
        },
        70: {
            type: 'rest',
            title: 'Estás a punto de completar el proceso.',
            text: 'Lo que descubrirás integrará todo lo que has respondido.',
            instruction: '“Respira profundo 3 veces antes de continuar”',
            subtext: 'Pasaremos ahora al dominio financiero.',
            button: 'Continuar'
        }
    };

    const DOMAIN_STYLES = {
        corporal: { color: '#cc0000', class: 'neon-corporal' },
        mental: { color: '#ff9100', class: 'neon-mental' },
        emocional: { color: '#DDBE3D', class: 'neon-emocional' },
        social: { color: '#00ff00', class: 'neon-social' },
        espiritual: { color: '#00e5ff', class: 'neon-espiritual' },
        financiero: { color: '#d500f9', class: 'neon-financiero' }
    };

    const currentQuestion = fascinantesQuestions[currentIndex];
    
    // Custom domain icons with specific neon implementation
    const getDomainIcon = (domainId) => {
        const style = DOMAIN_STYLES[domainId] || { color: '#ddbe3d', class: '' };
        const props = { size: 24, stroke: style.color, strokeWidth: 1.5 };
        
        const renderIcon = () => {
            switch(domainId) {
                case 'corporal': return <User {...props} />;
                case 'mental': return <Brain {...props} />;
                case 'emocional': return <HeartPulse {...props} />;
                case 'social': return <Handshake {...props} />;
                case 'espiritual': return <Eye {...props} />;
                case 'financiero': return <TrendingUp {...props} />;
                default: return <Zap {...props} />;
            }
        };

        return (
            <span className="custom-domain-icon">
                {renderIcon()}
            </span>
        );
    };

    const currentDomain = fascinantesDomains.find(d => d.id === currentQuestion.domain);
    const domainStyle = DOMAIN_STYLES[currentQuestion.domain] || { color: '#ddbe3d', class: '' };
    const progress = ((currentIndex + 1) / fascinantesQuestions.length) * 100;

    const handleAnswer = (value) => {
        const updatedAnswers = { ...answers, [currentQuestion.id]: value };
        setAnswers(updatedAnswers);

        // Save progress to localStorage
        localStorage.setItem('fascinantesProgress', JSON.stringify({
            index: currentIndex,
            answers: updatedAnswers,
            timestamp: Date.now()
        }));
        
        // Auto advance after longer delay to allow speedometer animation
        if (currentIndex < fascinantesQuestions.length - 1) {
            setTimeout(() => {
                goToNext();
            }, 1000);
        } else {
            // Automatic submission on last question
            setTimeout(() => {
                handleSubmit(updatedAnswers);
            }, 1000);
        }
    };

    const goToNext = () => {
        const questionNumber = currentIndex + 1;
        if (PROGRESS_SCREENS[questionNumber] && !activeScreen) {
            setActiveScreen(PROGRESS_SCREENS[questionNumber]);
            return;
        }

        if (currentIndex < fascinantesQuestions.length - 1) {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentIndex(currentIndex + 1);
                setIsTransitioning(false);
                setActiveScreen(null);
            }, 300);
        }
    };

    const goToPrev = () => {
        if (currentIndex > 0) {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentIndex(currentIndex - 1);
                setIsTransitioning(false);
            }, 300);
        }
    };

    const isComplete = Object.keys(answers).length === fascinantesQuestions.length;

    const handleSubmit = (finalAnswers = answers) => {
        localStorage.setItem('fascinantesAnswers', JSON.stringify(finalAnswers));
        localStorage.setItem('fascinantes_needs_save', 'true');
        // Clear partial progress since test is complete
        localStorage.removeItem('fascinantesProgress');
        navigate('/dominios-transition');
    };

    const handleRestart = () => {
        localStorage.removeItem('fascinantesProgress');
        setCurrentIndex(0);
        setAnswers({});
        setShowResumeModal(false);
    };

    const handleResume = () => {
        setShowResumeModal(false);
    };

    return (
        <div className="fascinantes-test-page">
            <div className="futuristic-overlay"></div>

            {/* Resume Progress Modal */}
            {showResumeModal && (
                <div className="resume-modal-overlay">
                    <div className="resume-modal">
                        <div className="resume-modal-icon">⏸️</div>
                        <h2>¡Tienes progreso guardado!</h2>
                        <p>Respondiste <strong>{Object.keys(answers).length}</strong> de <strong>{fascinantesQuestions.length}</strong> preguntas.</p>
                        <p className="resume-modal-sub">¿Deseas continuar donde te quedaste?</p>
                        <div className="resume-modal-buttons">
                            <button className="resume-btn-continue" onClick={handleResume}>
                                Continuar donde me quedé
                            </button>
                            <button className="resume-btn-restart" onClick={handleRestart}>
                                Empezar desde cero
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {activeScreen ? (
                <div className="progress-screen-overlay fade-in">
                    <div className="progress-screen-content">
                        <div className="screen-type-tag">
                            {activeScreen.type === 'motivation' ? 'MOMENTO DE REFLEXIÓN' : 'MOMENTO DE DESCANSO'}
                        </div>
                        
                        <h2 className="screen-title">{activeScreen.title}</h2>
                        <p className="screen-text">{activeScreen.text}</p>
                        
                        {activeScreen.type === 'rest' && (
                            <div className="rest-instructions">
                                <div className="breathing-box">
                                    <p className="breathing-text">{activeScreen.instruction}</p>
                                </div>
                                <p className="subtext">{activeScreen.subtext}</p>
                                
                                <div className="rest-progress-info">
                                    <div className="rest-progress-bar">
                                        <div className="rest-progress-fill" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <span className="rest-progress-percentage">{Math.round(progress)}% completado</span>
                                </div>
                            </div>
                        )}
                        
                        <button className="screen-continue-btn" onClick={goToNext}>
                            {activeScreen.button} <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="test-header">
                        <div className={`domain-label ${domainStyle.class}`}>
                            {getDomainIcon(currentQuestion.domain)}
                            <span className="domain-name">{currentDomain.name}</span>
                        </div>
                        <div className="test-progress-container">
                            <span className="progress-text" style={{ color: domainStyle.color }}>{currentIndex + 1} / {fascinantesQuestions.length}</span>
                            <div className="progress-bar-bg">
                                <div 
                                    className="progress-bar-glow" 
                                    style={{ 
                                        width: `${progress}%`,
                                        '--domain-color': domainStyle.color
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className={`question-container ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
                        <div className="question-text-container">
                            <h3 className="question-text">{currentQuestion.text}</h3>
                        </div>
                        
                        <div className="interaction-area">
                            <div className="speedometer-section">
                                <FascinantesSpeedometer value={answers[currentQuestion.id] || 0} />
                            </div>
                                
                            <div className="options-grid">
                                {[1, 2, 3, 4, 5].map((val) => (
                                    <button
                                        key={`${currentQuestion.id}-${val}`}
                                        className={`option-btn ${answers[currentQuestion.id] === val ? 'selected' : ''}`}
                                        onClick={() => handleAnswer(val)}
                                    >
                                        <span className="val-num">{val}</span>
                                        <span className="val-desc">
                                            {val === 1 ? <>CASI<br/>NUNCA</> : 
                                            val === 2 ? <>POCAS<br/>VECES</> : 
                                            val === 3 ? <>A<br/>VECES</> : 
                                            val === 4 ? <>CON<br/>FRECUENCIA</> : 
                                            <>CASI<br/>SIEMPRE</>}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="test-navigation">
                        <button 
                            className="nav-btn prev" 
                            onClick={goToPrev} 
                            disabled={currentIndex === 0}
                        >
                            <ChevronLeft /> ANTERIOR
                        </button>
                        
                        {currentIndex === fascinantesQuestions.length - 1 ? (
                            <button 
                                className={`submit-btn ${isComplete ? 'ready' : 'disabled'}`}
                                onClick={handleSubmit}
                                disabled={!isComplete}
                            >
                                FINALIZAR <Send size={18} />
                            </button>
                        ) : (
                            <button 
                                className="nav-btn next" 
                                onClick={goToNext}
                                disabled={!answers[currentQuestion.id]}
                            >
                                SIGUIENTE <ChevronRight />
                            </button>
                        )}
                    </div>
                </>
            )}

            <footer className="intro-footer-small">
                <img src="/Logo-Blanco.png" alt="Auténticos" />
            </footer>
        </div>
    );
};

export default FascinantesTest;
