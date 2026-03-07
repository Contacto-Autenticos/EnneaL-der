import React, { useState, useRef } from 'react';
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

async function saveAnonymousResponses(answers, allQuestions) {
    const session_id = getSessionId();
    const rows = Object.entries(answers).map(([question_id, answer]) => {
        const id = parseInt(question_id);
        const question = allQuestions.find(q => q.id === id);
        const isSpecial = question?.type === 'special';

        return {
            session_id,
            question_id: id,
            answer: isSpecial ? answer : (ANSWER_LABELS[answer] ?? answer),
        };
    });
    const { error } = await supabase.from('basic_test_responses').insert(rows);
    if (error) {
        console.error('Error saving anonymous responses:', error);
    }
}

const Test = ({ onComplete }) => {
    const [shuffledQuestions, setShuffledQuestions] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(true);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const isSavingRef = useRef(false);
    const [direction, setDirection] = useState('next');
    const navigate = useNavigate();

    React.useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const { data, error } = await supabase
                    .from('questions')
                    .select('*')
                    .order('id', { ascending: true });

                if (error) throw error;

                // Merge with local questions to ensure 19 and 20 are present
                let combinedData = [...data];
                const specialIds = [19, 20];
                specialIds.forEach(id => {
                    if (!combinedData.find(q => q.id === id)) {
                        const localQ = questions.find(q => q.id === id);
                        if (localQ) combinedData.push(localQ);
                    }
                });

                const standardQs = combinedData.filter(q => q.type !== 'special');
                const specialQs = combinedData.filter(q => q.type === 'special');

                // Shuffle standard questions
                for (let i = standardQs.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [standardQs[i], standardQs[j]] = [standardQs[j], standardQs[i]];
                }

                setShuffledQuestions([...standardQs, ...specialQs]);
            } catch (err) {
                console.error('Error fetching questions from Supabase, using fallback:', err);
                const standardQs = questions.filter(q => q.type !== 'special');
                const specialQs = questions.filter(q => q.type === 'special');
                for (let i = standardQs.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [standardQs[i], standardQs[j]] = [standardQs[j], standardQs[i]];
                }
                setShuffledQuestions([...standardQs, ...specialQs]);
            } finally {
                setLoadingQuestions(false);
            }
        };

        fetchQuestions();
    }, []);

    const currentQuestion = shuffledQuestions[currentQuestionIndex];

    if (loadingQuestions || !currentQuestion) {
        return (
            <div className="test-page">
                <div className="test-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#b89b2d' }}>
                    <p>Iniciando Test...</p>
                </div>
            </div>
        );
    }

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
                if (isSavingRef.current) return;
                isSavingRef.current = true;
                await saveAnonymousResponses(newAnswers, shuffledQuestions);
                onComplete(newAnswers, shuffledQuestions);
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
                if (isSavingRef.current) return;
                isSavingRef.current = true;
                await saveAnonymousResponses(answers, shuffledQuestions);
                onComplete(answers, shuffledQuestions);
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
                        /* Standard Question: Vertical Selection */
                        <div className="test-vertical-wrapper">
                            <p style={{ fontSize: '1.1rem', color: '#555', fontStyle: 'italic', marginBottom: '25px', textAlign: 'center' }}>
                                ¿En qué medida te describe?
                            </p>
                            <div className="test-vertical-options">
                                {[
                                    { value: 4, label: "Totalmente", width: "100%" },
                                    { value: 3, label: "Mucho", width: "75%" },
                                    { value: 2, label: "Algo", width: "50%" },
                                    { value: 1, label: "Muy poco", width: "25%" }
                                ].map((opt) => (
                                    <div
                                        key={opt.value}
                                        className={`test-vertical-option ${currentValue === opt.value ? 'active' : ''}`}
                                        onClick={() => handleAnswer(opt.value)}
                                    >
                                        <div className="test-vertical-label">{opt.label}</div>
                                        <div className="test-vertical-bar-container">
                                            <div
                                                className="test-vertical-bar"
                                                style={{ width: opt.width }}
                                            />
                                        </div>
                                    </div>
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
                        <p className="test-progress-label">Progreso</p>
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
