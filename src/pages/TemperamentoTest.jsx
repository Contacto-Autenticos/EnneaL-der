import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './LiderazgoTest.css'; // Reusing existing test styles

const temperamentQuestions = [
    {
        id: 1,
        text: 'Cuando llegas a un grupo nuevo, naturalmente tiendes a:',
        options: [
            { value: 'A', label: 'Conversar, conectar y romper el hielo.' },
            { value: 'B', label: 'Observar, escuchar y entrar poco a poco.' },
            { value: 'C', label: 'Entender qué hay que lograr.' },
            { value: 'D', label: 'Identificar cómo se debe organizar todo.' }
        ]
    },
    {
        id: 2,
        text: 'En un proyecto, te preocupa más:',
        options: [
            { value: 'A', label: 'Que las personas estén motivadas y conectadas.' },
            { value: 'B', label: 'Que haya armonía y buen ambiente.' },
            { value: 'C', label: 'Que se logren los resultados.' },
            { value: 'D', label: 'Que el proceso esté bien hecho y no haya errores.' }
        ]
    },
    {
        id: 3,
        text: 'Bajo presión, sueles:',
        options: [
            { value: 'A', label: 'Hablar más, moverte rápido y buscar apoyo.' },
            { value: 'B', label: 'Guardar calma, evitar conflicto y esperar.' },
            { value: 'C', label: 'Tomar el control y empujar la decisión.' },
            { value: 'D', label: 'Analizar, revisar detalles y preocuparte por hacerlo bien.' }
        ]
    },
    {
        id: 4,
        text: '¿Qué te molesta más?',
        options: [
            { value: 'A', label: 'La rutina, el aburrimiento o la falta de emoción.' },
            { value: 'B', label: 'El conflicto, la presión o la tensión innecesaria.' },
            { value: 'C', label: 'La lentitud, la indecisión o la falta de acción.' },
            { value: 'D', label: 'La improvisación, el desorden o la superficialidad.' }
        ]
    },
    {
        id: 5,
        text: 'Cuando comunicas una idea, normalmente:',
        options: [
            { value: 'A', label: 'La cuentas con entusiasmo y expresividad.' },
            { value: 'B', label: 'La dices con calma y prudencia.' },
            { value: 'C', label: 'Vas directo al punto y buscas impacto.' },
            { value: 'D', label: 'La explicas con profundidad, orden y detalle.' }
        ]
    },
    {
        id: 6,
        text: 'En una decisión importante, tiendes a priorizar:',
        options: [
            { value: 'A', label: 'Lo que entusiasma, conecta o genera posibilidades.' },
            { value: 'B', label: 'Lo que conserva la paz y evita problemas.' },
            { value: 'C', label: 'Lo que permite avanzar y conseguir el objetivo.' },
            { value: 'D', label: 'Lo que tiene más sentido, coherencia y precisión.' }
        ]
    },
    {
        id: 7,
        text: 'Las personas suelen decir que eres más:',
        options: [
            { value: 'A', label: 'Alegre, espontáneo y sociable.' },
            { value: 'B', label: 'Tranquilo, paciente y conciliador.' },
            { value: 'C', label: 'Fuerte, decidido y directo.' },
            { value: 'D', label: 'Profundo, sensible y analítico.' }
        ]
    },
    {
        id: 8,
        text: 'Cuando algo no sale como esperabas, normalmente tiendes a:',
        options: [
            { value: 'A', label: 'Buscar otra opción rápidamente y recuperar el ánimo.' },
            { value: 'B', label: 'Mantener la calma, adaptarte y no hacer demasiado ruido.' },
            { value: 'C', label: 'Presionar, corregir y hacer que las cosas avancen.' },
            { value: 'D', label: 'Revisar qué falló, analizarlo y pensar cómo evitar que vuelva a pasar.' }
        ]
    },
    {
        id: 9,
        text: 'En un equipo, naturalmente aportas más desde:',
        options: [
            { value: 'A', label: 'La energía, la motivación y la capacidad de conectar personas.' },
            { value: 'B', label: 'La serenidad, la escucha y la capacidad de mantener la armonía.' },
            { value: 'C', label: 'La dirección, la decisión y la capacidad de mover al equipo hacia el resultado.' },
            { value: 'D', label: 'La profundidad, el criterio y la capacidad de cuidar la calidad del trabajo.' }
        ]
    }
];

const tieBreakerQuestion = {
    id: 10,
    text: 'Para desempatar: Si tuvieras que elegir una sola frase que te defina en tu esencia, ¿cuál sería?',
    options: [
        { value: 'A', label: 'Disfruto el momento, conecto con la gente y me motiva la novedad.' },
        { value: 'B', label: 'Busco la paz, evito los problemas y valoro la estabilidad.' },
        { value: 'C', label: 'Tomo el control, voy directo a la meta y me motivan los retos.' },
        { value: 'D', label: 'Analizo a profundidad, busco la perfección y valoro el orden.' }
    ]
};

const TemperamentoTest = () => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [direction, setDirection] = useState('next');
    const [tiedTypes, setTiedTypes] = useState(null);
    const isSavingRef = useRef(false);
    const navigate = useNavigate();

    const currentQuestion = tiedTypes ? tieBreakerQuestion : temperamentQuestions[currentQuestionIndex];
    const totalQuestions = temperamentQuestions.length;

    const checkTieAndCalculate = (finalAnswers) => {
        const counts = { A: 0, B: 0, C: 0, D: 0 };
        // Only count the first 9 questions for the initial calculation
        Object.entries(finalAnswers).forEach(([qId, ans]) => {
            if (qId !== '10' && counts[ans] !== undefined) counts[ans]++;
        });
        
        let maxCount = 0;
        
        Object.values(counts).forEach(count => {
            if (count > maxCount) maxCount = count;
        });

        const topTypes = Object.keys(counts).filter(type => counts[type] === maxCount);
        return topTypes;
    };

        const types = {
            'A': 'Sanguíneo',
            'B': 'Flemático',
            'C': 'Colérico',
            'D': 'Melancólico'
        };

    const getFinalResultName = (typeCode) => {
        return types[typeCode];
    };

    const handleAnswer = (value) => {
        const newAnswers = { ...answers, [currentQuestion.id]: value };
        setAnswers(newAnswers);

        setTimeout(() => {
            if (tiedTypes) {
                // If we are answering the tie breaker
                if (isSavingRef.current) return;
                isSavingRef.current = true;
                const result = getFinalResultName(value);
                localStorage.setItem('temperamentResult', result);
                navigate('/test-temperamento-resultado');
            } else if (currentQuestionIndex < totalQuestions - 1) {
                setDirection('next');
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                // Finished question 9, check for tie
                const topTypes = checkTieAndCalculate(newAnswers);
                if (topTypes.length > 1) {
                    setTiedTypes(topTypes);
                    setDirection('next');
                } else {
                    if (isSavingRef.current) return;
                    isSavingRef.current = true;
                    const result = getFinalResultName(topTypes[0]);
                    localStorage.setItem('temperamentResult', result);
                    navigate('/test-temperamento-resultado');
                }
            }
        }, 300);
    };

    const handlePrev = () => {
        if (tiedTypes) {
            setTiedTypes(null);
            setDirection('prev');
        } else if (currentQuestionIndex > 0) {
            setDirection('prev');
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleNext = () => {
        if (answers[currentQuestion.id]) {
            if (tiedTypes) {
                if (isSavingRef.current) return;
                isSavingRef.current = true;
                const result = getFinalResultName(answers[10]);
                localStorage.setItem('temperamentResult', result);
                navigate('/test-temperamento-resultado');
            } else if (currentQuestionIndex < totalQuestions - 1) {
                setDirection('next');
                setCurrentQuestionIndex(currentQuestionIndex + 1);
            } else {
                const topTypes = checkTieAndCalculate(answers);
                if (topTypes.length > 1) {
                    setTiedTypes(topTypes);
                    setDirection('next');
                } else {
                    if (isSavingRef.current) return;
                    isSavingRef.current = true;
                    const result = getFinalResultName(topTypes[0]);
                    localStorage.setItem('temperamentResult', result);
                    navigate('/test-temperamento-resultado');
                }
            }
        }
    };

    const currentValue = answers[currentQuestion.id] || null;

    return (
        <div className="test-page temperamento-page">
            <style>
                {`
                @media (min-width: 768px) {
                    .temperamento-page {
                        background-color: #eef2f6;
                        min-height: 100vh;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        padding: 40px 20px;
                    }
                    .temperamento-page .test-container {
                        background-color: #ffffff;
                        border-radius: 16px;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                        padding: 30px;
                        max-width: 800px;
                        margin: 0 auto;
                        display: flex;
                        flex-direction: column;
                        overflow-x: hidden;
                        overflow-y: visible;
                    }
                }
                `}
            </style>
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
                            Selecciona la opción que mejor te describe.
                        </p>
                        <h3 className="test-question-text">
                            {currentQuestion.text}
                        </h3>
                    </div>

                    <div className="test-special-options" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px', flex: 1, justifyContent: 'center' }}>
                        {currentQuestion.options.map((opt) => {
                            if (tiedTypes && !tiedTypes.includes(opt.value)) return null;
                            return (
                            <button
                                key={opt.value}
                                className={`test-special-option-btn ${currentValue === opt.value ? 'selected' : ''}`}
                                onClick={() => handleAnswer(opt.value)}
                                style={{
                                    padding: '15px 20px',
                                    borderRadius: '12px',
                                    border: '2px solid',
                                    borderColor: currentValue === opt.value ? '#ddbe3d' : 'rgba(0, 0, 0, 0.1)',
                                    background: currentValue === opt.value ? 'rgba(221, 190, 61, 0.1)' : '#fff',
                                    textAlign: 'left',
                                    fontSize: '1.1rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {opt.label}
                            </button>
                            );
                        })}
                    </div>
                </div>

                <div className="test-bottom-nav">
                    <button
                        onClick={handlePrev}
                        disabled={currentQuestionIndex === 0 && !tiedTypes}
                        className={`btn-nav ${currentQuestionIndex === 0 && !tiedTypes ? 'disabled' : ''}`}
                        aria-label="Anterior"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div className="test-dots-wrapper">
                        <p className="test-progress-label">{tiedTypes ? 'Desempate' : 'Progreso'}</p>
                        <div className="test-dots">
                            {!tiedTypes && temperamentQuestions.map((_, idx) => (
                                <span
                                    key={idx}
                                    className={`test-dot ${idx <= currentQuestionIndex ? 'test-dot-active' : ''}`}
                                />
                            ))}
                            {tiedTypes && (
                                <span className="test-dot test-dot-active" style={{ width: '100%' }} />
                            )}
                        </div>
                        <span className="test-dots-counter">
                            {tiedTypes ? 'Extra' : `${currentQuestionIndex + 1}/${totalQuestions}`}
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

export default TemperamentoTest;
