import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { questions, options } from '../data/questions';
import { calculateResults } from '../utils/calculator';
import { supabase } from '../supabaseClient';

// Generate or retrieve an anonymous session ID (one per browser session)
function getSessionId() {
    let id = sessionStorage.getItem('anon_session_id');
    if (!id) {
        id = crypto.randomUUID();
        sessionStorage.setItem('anon_session_id', id);
    }
    return id;
}

const ANSWER_LABELS = { 1: 'Muy poco', 2: 'Algo', 3: 'Mucho', 4: 'Totalmente' };

async function saveAnonymousResponses(answers) {
    const session_id = getSessionId();
    const rows = Object.entries(answers).map(([question_id, answer]) => ({
        session_id,
        question_id: parseInt(question_id),
        answer: ANSWER_LABELS[answer] ?? answer,
    }));
    const { error } = await supabase.from('basic_test_responses').insert(rows);
    if (error) {
        console.error('Error saving anonymous responses:', error);
    }
}

const Test = ({ onComplete }) => {
    const [shuffledQuestions] = useState(() => {
        // Separate standard Likert questions from special questions
        const standardQs = questions.filter(q => q.type !== 'special');
        const specialQs = questions.filter(q => q.type === 'special');
        // Shuffle only the standard questions
        for (let i = standardQs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [standardQs[i], standardQs[j]] = [standardQs[j], standardQs[i]];
        }
        // Special questions always go at the end, in order
        return [...standardQs, ...specialQs];
    });

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [direction, setDirection] = useState('next');
    const navigate = useNavigate();

    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    const totalQuestions = shuffledQuestions.length;
    const isSpecialQuestion = currentQuestion.type === 'special';

    const handleAnswer = (value) => {
        const newAnswers = { ...answers, [currentQuestion.id]: value };
        setAnswers(newAnswers);

        // Auto-advance after a short delay
        setTimeout(async () => {
            if (currentQuestionIndex < totalQuestions - 1) {
                setDirection('next');
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                await saveAnonymousResponses(newAnswers); // await so insert completes before navigating
                onComplete(newAnswers);
                navigate('/result');
            }
        }, 150);
    };

    const handleSliderChange = (e) => {
        const value = parseInt(e.target.value);
        setAnswers({ ...answers, [currentQuestion.id]: value });
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setDirection('prev');
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleNext = async () => {
        if (answers[currentQuestion.id]) {
            if (currentQuestionIndex < totalQuestions - 1) {
                setDirection('next');
                setCurrentQuestionIndex(currentQuestionIndex + 1);
            } else {
                await saveAnonymousResponses(answers); // await so insert completes before navigating
                onComplete(answers);
                navigate('/result');
            }
        }
    };

    const sliderLabels = ["Muy poco", "Algo", "Mucho", "Totalmente"];
    const currentValue = answers[currentQuestion.id] || 0;

    return (
        <div className="test-page">
            {/* Header Banner */}
            <div className="test-banner">
                <img
                    src="/Eneagrama banner 03.png"
                    alt="Eneagrama Banner"
                    className="test-banner-img animate-fade-in"
                />
            </div>

            <div className="test-container">
                {/* Top Progress Bar */}
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
                    {/* Question Header */}
                    <div className="test-question-header">
                        <p className="test-instruction-text">
                            {isSpecialQuestion ? 'Selecciona la opción que mejor te describe.' : 'Responde con honestidad espontánea.'}
                        </p>
                        <h3 className="test-question-text">
                            {currentQuestion.text}
                        </h3>
                    </div>

                    {isSpecialQuestion ? (
                        /* Special Question: Multiple Choice Buttons */
                        <div className="test-special-options">
                            {currentQuestion.options.map((opt) => (
                                <button
                                    key={opt.value}
                                    className={`test-special-option-btn ${currentValue === opt.value ? 'selected' : ''}`}
                                    onClick={() => handleAnswer(opt.value)}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    ) : (
                        /* Standard Question: Slider */
                        <div className="test-slider-wrapper">
                            <p style={{ fontSize: '0.9rem', color: '#555', fontStyle: 'italic', marginBottom: '25px', textAlign: 'center' }}>
                                Me describe:
                            </p>
                            <div className="test-slider-labels">
                                {sliderLabels.map((label, idx) => (
                                    <span
                                        key={label}
                                        className={`test-slider-label ${currentValue === idx + 1 ? 'active' : ''}`}
                                        style={{ left: `${(idx / 3) * 100}%` }}
                                        onClick={() => handleAnswer(idx + 1)}
                                    >
                                        {label}
                                    </span>
                                ))}
                            </div>
                            <div className="test-slider-track" onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const percent = x / rect.width;
                                const val = Math.min(4, Math.max(1, Math.round(percent * 3 + 1)));
                                handleAnswer(val);
                            }}>
                                <div className="test-slider-rail">
                                    <div
                                        className="test-slider-track-fill"
                                        style={{ width: currentValue ? `${((currentValue - 1) / 3) * 100}%` : '0%' }}
                                    />
                                </div>
                                {[1, 2, 3, 4].map((val) => (
                                    <div
                                        key={val}
                                        className={`test-slider-dot ${currentValue >= val ? 'filled' : ''} ${currentValue === val ? 'active' : ''}`}
                                        style={{ left: `${((val - 1) / 3) * 100}%` }}
                                        onClick={(e) => { e.stopPropagation(); handleAnswer(val); }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Navigation: Arrows + Dots */}
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
                            {shuffledQuestions.map((_, idx) => (
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
                        disabled={!answers[currentQuestion.id]}
                        className={`btn-nav ${!answers[currentQuestion.id] ? 'disabled' : ''}`}
                        aria-label="Siguiente"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>

                {/* Footer Logo */}
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

export default Test;
