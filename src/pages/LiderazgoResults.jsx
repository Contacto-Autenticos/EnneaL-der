import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Download, RefreshCw, ChevronRight, 
    Award, AlertTriangle, Lightbulb, ClipboardList,
    Quote
} from 'lucide-react';
import { calculateLiderazgoResults, getRecommendations } from '../utils/liderazgoUtils';
import LiderazgoSpeedometer from '../components/LiderazgoSpeedometer';
import LiderazgoRadarChart from '../components/LiderazgoRadarChart';
import './LiderazgoResults.css';

const LiderazgoResults = () => {
    const navigate = useNavigate();
    
    const results = useMemo(() => {
        const saved = localStorage.getItem('liderazgo_results');
        if (saved) {
            try {
                return calculateLiderazgoResults(JSON.parse(saved));
            } catch (e) {
                console.error("Error parsing results", e);
                return null;
            }
        }
        return null;
    }, []);

    if (!results) {
        return (
            <div className="lr-error-container">
                <div className="lr-error-card">
                    <h2>No se encontraron resultados</h2>
                    <p>Por favor, completa el test para ver tu reporte detallado.</p>
                    <button className="lr-btn-primary" onClick={() => navigate('/liderazgo-test')}>
                        Ir al Test <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        );
    }

    const recommendations = getRecommendations(results);
    const overallValue = Math.round((results.totalScore / 275) * 5);

    return (
        <div className="liderazgo-results-page">
            <header className="lr-header">
                <div className="lr-header-content">
                    <span className="lr-brand">AUTÉNTICOS</span>
                    <h1>Tu Reporte de Liderazgo</h1>
                    <p className="lr-subtitle">Análisis profundo de competencias para el Liderazgo Extraordinario</p>
                </div>
            </header>

            <main className="lr-main">
                {/* 1. Perfil General */}
                <section className="lr-section lr-profile-hero">
                    <div className="lr-score-card">
                        <div className="lr-speed-container">
                            <LiderazgoSpeedometer value={overallValue} showLabels={false} showInfo={false} />
                            <div className="lr-total-pts">
                                <span className="pts-val">{results.totalScore}</span>
                                <span className="pts-label">PUNTOS TOTALES</span>
                            </div>
                        </div>
                        <div className="lr-level-info">
                            <span className="lr-badge">Nivel General</span>
                            <h2 className="lr-level-title">{results.level.label}</h2>
                            <p className="lr-level-desc">{results.level.desc}</p>
                        </div>
                    </div>
                </section>

                {/* 2. Radar Chart */}
                <section className="lr-section">
                    <h3 className="lr-section-title">Análisis por Dimensión</h3>
                    <LiderazgoRadarChart dimensions={results.allDimensions} />
                </section>

                <div className="lr-grid-2col">
                    {/* 3. Fortalezas */}
                    <section className="lr-section lr-card-dark">
                        <div className="lr-card-header">
                            <Award className="lr-icon-gold" />
                            <h3>Top 3 Fortalezas</h3>
                        </div>
                        <ul className="lr-list">
                            {results.topStrengths.map(s => (
                                <li key={s.id}>
                                    <strong>{s.name}:</strong> {s.subtext}
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* 4. Riesgos */}
                    <section className="lr-section lr-card-risk">
                        <div className="lr-card-header">
                            <AlertTriangle className="lr-icon-risk" />
                            <h3>Áreas Críticas</h3>
                        </div>
                        <ul className="lr-list">
                            {results.topRisks.map(r => (
                                <li key={r.id}>
                                    <strong>{r.name}:</strong> {r.interpretation.label}
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                {/* 5. Recomendaciones */}
                <section className="lr-section lr-recs-section">
                    <div className="lr-card-header">
                        <Lightbulb className="lr-icon-blue" />
                        <h3>Recomendaciones Prácticas</h3>
                    </div>
                    <div className="lr-recs-grid">
                        {recommendations.map((rec, i) => (
                            <div key={i} className="lr-rec-item">
                                <span className="lr-rec-num">{i + 1}</span>
                                <p>{rec}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 6. Plan de Desarrollo */}
                <section className="lr-section lr-plan-section">
                    <div className="lr-card-header">
                        <ClipboardList className="lr-icon-teal" />
                        <h3>Plan de Crecimiento Personalizado</h3>
                    </div>
                    <div className="lr-plan-content">
                        <p>Basado en tu perfil de <strong>{results.level.label}</strong>, tu enfoque para los próximos 90 días debe ser:</p>
                        <div className="lr-plan-steps">
                            <div className="lr-step">
                                <h4>Fase 1: Estabilización (Día 1-30)</h4>
                                <p>Enfocarte en la dimensión de <strong>{results.topRisks[0]?.name}</strong> para reducir inconsistencias.</p>
                            </div>
                            <div className="lr-step">
                                <h4>Fase 2: Expansión (Día 31-60)</h4>
                                <p>Potenciar tu fortaleza en <strong>{results.topStrengths[0]?.name}</strong> para generar mayor impacto en tu entorno.</p>
                            </div>
                            <div className="lr-step">
                                <h4>Fase 3: Trascendencia (Día 61-90)</h4>
                                <p>Integrar hábitos de liderazgo consciente para consolidar un legado sostenible.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Closing Quote */}
                <section className="lr-quote-section">
                    <Quote className="lr-quote-icon" />
                    <p className="lr-quote-text">
                        “El verdadero liderazgo no se demuestra solo en la capacidad de obtener resultados, sino en quién te conviertes, cómo impactas a otros y qué legado construyes mientras los alcanzas.”
                    </p>
                </section>
            </main>

            <footer className="lr-footer">
                <button className="lr-btn-secondary" onClick={() => navigate('/liderazgo-test')}>
                    <RefreshCw size={18} /> Repetir Test
                </button>
                <button className="lr-btn-primary" onClick={() => window.print()}>
                    <Download size={18} /> Descargar Reporte PDF
                </button>
            </footer>
        </div>
    );
};

export default LiderazgoResults;
