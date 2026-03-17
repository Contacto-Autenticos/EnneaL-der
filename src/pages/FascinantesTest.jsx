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
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [activeScreen, setActiveScreen] = useState(null);

    const PROGRESS_SCREENS = {
        // Motivación cada 10 (10, 30, 50, 70, 90, 110)
        10: {
            type: 'motivation',
            title: 'Estás dando el primer paso hacia un mayor nivel de conciencia.',
            text: 'Cada respuesta revela patrones que normalmente pasan desapercibidos.',
            button: 'Continuar'
        },
        30: {
            type: 'motivation',
            title: 'No se trata de responder perfecto, sino de responder honesto.',
            text: 'Ahí es donde comienza el verdadero cambio.',
            button: 'Seguir avanzando'
        },
        50: {
            type: 'motivation',
            title: 'Ya has recorrido más de lo que la mayoría logra.',
            text: 'Tu nivel de compromiso ya está marcando la diferencia.',
            button: 'Continuar el proceso'
        },
        70: {
            type: 'motivation',
            title: 'Estás entrando en una zona más profunda de tu autoconocimiento.',
            text: 'Mantente presente en cada respuesta.',
            button: 'Continuar'
        },
        90: {
            type: 'motivation',
            title: 'Estás muy cerca de descubrir una visión más clara de ti mismo.',
            text: 'Lo que sigue puede sorprenderte.',
            button: 'Seguir'
        },
        110: {
            type: 'motivation',
            title: 'Último tramo.',
            text: 'Aquí es donde todo comienza a tomar forma.',
            button: 'Finalizar test'
        },
        // Descanso cada 20 (20, 40, 60, 80, 100)
        20: {
            type: 'rest',
            title: 'Puedes tomar un momento para respirar.',
            text: 'Este proceso no es una carrera, es un espacio para ti.',
            instruction: '“Respira profundo 3 veces antes de continuar”',
            subtext: 'Cuando estés listo, continuamos.',
            button: 'Continuar'
        },
        40: {
            type: 'rest',
            title: 'Estás avanzando muy bien.',
            text: 'Detenerte unos segundos también hace parte del proceso.',
            instruction: '“Respira profundo 3 veces antes de continuar”',
            subtext: 'Vuelve cuando te sientas enfocado.',
            button: 'Seguir'
        },
        60: {
            type: 'rest',
            title: 'Has llegado a la mitad del camino.',
            text: 'Lo que has respondido ya contiene información valiosa sobre ti.',
            instruction: '“Respira profundo 3 veces antes de continuar”',
            subtext: 'Lo que sigue te dará aún más claridad.',
            button: 'Continuar'
        },
        80: {
            type: 'rest',
            title: 'Estás sosteniendo el proceso con intención.',
            text: 'Eso ya habla de un nivel de conciencia superior.',
            instruction: '“Respira profundo 3 veces antes de continuar”',
            subtext: 'Tómate un momento antes de continuar.',
            button: 'Seguir'
        },
        100: {
            type: 'rest',
            title: 'Estás a punto de completar el proceso.',
            text: 'Lo que descubrirás integrará todo lo que has respondido.',
            instruction: '“Respira profundo 3 veces antes de continuar”',
            subtext: 'Último esfuerzo.',
            button: 'Continuar'
        }
    };

    const DOMAIN_STYLES = {
        corporal: { color: '#ff3131', class: 'neon-corporal' },
        mental: { color: '#ff9100', class: 'neon-mental' },
        emocional: { color: '#ffee00', class: 'neon-emocional' },
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
        setAnswers({ ...answers, [currentQuestion.id]: value });
        
        // Auto advance after short delay
        if (currentIndex < fascinantesQuestions.length - 1) {
            setTimeout(() => {
                goToNext();
            }, 300);
        } else {
            // Automatic submission on last question
            setTimeout(() => {
                handleSubmit({ ...answers, [currentQuestion.id]: value });
            }, 500);
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
        navigate('/autodiag-transition');
    };

    return (
        <div className="fascinantes-test-page">
            <div className="futuristic-overlay"></div>
            
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
                        
                        <div className="speedometer-section">
                            <FascinantesSpeedometer value={answers[currentQuestion.id] || 0} />
                        </div>
                            
                            <div className="options-grid">
                                {[1, 2, 3, 4, 5].map((val) => (
                                    <button
                                        key={val}
                                        className={`option-btn ${answers[currentQuestion.id] === val ? 'selected' : ''}`}
                                        onClick={() => handleAnswer(val)}
                                    >
                                        <span className="val-num">{val}</span>
                                        <span className="val-desc">
                                            {val === 1 ? 'Nunca' : 
                                            val === 2 ? <>RARA<br/>VEZ</> : 
                                            val === 3 ? 'A VECES' : 
                                            val === 4 ? <>CASI<br/>SIEMPRE</> : 
                                            'SIEMPRE'}
                                        </span>
                                    </button>
                                ))}
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
