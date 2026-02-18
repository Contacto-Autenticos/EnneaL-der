import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { advancedQuestions, advancedOptions } from '../data/advancedQuestions';

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
        return <div className="test-container">Cargando análisis avanzado...</div>;
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
    const currentValue = answers[currentQuestion.id] || 0;

    return (
        <div className="test-page">
            <div className="test-banner">
                <img
                    src="/Eneagrama banner 03.png"
                    alt="Eneagrama Banner"
                    className="test-banner-img animate-fade-in"
                />
            </div>

            <div className="test-container">
                <div className="test-progress-bar-bg">
                    <div
                        className="test-progress-bar-fill"
                        style={{ width: `${((currentQuestionIndex) / totalQuestions) * 100}%` }}
                    />
                </div>

                <div
                    key={currentQuestionIndex}
                    className={`test-content-wrapper question-anim-${direction}`}
                >
                    <div className="test-question-header">
                        <p className="test-instruction-text">
                            Análisis Avanzado: Responde con honestidad.
                        </p>
                        <h3 className="test-question-text">
                            {currentQuestion.text}
                        </h3>
                    </div>

                    <div className="test-slider-wrapper">
                        <p style={{ fontSize: '0.9rem', color: '#555', fontStyle: 'italic', marginBottom: '25px', textAlign: 'center' }}>
                            Me describe:
                        </p>
                        <div className="test-slider-labels">
                            {sliderLabels.map((label, idx) => (
                                <span
                                    key={label}
                                    className={`test-slider-label ${answers[currentQuestion.id] === idx ? 'active' : ''}`}
                                    style={{ left: `${(idx / 3) * 100}%` }}
                                    onClick={() => handleAnswer(idx)}
                                >
                                    {label}
                                </span>
                            ))}
                        </div>
                        <div className="test-slider-track" onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const percent = x / rect.width;
                            const val = Math.min(3, Math.max(0, Math.round(percent * 3)));
                            handleAnswer(val);
                        }}>
                            <div className="test-slider-rail">
                                <div
                                    className="test-slider-track-fill"
                                    style={{ width: answers[currentQuestion.id] !== undefined ? `${(answers[currentQuestion.id] / 3) * 100}%` : '0%' }}
                                />
                            </div>
                            {[0, 1, 2, 3].map((val) => (
                                <div
                                    key={val}
                                    className={`test-slider-dot ${answers[currentQuestion.id] >= val ? 'filled' : ''} ${answers[currentQuestion.id] === val ? 'active' : ''}`}
                                    style={{ left: `${(val / 3) * 100}%` }}
                                    onClick={(e) => { e.stopPropagation(); handleAnswer(val); }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="test-bottom-nav">
                    <button
                        onClick={handlePrev}
                        disabled={currentQuestionIndex === 0}
                        className={`btn-nav ${currentQuestionIndex === 0 ? 'disabled' : ''}`}
                        aria-label="Anterior"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div className="test-dots-wrapper">
                        <div className="test-dots">
                            {filteredQuestions.map((_, idx) => (
                                <span
                                    key={idx}
                                    className={`test-dot ${idx <= currentQuestionIndex ? 'test-dot-active' : ''}`}
                                />
                            ))}
                        </div>
                        <span className="test-dots-counter">
                            {currentQuestionIndex + 1}/{totalQuestions}
                        </span>
                    </div>

                    <button
                        onClick={handleNext}
                        disabled={answers[currentQuestion.id] === undefined}
                        className={`btn-nav ${answers[currentQuestion.id] === undefined ? 'disabled' : ''}`}
                        aria-label="Siguiente"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>

                <div className="test-footer">
                    <img
                        src="/logo-azul.png"
                        alt="Logo Auténticos"
                        className="test-footer-logo"
                    />
                </div>
            </div>
        </div>
    );
};

export default AdvancedTest;
