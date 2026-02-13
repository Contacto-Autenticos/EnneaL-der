import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { getEnneagramInfo } from '../utils/calculator';

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

const DetailedResult = ({ result }) => {
    const navigate = useNavigate();

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

                {/* Footer note */}
                <p className="detailed-footer-text">
                    Este resultado no busca encasillarte, sino ofrecerte un punto de partida para la reflexión. El autoconocimiento es un proceso, no una etiqueta.
                </p>

                {/* Actions */}
                <div className="result-actions">
                    <button
                        onClick={() => navigate('/result')}
                        className="btn-action btn-share"
                    >
                        <ArrowLeft size={18} /> Regresar
                    </button>

                    <button
                        onClick={() => navigate('/register')}
                        className="btn-action"
                    >
                        Profundizar más <ExternalLink size={18} />
                    </button>
                </div>

                {/* Brand footer */}
                <div className="detailed-brand-footer">
                    <img
                        src="/Auténticos - Logo Azul-OP2.png"
                        alt="Logo Auténticos"
                        className="register-footer-logo"
                    />
                </div>
            </div>
        </div>
    );
};

export default DetailedResult;
