import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { questions, options } from '../data/questions';
import { supabase } from '../supabaseClient';
import { calculateResults } from '../utils/calculator';

const Test = ({ onComplete }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const navigate = useNavigate();

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / questions.length) * 100;

    const handleAnswer = async (value) => {
        const newAnswers = { ...answers, [currentQuestion.id]: value };
        setAnswers(newAnswers);

        if (currentQuestionIndex < questions.length - 1) {
            setTimeout(() => setCurrentQuestionIndex(currentQuestionIndex + 1), 300);
        } else {
            // Calculate result locally and save
            const result = calculateResults(newAnswers);
            onComplete(newAnswers); // Updates local app state

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase.from('results').insert([{
                        user_id: user.id,
                        enneatype: result.enneatype,
                        scores: result.scores,
                        status: result.isAmbiguous ? 'ambiguous' : 'clear' // heuristic mapping
                    }]);
                }
            } catch (err) {
                console.error("Error saving result:", err);
            }

            navigate('/result');
        }
    };

    return (

        <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
            {/* Header Banner - Full Width */}
            <div style={{ width: '100%', maxHeight: '180px', overflow: 'hidden' }}>
                <img
                    src="/Eneagrama banner 02.png"
                    alt="Eneagrama Banner"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center'
                    }}
                />
            </div>

            <div className="container" style={{
                justifyContent: 'flex-start',
                maxWidth: '700px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: 'auto',
                flex: 1,
                padding: '10px 20px'
            }}>
                {/* Progress Bar */}
                <div style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: '#eee',
                    borderRadius: '3px',
                    marginBottom: '15px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        backgroundColor: 'var(--color-primary)',
                        transition: 'width 0.3s ease'
                    }} />
                </div>

                <div style={{ marginBottom: '10px', minHeight: '80px' }}>
                    <span style={{
                        color: '#999',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontWeight: 500
                    }}>
                        Pregunta {currentQuestionIndex + 1} de {questions.length}
                    </span>
                    <h3 style={{
                        fontSize: '1.1rem',
                        marginTop: '5px',
                        lineHeight: '1.2'
                    }}>
                        {currentQuestion.text}
                    </h3>

                    <p style={{ fontSize: '0.9rem', color: '#555', fontStyle: 'italic', marginTop: '5px' }}>
                        Me describe:
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', alignItems: 'center' }}>
                    {options.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleAnswer(option.value)}
                            className="option-card"
                            style={{
                                padding: '10px 20px',
                                fontSize: '1rem',
                                width: '100%',
                                maxWidth: '250px',
                                justifyContent: 'center',
                                textAlign: 'center'
                            }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
                {/* Footer Logo */}
                <div style={{ marginTop: 'auto', marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
                    <img
                        src="/logo-autenticos-azul.png"
                        alt="Logo Auténticos"
                        style={{ maxHeight: '35px', opacity: 0.8 }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Test;
