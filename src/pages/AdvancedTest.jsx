import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { advancedQuestions, advancedOptions } from '../data/advancedQuestions';
import './AdvancedTest.css';

const AdvancedTest = ({ topTypes, onComplete, fullTest = false }) => {
    // Filter and shuffle questions
    const filteredQuestions = useMemo(() => {
        // If fullTest is active, use ALL advanced questions
        if (fullTest) {
            const shuffled = [...advancedQuestions];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        }

        if (!topTypes || topTypes.length === 0) return [];

        // Filter questions belonging to the top types
        const relevant = advancedQuestions.filter(q => topTypes.includes(q.enneatype));

        // Shuffle them
        const shuffled = [...relevant];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }, [topTypes, fullTest]);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [direction, setDirection] = useState('next');
    const navigate = useNavigate();

    const currentQuestion = filteredQuestions[currentQuestionIndex];
    const totalQuestions = filteredQuestions.length;

    if (totalQuestions === 0) {
        return <div className="advanced-test-page"><div className="adv-test-container">Cargando análisis avanzado...</div></div>;
    }

    const handleAnswer = (value) => {
        const newAnswers = { ...answers, [currentQuestion.id]: value };
        setAnswers(newAnswers);

        // Auto-advance after a short delay
        setTimeout(() => {
            if (currentQuestionIndex < totalQuestions - 1) {
                setDirection('next');
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                onComplete(newAnswers);
                navigate('/advanced-analysis-result');
            }
        }, 150);
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setDirection('prev');
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleNext = () => {
        if (answers[currentQuestion.id] !== undefined) {
            if (currentQuestionIndex < totalQuestions - 1) {
                setDirection('next');
                setCurrentQuestionIndex(currentQuestionIndex + 1);
            } else {
                onComplete(answers);
                navigate('/advanced-analysis-result');
            }
        }
    };

    const sliderLabels = ["Muy poco", "Algo", "Mucho", "Totalmente"];

    return (
        <div className="advanced-test-page">
            {/* Header Banner */}
            <div className="test-banner" style={{ width: '100%', maxWidth: '750px', margin: '0 auto', flexShrink: 0 }}>
                <img
                    src="/Eneagrama banner 02.png"
                    alt="Eneagrama Banner"
                    className="test-banner-img animate-fade-in"
                />
            </div>

            <div className="adv-test-container">
                <div className="adv-test-progress-bar-bg">
                    <div
                        className="adv-test-progress-bar-fill"
                        style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                    />
                </div>

                <div
                    key={currentQuestionIndex}
                    className={`adv-test-content-wrapper question-anim-${direction}`}
                >
                    <div className="adv-test-question-header">
                        <p className="adv-test-instruction-text">
                            Análisis Avanzado: Responde con honestidad espontánea.
                        </p>
                        <h3 className="adv-test-question-text">
                            {currentQuestion.text}
                        </h3>
                    </div>

                    <div className="adv-test-slider-wrapper">
                        <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', marginBottom: '30px', textAlign: 'center' }}>
                            Me describe:
                        </p>
                        <div className="adv-test-slider-labels">
                            {sliderLabels.map((label, idx) => (
                                <span
                                    key={label}
                                    className={`adv-test-slider-label ${answers[currentQuestion.id] === idx ? 'active' : ''}`}
                                    style={{ left: `${(idx / 3) * 100}%` }}
                                    onClick={() => handleAnswer(idx)}
                                >
                                    {label}
                                </span>
                            ))}
                        </div>
                        <div className="adv-test-slider-track" onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const percent = x / rect.width;
                            const val = Math.min(3, Math.max(0, Math.round(percent * 3)));
                            handleAnswer(val);
                        }}>
                            <div className="adv-test-slider-rail">
                                <div
                                    className="adv-test-slider-track-fill"
                                    style={{ width: answers[currentQuestion.id] !== undefined ? `${(answers[currentQuestion.id] / 3) * 100}%` : '0%' }}
                                />
                            </div>
                            {[0, 1, 2, 3].map((val) => (
                                <div
                                    key={val}
                                    className={`adv-test-slider-dot ${answers[currentQuestion.id] >= val ? 'filled' : ''} ${answers[currentQuestion.id] === val ? 'active' : ''}`}
                                    style={{ left: `${(val / 3) * 100}%` }}
                                    onClick={(e) => { e.stopPropagation(); handleAnswer(val); }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="adv-test-bottom-nav">
                    <button
                        onClick={handlePrev}
                        disabled={currentQuestionIndex === 0}
                        className={`adv-btn-nav ${currentQuestionIndex === 0 ? 'disabled' : ''}`}
                        aria-label="Anterior"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div className="adv-test-dots-wrapper">
                        {totalQuestions <= 45 && (
                            <div className="adv-test-dots">
                                {filteredQuestions.map((_, idx) => (
                                    <span
                                        key={idx}
                                        className={`adv-test-dot ${idx <= currentQuestionIndex ? 'adv-test-dot-active' : ''}`}
                                    />
                                ))}
                            </div>
                        )}
                        <span className="adv-test-dots-counter">
                            <span style={{ color: '#ddbe3d' }}>{currentQuestionIndex + 1}</span>/{totalQuestions}
                        </span>
                    </div>

                    <button
                        onClick={handleNext}
                        disabled={answers[currentQuestion.id] === undefined}
                        className={`adv-btn-nav ${answers[currentQuestion.id] === undefined ? 'disabled' : ''}`}
                        aria-label="Siguiente"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
                <div className="adv-test-footer">
                    <img
                        src="/Logo-Blanco.png"
                        alt="Logo Auténticos Blanco"
                        className="adv-test-footer-logo"
                    />
                </div>
            </div>
        </div>
    );
};

export default AdvancedTest;
