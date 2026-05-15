import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, ChevronRight, CheckCircle, 
    User, Target, MessageSquare, Users, Star, Shield
} from 'lucide-react';
import { liderazgoQuestions, liderazgoDimensions } from '../data/liderazgoData';
import LiderazgoSpeedometer from '../components/LiderazgoSpeedometer';
import './LiderazgoTest.css';

const LiderazgoTest = () => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [activeScreen, setActiveScreen] = useState(null);
    const [isChanging, setIsChanging] = useState(false);


    const currentQuestion = liderazgoQuestions[currentIndex];
    
    // Safety check to avoid crash if out of bounds (useful for corrupted localStorage)
    if (!currentQuestion) return <div className="l-loading">Cargando...</div>;

    const currentDomain = liderazgoDimensions[currentQuestion.domain] || { name: 'Control', subtext: 'Pregunta de verificación' };

    useEffect(() => {
        const handleKeyDown = (e) => {
            // If on progress screen, Enter continues
            if (activeScreen && (e.key === 'Enter' || e.key === 'ArrowRight')) {
                goToNext();
                return;
            }

            // Ignore if modal is open
            if (showResumeModal || activeScreen) return;

            // 1-5 keys to answer
            if (/^[1-5]$/.test(e.key)) {
                handleAnswer(parseInt(e.key));
            }

            // Arrow Right or Enter to go next (if current is answered)
            if (e.key === 'ArrowRight' || e.key === 'Enter') {
                // If on progress screen, Enter continues
                if (activeScreen) {
                    goToNext();
                } else if (answers[currentQuestion.id]) {
                    // Logic to handle auto-next is already in handleAnswer, 
                    // but manual trigger for ArrowRight
                    const nextIdx = currentIndex + 1;
                    if (nextIdx < liderazgoQuestions.length) {
                         // Similar logic to handleAnswer for screens
                         if (nextIdx % 10 === 0 && nextIdx !== 0 && nextIdx < 50) {
                            setActiveScreen({
                                title: `Has completado: ${currentDomain.name}`,
                                text: "¡Buen trabajo! Sigamos con la siguiente dimensión.",
                                button: "Continuar"
                            });
                         } else if (nextIdx === 50) {
                            setActiveScreen({ title: "Fase de Control", text: "Últimas preguntas...", button: "Comenzar" });
                         } else {
                            setIsChanging(true);
                            setTimeout(() => {
                                setCurrentIndex(nextIdx);
                                setIsChanging(false);
                            }, 400);
                         }
                    }
                }
            }

            // Arrow Left to go back
            if (e.key === 'ArrowLeft') {
                handlePrev();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, answers, showResumeModal, activeScreen]);

    useEffect(() => {
        const saved = localStorage.getItem('liderazgo_test_progress');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Object.keys(parsed).length > 0) {
                    setAnswers(parsed);
                    // Ensure we don't go out of bounds
                    const targetIdx = Math.min(Object.keys(parsed).length, liderazgoQuestions.length - 1);
                    setCurrentIndex(targetIdx);
                    setShowResumeModal(true);
                }
            } catch (e) {
                console.error("Error loading progress", e);
            }
        }
    }, []);

    const handleAnswer = (val) => {
        const newAnswers = { ...answers, [currentQuestion.id]: val };
        setAnswers(newAnswers);
        localStorage.setItem('liderazgo_test_progress', JSON.stringify(newAnswers));

        setTimeout(() => {
            if (currentIndex < liderazgoQuestions.length - 1) {
                const nextIdx = currentIndex + 1;
                // Progress screens every 10 questions (Dimension changes)
                if (nextIdx % 10 === 0 && nextIdx !== 0 && nextIdx < 50) {
                    const dimIndex = Math.floor(nextIdx / 10);
                    const dims = Object.values(liderazgoDimensions);
                    if (dims[dimIndex - 1]) {
                        setActiveScreen({
                            title: `Has completado: ${dims[dimIndex - 1].name}`,
                            text: "¡Buen trabajo! Sigamos con la siguiente dimensión de tu liderazgo.",
                            button: "Continuar"
                        });
                        return;
                    }
                }
                // Screen for control questions
                if (nextIdx === 50) {
                    setActiveScreen({
                        title: "Última fase: Preguntas de Control",
                        text: "Estas preguntas nos ayudarán a validar la consistencia de tu diagnóstico.",
                        button: "Comenzar"
                    });
                    return;
                }
                
                setIsChanging(true);
                setTimeout(() => {
                    setCurrentIndex(nextIdx);
                    setIsChanging(false);
                }, 400);
            } else {
                handleFinish(newAnswers);
            }
        }, 800);
    };

    const handleFinish = (finalAnswers) => {
        localStorage.removeItem('liderazgo_test_progress');
        localStorage.setItem('liderazgo_results', JSON.stringify(finalAnswers));
        // Redirect to results page
        navigate('/liderazgo-results'); 
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setIsChanging(true);
            setTimeout(() => {
                setCurrentIndex(currentIndex - 1);
                setIsChanging(false);
            }, 400);
        }
    };

    const handleRestart = () => {
        setAnswers({});
        setCurrentIndex(0);
        localStorage.removeItem('liderazgo_test_progress');
        setShowResumeModal(false);
    };

    const goToNext = () => {
        setActiveScreen(null);
        setIsChanging(true);
        setTimeout(() => {
            setCurrentIndex(currentIndex + 1);
            setIsChanging(false);
        }, 400);
    };

    const getDomainIcon = (domain) => {
        switch(domain) {
            case 'personal': return <User size={20} />;
            case 'estrategico': return <Target size={20} />;
            case 'relacional': return <MessageSquare size={20} />;
            case 'multiplicador': return <Users size={20} />;
            case 'trascendente': return <Star size={20} />;
            case 'control': return <Shield size={20} />;
            default: return <CheckCircle size={20} />;
        }
    };

    return (
        <div className="liderazgo-test-container">
            {showResumeModal && (
                <div className="l-modal-overlay">
                    <div className="l-modal">
                        <h2>¡Tienes progreso guardado!</h2>
                        <p>Respondiste <strong>{Object.keys(answers).length}</strong> preguntas.</p>
                        <div className="l-modal-buttons">
                            <button className="l-btn-continue" onClick={() => setShowResumeModal(false)}>Continuar</button>
                            <button className="l-btn-restart" onClick={handleRestart}>Reiniciar</button>
                        </div>
                    </div>
                </div>
            )}
            
            {activeScreen && (
                <div className="l-progress-screen-overlay fade-in">
                    <div className="l-screen-modal">
                        <div className="l-screen-content">
                            <h2 className="l-screen-title">{activeScreen.title}</h2>
                            <p className="l-screen-text">{activeScreen.text}</p>
                            <button className="l-screen-btn" onClick={goToNext}>
                                {activeScreen.button} <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className={`l-test-container-inner ${activeScreen ? 'content-blur' : ''}`}>
                <header className="l-header">
                    <div className={`l-domain-label l-domain-${currentQuestion.domain}`}>
                        {getDomainIcon(currentQuestion.domain)}
                        <div className="l-domain-header-row">
                            <span className="l-domain-name">{currentDomain.name}</span>
                            <span className="l-domain-separator">|</span>
                            <span className="l-domain-subtext">{currentDomain.subtext}</span>
                        </div>
                    </div>
                    <div className="l-progress-info">
                        <span className="l-progress-count">{currentIndex + 1} / {liderazgoQuestions.length}</span>
                        <div className="l-progress-bar-bg">
                            <div 
                                className="l-progress-fill" 
                                style={{ 
                                    width: `${((currentIndex + 1) / liderazgoQuestions.length) * 100}%`
                                }}
                            ></div>
                        </div>
                    </div>
                </header>

                <main className={`l-question-card ${isChanging ? 'l-slide-out' : 'l-slide-in'}`}>
                    <div className="l-question-box">
                        <h2 className="l-question-text">{currentQuestion.text}</h2>
                    </div>
                    
                    <div className="l-speedometer-box">
                        <LiderazgoSpeedometer value={answers[currentQuestion.id] || 0} />
                    </div>
                        
                    <div className="l-options-grid">
                        {[1, 2, 3, 4, 5].map((val) => (
                            <button 
                                key={val}
                                className={`l-option-btn ${answers[currentQuestion.id] === val ? 'selected' : ''}`}
                                onClick={() => handleAnswer(val)}
                            >
                                <span className="l-val-num">{val}</span>
                                <span className="l-val-desc">
                                    {val === 1 ? 'Nunca' : 
                                     val === 2 ? 'Rara vez' : 
                                     val === 3 ? 'Algunas veces' : 
                                     val === 4 ? 'Frecuentemente' : 'Consistentemente'}
                                </span>
                            </button>
                        ))}
                    </div>
                </main>

                <footer className="l-footer">
                    <button 
                        className="l-nav-btn"
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                    >
                        <ChevronLeft size={18} /> Anterior
                    </button>
                    
                    <div className="l-keyboard-hint">
                        <span>Teclado: <strong>1-5</strong> para responder • <strong>Enter</strong> siguiente</span>
                    </div>
                    
                    <button 
                        className="l-nav-btn" 
                        onClick={() => {
                            if (answers[currentQuestion.id]) {
                                // Manually trigger next logic if answered
                                const nextIdx = currentIndex + 1;
                                if (nextIdx < liderazgoQuestions.length) {
                                    if (nextIdx % 10 === 0 && nextIdx !== 0 && nextIdx < 50) {
                                        setActiveScreen({
                                            title: `Has completado: ${currentDomain.name}`,
                                            text: "¡Buen trabajo! Sigamos con la siguiente dimensión.",
                                            button: "Continuar"
                                        });
                                    } else if (nextIdx === 50) {
                                        setActiveScreen({ title: "Fase de Control", text: "Últimas preguntas...", button: "Comenzar" });
                                    } else {
                                        setIsChanging(true);
                                        setTimeout(() => {
                                            setCurrentIndex(nextIdx);
                                            setIsChanging(false);
                                        }, 400);
                                    }
                                } else {
                                    handleFinish(answers);
                                }
                            }
                        }}
                        disabled={!answers[currentQuestion.id]}
                    >
                        Siguiente <ChevronRight size={18} />
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default LiderazgoTest;
