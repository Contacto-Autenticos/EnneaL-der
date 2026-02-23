import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getEnneagramInfo } from '../utils/calculator';
import { questions, options } from '../data/questions';
import { X } from 'lucide-react';
import './DetailedResult.css';

const clarityMessages = {
    clear: "Según tus respuestas, este resultado refleja con gran probabilidad tu tipo de personalidad.",
    nuanced: "Con tus respuestas actuales no encontramos suficiente consistencia para identificar con claridad tu tipo de personalidad.",
    low: "Tus respuestas no muestran la consistencia suficiente para identificar con claridad tu tipo de personalidad.",
    tie: "Tus respuestas no muestran la consistencia suficiente para identificar con claridad tu tipo de personalidad.",
};

const clarityLabels = {
    clear: "Resultado claro",
    nuanced: "Resultado con matices",
    low: "Baja claridad",
    tie: "Empate técnico",
};

const ViewAnswersModal = ({ isOpen, onClose, answers }) => {
    if (!isOpen) return null;

    // Group questions by type and map answers
    const groupedQuestions = {
        'A': [], 'B': [], 'C': [],
        'X': [], 'Y': [], 'Z': []
    };

    questions.forEach(q => {
        if (groupedQuestions[q.type]) {
            const answerValue = answers && answers[q.id];
            // Use loose equality (==) to handle potential string/number mismatches
            const answerLabel = options.find(o => o.value == answerValue)?.label || "Sin responder";
            groupedQuestions[q.type].push({ ...q, answerLabel, answerValue });
        }
    });

    return (
        <div className="ennea-modal-overlay" onClick={onClose} style={{ zIndex: 10000 }}>
            <div className="ennea-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
                <button className="modal-close-btn" onClick={onClose}>
                    <X size={24} />
                </button>
                <h2 style={{ color: '#002d44', marginBottom: '20px', textAlign: 'center' }}>Tus Respuestas</h2>

                {['A', 'B', 'C', 'X', 'Y', 'Z'].map(type => (
                    <div key={type} style={{ marginBottom: '20px' }}>
                        <h3 style={{
                            background: '#f0f4f8',
                            padding: '8px',
                            borderRadius: '5px',
                            color: '#002d44',
                            marginBottom: '10px'
                        }}>
                            Grupo {type}
                        </h3>
                        {groupedQuestions[type].map(q => (
                            <div key={q.id} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                                <p style={{ fontSize: '0.9rem', marginBottom: '5px' }}>{q.text}</p>
                                <span style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 'bold',
                                    color: '#ddbe3d' // Force yellow for all answers
                                }}>
                                    {q.answerLabel}
                                </span>
                            </div>
                        ))}
                    </div>
                ))}
                <div className="ennea-modal-footer">
                    <button className="modal-btn-back" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

const DetailedResult = ({ result }) => {
    const navigate = useNavigate();
    const [isAnswersModalOpen, setIsAnswersModalOpen] = React.useState(false);

    if (!result) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                No hay resultados disponibles.{' '}
                <button onClick={() => navigate('/test')}>Realizar Test</button>
            </div>
        );
    }

    const { enneatypes, dominant, clarity, isVersatile } = result;
    const maxScore = 18; // Maximum possible score per enneatype

    return (
        <div className="detailed-result-page">
            <div className="detailed-result-container">
                {/* Header */}
                <div className="detailed-header">
                    <h1 className="detailed-title">Resultado Detallado</h1>
                    <h2 className="detailed-enneatype">
                        {result.clarityText}
                    </h2>
                </div>

                <div className="clarity-section">
                    <p className="clarity-message">
                        {clarityMessages[clarity]}
                    </p>
                    {clarity !== 'clear' && (
                        <p className="clarity-review-tip">
                            Te invitamos a revisarlas con calma y, si es posible, evitar elegir <strong>“Algo”</strong> o <strong>“Mucho”</strong>, para que el resultado refleje mejor quién eres.
                        </p>
                    )}
                </div>

                {/* Bar chart */}
                <div className="chart-section">
                    <h3 className="chart-title">Puntajes por eneatipo</h3>
                    <div className="chart-container">
                        {enneatypes.map((item, index) => {
                            const isTop3 = index < 3;
                            const barPercent = Math.max((item.score / maxScore) * 100, 4);
                            const info = getEnneagramInfo(item.type);

                            return (
                                <div
                                    key={item.type}
                                    className={`chart-row ${isTop3 ? 'chart-row-highlight' : ''}`}
                                >
                                    <div className="chart-label">
                                        <span className="chart-type-number">Tipo {item.type}</span>
                                        <span className="chart-type-name">{info.name}</span>
                                    </div>
                                    <div className="chart-bar-container">
                                        <div
                                            className={`chart-bar ${isTop3 ? 'chart-bar-top' : 'chart-bar-normal'}`}
                                            style={{ width: `${barPercent}%` }}
                                        />
                                    </div>
                                    <div className="chart-score">
                                        {item.score}pts
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                    <button
                        onClick={() => setIsAnswersModalOpen(true)}
                        style={{
                            background: 'transparent',
                            border: '1px solid #002d44',
                            borderRadius: '20px',
                            padding: '8px 20px',
                            color: '#002d44',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                        }}
                    >
                        Ver respuestas
                    </button>
                </div>

                {/* Footer note */}
                <p className="detailed-footer-text">
                    Este resultado no busca encasillarte, sino ofrecerte un punto de partida para la reflexión. El autoconocimiento es un proceso, no una etiqueta.
                </p>


                {/* Actions */}
                <div className="result-actions">
                    <button
                        onClick={() => navigate('/result')}
                        className="btn-action btn-secondary-transparent"
                    >
                        <ArrowLeft size={18} /> Regresar
                    </button>


                </div>

                {/* Brand footer */}
                <div className="detailed-brand-footer">
                    <img
                        src="/logo-azul.png"
                        alt="Logo Auténticos"
                        className="register-footer-logo"
                    />
                </div>

                <ViewAnswersModal
                    isOpen={isAnswersModalOpen}
                    onClose={() => setIsAnswersModalOpen(false)}
                    answers={result.answers}
                />
            </div>
        </div>
    );
};

export default DetailedResult;
