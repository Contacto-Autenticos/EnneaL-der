import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { questions, options } from '../data/questions';

import { calculateResults } from '../utils/calculator';

const Test = ({ onComplete }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const navigate = useNavigate();

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / questions.length) * 100;

    const handleAnswer = (value) => {
        const newAnswers = { ...answers, [currentQuestion.id]: value };
        setAnswers(newAnswers);

        if (currentQuestionIndex < questions.length - 1) {
            setTimeout(() => setCurrentQuestionIndex(currentQuestionIndex + 1), 300);
        } else {
            // Calculate result locally and save
            // const result = calculateResults(newAnswers); // Done in App.jsx via onComplete
            onComplete(newAnswers); // Updates local app state
            navigate('/result');
        }
    };

    return (

        <div className="test-page">
            {/* Header Banner - Full Width */}
            <div className="test-banner">
                <img
                    src="/Eneagrama banner 02.png"
                    alt="Eneagrama Banner"
                    className="test-banner-img animate-fade-in"
                />
            </div>

            <div className="test-container">
                {/* Progress Bar */}
                <div className="test-progress-bar-bg">
                    <div
                        className="test-progress-bar-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="test-question-header">
                    <span className="test-question-count">
                        Pregunta {currentQuestionIndex + 1} de {questions.length}
                    </span>
                    <h3 className="test-question-text">
                        {currentQuestion.text}
                    </h3>

                    <p style={{ fontSize: '0.9rem', color: '#555', fontStyle: 'italic', marginTop: '5px' }}>
                        Me describe:
                    </p>
                </div>

                <div className="test-options-container">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleAnswer(option.value)}
                            className="option-card test-btn-option"
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
                {/* Footer Logo */}
                <div className="test-footer">
                    <img
                        src="/logo-autenticos-azul.png"
                        alt="Logo Auténticos"
                        className="test-footer-logo"
                    />
                </div>
            </div>
        </div>
    );
};

export default Test;
