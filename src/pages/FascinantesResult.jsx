import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Info, User, Brain, HeartPulse, Handshake, Eye, TrendingUp, Zap, Download } from 'lucide-react';
import { fascinantesQuestions, fascinantesDomains, fascinantesInterpretations } from '../data/fascinantesData';
import FascinantesRadar from '../components/FascinantesRadar';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './FascinantesResult.css';

const DOMAIN_STYLES = {
    corporal: { color: '#ff3131', class: 'neon-corporal' },
    mental: { color: '#ff9100', class: 'neon-mental' },
    emocional: { color: '#ffee00', class: 'neon-emocional' },
    social: { color: '#00ff00', class: 'neon-social' },
    espiritual: { color: '#00e5ff', class: 'neon-espiritual' },
    financiero: { color: '#d500f9', class: 'neon-financiero' }
};


const getDomainIcon = (domainId) => {
    const style = DOMAIN_STYLES[domainId] || { color: '#ddbe3d', class: '' };
    const props = { size: 22, stroke: style.color, strokeWidth: 1.5 };
    
    switch(domainId) {
        case 'corporal': return <User {...props} />;
        case 'mental': return <Brain {...props} />;
        case 'emocional': return <HeartPulse {...props} />;
        case 'social': return <Handshake {...props} />;
        case 'espiritual': return <Eye {...props} />;
        case 'financiero': return <TrendingUp {...props} />;
        default: return <Zap {...props} />;
    }
};

const FascinantesResult = () => {
    const navigate = useNavigate();
    const [domainScores, setDomainScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDomain, setSelectedDomain] = useState(null);
    const [userAnswers, setUserAnswers] = useState({});
    const [isSharing, setIsSharing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const radarRef = React.useRef(null);
    const reportRef = React.useRef(null);

    useEffect(() => {
        const storedAnswers = localStorage.getItem('fascinantesAnswers');
        if (storedAnswers) {
            const answers = JSON.parse(storedAnswers);
            setUserAnswers(answers);
            const scores = fascinantesDomains.map(domain => {
                const domainQuestions = fascinantesQuestions.filter(q => q.domain === domain.id);
                const totalScore = domainQuestions.reduce((sum, q) => sum + (answers[q.id] || 0), 0);
                
                // Interpretation
                const interpretation = fascinantesInterpretations.find(interp => 
                    totalScore >= interp.range[0] && totalScore <= interp.range[1]
                ) || fascinantesInterpretations[0];

                return {
                    id: domain.id,
                    domain: domain.name,
                    score: totalScore,
                    interpretation: interpretation.name,
                    definition: interpretation.definition,
                    full: 100,
                    style: DOMAIN_STYLES[domain.id] || { color: '#ddbe3d', class: '' }
                };
            });
            setDomainScores(scores);
            setLoading(false);
        } else {
            navigate('/autodiag-intro');
        }
    }, [navigate]);

    const getAnswerColor = (val) => {
        switch(val) {
            case 1: return '#ff3131'; // Rojo
            case 2: return '#ff9100'; // Naranja
            case 3: return '#ffee00'; // Amarillo
            case 4: return '#00e5ff'; // Azul claro
            case 5: return '#00ff00'; // Verde
            default: return '#fff';
        }
    };

    const getAnswerLabel = (val) => {
        switch(val) {
            case 1: return 'Nunca';
            case 2: return 'Rara vez';
            case 3: return 'A veces';
            case 4: return 'Casi siempre';
            case 5: return 'Siempre';
            default: return '';
        }
    };

    const handleShare = async () => {
        if (!radarRef.current || isSharing) return;
        setIsSharing(true);

        try {
            const canvas = await html2canvas(radarRef.current, {
                backgroundColor: '#00121d',
                scale: 3,
                useCORS: true,
                onclone: (clonedDoc) => {
                    const clonedRadar = clonedDoc.querySelector('.radar-section');
                    if (clonedRadar) {
                        clonedRadar.style.padding = '40px';
                        clonedRadar.style.background = '#00121d';
                    }
                }
            });

            const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const imageFile = new File([imageBlob], 'mi-radar-autodiagnostico.png', { type: 'image/png' });

            const shareData = {
                title: 'Mi Radar de Autodiagnóstico',
                text: 'He descubierto mi configuración de personalidad en el Autodiagnóstico de Auténticos. ¡Mira mis resultados!',
                files: [imageFile],
            };

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
                await navigator.share(shareData);
            } else {
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = 'mi-radar-autodiagnostico.png';
                link.click();
                alert('La imagen de tu radar se ha descargado.');
            }
        } catch (error) {
            console.error('Error sharing:', error);
            alert('No se pudo generar la imagen para compartir.');
        } finally {
            setIsSharing(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!reportRef.current || isDownloading) return;
        setIsDownloading(true);

        try {
            const canvas = await html2canvas(reportRef.current, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true,
                onclone: (clonedDoc) => {
                    const clonedContent = clonedDoc.querySelector('.result-content');
                    if (clonedContent) {
                        // Vivid Blue for the PDF (Blue-900)
                        const vividBlue = '#1e3a8a';
                        
                        clonedContent.style.background = '#ffffff';
                        clonedContent.style.width = '820px'; // Closer to A4 ratio
                        clonedContent.style.padding = '40px';
                        clonedContent.style.margin = '0 auto';
                        clonedContent.style.display = 'block';
                        
                        const title = clonedContent.querySelector('h1');
                        if (title) {
                            title.style.color = '#9e7b22';
                            title.style.textAlign = 'center';
                            title.style.fontSize = '2.4rem'; // Reduced to fit on one line
                            title.style.marginBottom = '30px';
                            title.style.whiteSpace = 'nowrap';
                            title.style.width = '1000px'; // Overflow is OK to force single line
                            title.style.marginLeft = '-90px'; // Offset to center the wide title
                            title.style.display = 'block';
                        }

                        const radarSection = clonedContent.querySelector('.radar-section');
                        if (radarSection) {
                            radarSection.style.background = vividBlue;
                            radarSection.style.borderRadius = '32px';
                            radarSection.style.padding = '40px';
                            radarSection.style.marginBottom = '40px';
                            radarSection.style.display = 'flex';
                            radarSection.style.flexDirection = 'column';
                            radarSection.style.justifyContent = 'center';
                            radarSection.style.alignItems = 'center';
                            radarSection.style.width = '100%';
                            radarSection.style.boxSizing = 'border-box';
                            
                            // FORCE horizontal centering of the radar container
                            const radarContainer = radarSection.querySelector('.fascinantes-radar-container');
                            if (radarContainer) {
                                // Important: Fixed width in pixels for the PDF clone
                                radarContainer.style.width = '700px'; 
                                radarContainer.style.height = '600px';
                                radarContainer.style.margin = '0 auto';
                                radarContainer.style.display = 'flex';
                                radarContainer.style.justifyContent = 'center';
                                radarContainer.style.alignItems = 'center';
                                
                                const svg = radarContainer.querySelector('svg');
                                if (svg) {
                                    svg.style.margin = '0 auto';
                                    svg.style.display = 'block';
                                    // Ensure ResponsiveContainer doesn't collapse
                                    svg.setAttribute('width', '700');
                                    svg.setAttribute('height', '600');
                                }
                            }
                        }

                        const grid = clonedContent.querySelector('.interpretations-grid');
                        if (grid) {
                            grid.style.display = 'grid';
                            grid.style.gridTemplateColumns = '1fr 1fr';
                            grid.style.gap = '20px';
                            grid.style.width = '100%';
                            grid.style.boxSizing = 'border-box';
                        }

                        const cards = clonedContent.querySelectorAll('.domain-result-card');
                        cards.forEach(card => {
                            card.style.background = vividBlue;
                            card.style.color = '#ffffff';
                            card.style.borderColor = '#9e7b22';
                            card.style.borderWidth = '1px';
                            card.style.borderStyle = 'solid';
                            card.style.boxShadow = 'none';
                            card.style.padding = '20px';
                            card.style.borderRadius = '20px';
                            card.style.minHeight = '160px';
                            
                            const domainHeader = card.querySelector('h3');
                            if (domainHeader) {
                                domainHeader.style.color = '#ffffff';
                                domainHeader.style.fontSize = '1.2rem';
                            }

                            const desc = card.querySelector('.domain-definition');
                            if (desc) {
                                desc.style.color = 'rgba(255, 255, 255, 0.9)';
                                desc.style.fontSize = '0.9rem';
                                desc.style.lineHeight = '1.4';
                            }

                            const scoreNum = card.querySelector('.score-num');
                            if (scoreNum) scoreNum.style.color = '#ffffff';

                            const footerTip = card.querySelector('.card-footer-tip');
                            if (footerTip) footerTip.style.display = 'none';
                        });

                        const actions = clonedContent.querySelector('.result-actions');
                        if (actions) actions.style.display = 'none';

                        const footer = clonedContent.querySelector('.result-footer-minimal');
                        if (footer) {
                            footer.style.marginTop = '40px';
                            const footerImg = footer.querySelector('img');
                            if (footerImg) footerImg.style.maxHeight = '40px';
                        }
                    }
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = 210; // mm
            const imgProps = canvas.width / canvas.height;
            const pdfHeight = pdfWidth / imgProps;
            
            const pdf = new jsPDF('p', 'mm', [pdfWidth, pdfHeight]);
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('Reporte-Autodiagnostico.pdf');
        } catch (error) {
            console.error('Error PDF:', error);
            alert('Hubo un error al generar el PDF.');
        } finally {
            setIsDownloading(false);
        }
    };

    if (loading) return <div className="loading-fascinantes">Procesando resultados...</div>;

    return (
        <div className="fascinantes-result-page">
            <div className="futuristic-overlay"></div>
            
            <div className="result-content animate-fade-in" ref={reportRef}>
                <header className="result-header">
                    <h1>RESULTADO AUTODIAGNÓSTICO</h1>
                    <div className="neon-divider"></div>
                </header>

                <div className="radar-section" ref={radarRef}>
                    <FascinantesRadar data={domainScores} />
                </div>

                <div className="interpretations-grid">
                    {domainScores.map((score) => (
                        <div 
                            key={score.id} 
                            className={`domain-result-card glass clickable ${score.style.class}`}
                            onClick={() => setSelectedDomain(score)}
                        >
                            <div className="domain-top">
                                <div className="domain-info-header">
                                    <span className="domain-result-icon" style={{ color: score.style.color }}>
                                        {getDomainIcon(score.id)}
                                    </span>
                                    <h3>{score.domain}</h3>
                                </div>
                                <span className={`result-tag ${score.interpretation.toLowerCase()}`}>
                                    {score.interpretation}
                                </span>
                            </div>
                            <div className="score-row">
                                <div className="score-bar-bg">
                                    <div 
                                        className="score-bar-fill" 
                                        style={{ 
                                            width: `${score.score}%`,
                                            '--domain-color': score.style.color 
                                        }}
                                    ></div>
                                </div>
                                <span className="score-num">{score.score} pts</span>
                            </div>
                            <p className="domain-definition">{score.definition}</p>
                            <div className="card-footer-tip">Ver detalle <ArrowLeft size={14} style={{ transform: 'rotate(180deg)' }} /></div>
                        </div>
                    ))}
                </div>

                <div className="result-actions">
                    <button 
                        className="btn-action primary" 
                        onClick={handleShare}
                        disabled={isSharing}
                    >
                        <Share2 size={20} /> {isSharing ? 'Capturando...' : 'Compartir'}
                    </button>
                    <button 
                        className="btn-action secondary" 
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                    >
                        <Download size={20} /> {isDownloading ? 'Generando...' : 'PDF'}
                    </button>
                </div>
            </div>

            {selectedDomain && (
                <div className="domain-modal-overlay" onClick={() => setSelectedDomain(null)}>
                    <div className="domain-modal-content glass animate-scale-up" onClick={e => e.stopPropagation()}>
                        <header className="modal-header">
                            <div className="modal-title-box">
                                <span className="modal-icon" style={{ color: selectedDomain.style.color }}>
                                    {getDomainIcon(selectedDomain.id)}
                                </span>
                                <h2 style={{ color: selectedDomain.style.color }}>{selectedDomain.domain}</h2>
                            </div>
                            <button className="btn-close-modal" onClick={() => setSelectedDomain(null)}>×</button>
                        </header>
                        
                        <div className="modal-body">
                            <div className="questions-list">
                                {fascinantesQuestions
                                    .filter(q => q.domain === selectedDomain.id)
                                    .map((question, idx) => {
                                        const answer = userAnswers[question.id] || 0;
                                        return (
                                            <div key={question.id} className="modal-question-item">
                                                <div className="question-info">
                                                    <span className="q-index">{idx + 1}</span>
                                                    <p className="q-text">{question.text}</p>
                                                </div>
                                                <div className="answer-status">
                                                    <span 
                                                        className="answer-value-badge" 
                                                        style={{ 
                                                            borderColor: getAnswerColor(answer),
                                                            color: getAnswerColor(answer)
                                                        }}
                                                    >
                                                        {answer}
                                                    </span>
                                                    <span className="answer-label-text">{getAnswerLabel(answer)}</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <footer className="result-footer-minimal">
                <img src="/Logo-Blanco.png" alt="Auténticos" />
            </footer>
        </div>
    );
};

export default FascinantesResult;
