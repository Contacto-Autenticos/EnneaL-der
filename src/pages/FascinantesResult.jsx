import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Info, User, Brain, HeartPulse, Handshake, Eye, TrendingUp, Zap, Download, AlertCircle } from 'lucide-react';
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
                        const themeBlue = '#0d2535';
                        const themeGold = '#ddbe3d';
                        const darkGold = '#9e7b22';
                        
                        clonedContent.style.setProperty('background', '#ffffff', 'important');
                        clonedContent.style.setProperty('width', '1000px', 'important');
                        clonedContent.style.setProperty('padding', '60px', 'important');
                        clonedContent.style.setProperty('margin', '0 auto', 'important');
                        clonedContent.style.setProperty('display', 'block', 'important');
                        clonedContent.style.setProperty('overflow', 'visible', 'important');
                        
                        const title = clonedContent.querySelector('h1');
                        if (title) {
                            title.style.setProperty('color', darkGold, 'important');
                            title.style.setProperty('text-align', 'center', 'important');
                            title.style.setProperty('font-size', '3rem', 'important');
                            title.style.setProperty('margin-bottom', '50px', 'important');
                            title.style.setProperty('white-space', 'nowrap', 'important');
                            title.style.setProperty('width', '100%', 'important');
                            title.style.setProperty('display', 'block', 'important');
                        }

                        const radarSection = clonedContent.querySelector('.radar-section');
                        if (radarSection) {
                            radarSection.style.setProperty('background', themeBlue, 'important');
                            radarSection.style.setProperty('background-color', themeBlue, 'important');
                            radarSection.style.setProperty('border-radius', '24px', 'important');
                            radarSection.style.setProperty('padding', '40px', 'important');
                            radarSection.style.setProperty('margin-bottom', '50px', 'important');
                            radarSection.style.setProperty('border', `1px solid rgba(221, 190, 61, 0.4)`, 'important');
                            radarSection.style.setProperty('border-left', `8px solid ${themeGold}`, 'important');
                            radarSection.style.setProperty('display', 'flex', 'important');
                            radarSection.style.setProperty('justify-content', 'center', 'important');
                            radarSection.style.setProperty('align-items', 'center', 'important');
                            radarSection.style.setProperty('width', '100%', 'important');
                            radarSection.style.setProperty('box-sizing', 'border-box', 'important');
                            radarSection.style.setProperty('overflow', 'visible', 'important');
                            
                            const radarContainer = radarSection.querySelector('.fascinantes-radar-container');
                            if (radarContainer) {
                                radarContainer.style.setProperty('width', '800px', 'important'); 
                                radarContainer.style.setProperty('height', '720px', 'important');
                                radarContainer.style.setProperty('margin', '0 auto', 'important');
                                radarContainer.style.setProperty('display', 'flex', 'important');
                                radarContainer.style.setProperty('justify-content', 'center', 'important');
                                radarContainer.style.setProperty('align-items', 'center', 'important');
                                radarContainer.style.setProperty('overflow', 'visible', 'important');
                                
                                const svg = radarContainer.querySelector('svg');
                                if (svg) {
                                    svg.style.setProperty('margin', '0 auto', 'important');
                                    svg.style.setProperty('display', 'block', 'important');
                                    svg.style.setProperty('overflow', 'visible', 'important');
                                    svg.setAttribute('width', '800');
                                    svg.setAttribute('height', '720');
                                }
                            }
                        }

                        const grid = clonedContent.querySelector('.interpretations-grid');
                        if (grid) {
                            grid.style.setProperty('display', 'grid', 'important');
                            grid.style.setProperty('grid-template-columns', '1fr 1fr', 'important');
                            grid.style.setProperty('gap', '20px', 'important');
                            grid.style.setProperty('margin-bottom', '20px', 'important');
                            grid.style.setProperty('width', '100%', 'important');
                            grid.style.setProperty('box-sizing', 'border-box', 'important');
                        }

                        const cards = clonedContent.querySelectorAll('.domain-result-card');
                        cards.forEach(card => {
                            card.style.setProperty('background', themeBlue, 'important');
                            card.style.setProperty('background-color', themeBlue, 'important');
                            card.style.setProperty('color', '#ffffff', 'important');
                            card.style.setProperty('border', `1px solid rgba(221, 190, 61, 0.3)`, 'important');
                            card.style.setProperty('border-left', `8px solid ${themeGold}`, 'important');
                            card.style.setProperty('padding', '25px', 'important');
                            card.style.setProperty('border-radius', '20px', 'important');
                            card.style.setProperty('min-height', '180px', 'important');
                            card.style.setProperty('box-shadow', 'none', 'important');
                            card.style.setProperty('animation', 'none', 'important');
                            
                            const domainHeader = card.querySelector('h3');
                            if (domainHeader) {
                                domainHeader.style.setProperty('color', themeGold, 'important');
                                domainHeader.style.setProperty('font-size', '1.4rem', 'important');
                                domainHeader.style.setProperty('margin-bottom', '12px', 'important');
                            }

                            const desc = card.querySelector('.domain-definition');
                            if (desc) {
                                desc.style.setProperty('color', '#ffffff', 'important');
                                desc.style.setProperty('font-size', '1rem', 'important');
                                desc.style.setProperty('line-height', '1.5', 'important');
                            }

                            const scoreNum = card.querySelector('.score-num');
                            if (scoreNum) {
                                scoreNum.style.setProperty('color', themeGold, 'important');
                                scoreNum.style.setProperty('font-weight', 'bold', 'important');
                            }

                            const footerTip = card.querySelector('.card-footer-tip');
                            if (footerTip) footerTip.style.setProperty('display', 'none', 'important');
                        });

                        const importantNote = clonedContent.querySelector('.important-note-card');
                        if (importantNote) {
                            importantNote.style.setProperty('background', `linear-gradient(135deg, ${themeBlue} 0%, #070f14 100%)`, 'important');
                            importantNote.style.setProperty('background-color', themeBlue, 'important');
                            importantNote.style.setProperty('border', `1px solid rgba(255, 255, 255, 0.1)`, 'important');
                            importantNote.style.setProperty('border-left', `8px solid ${themeGold}`, 'important');
                            importantNote.style.setProperty('padding', '25px 30px', 'important');
                            importantNote.style.setProperty('margin-top', '0px', 'important');
                            importantNote.style.setProperty('margin-bottom', '20px', 'important');
                            importantNote.style.setProperty('border-radius', '20px', 'important');
                            importantNote.style.setProperty('display', 'flex', 'important');
                            importantNote.style.setProperty('align-items', 'center', 'important');
                            importantNote.style.setProperty('gap', '20px', 'important');
                            importantNote.style.setProperty('box-shadow', 'none', 'important');

                            const noteIcon = importantNote.querySelector('.note-icon');
                            if (noteIcon) noteIcon.style.setProperty('color', themeGold, 'important');

                            const noteText = importantNote.querySelector('.note-text');
                            if (noteText) {
                                noteText.style.setProperty('color', '#ffffff', 'important');
                                noteText.style.setProperty('font-size', '1rem', 'important');
                                noteText.style.setProperty('line-height', '1.6', 'important');
                                
                                const strong = noteText.querySelector('strong');
                                if (strong) strong.style.setProperty('color', themeGold, 'important');
                            }
                        }

                        const actions = clonedContent.querySelector('.result-actions');
                        if (actions) actions.style.setProperty('display', 'none', 'important');

                        const footer = clonedContent.querySelector('.result-footer-minimal');
                        if (footer) {
                            footer.style.setProperty('margin-top', '60px', 'important');
                            footer.style.setProperty('display', 'flex', 'important');
                            footer.style.setProperty('justify-content', 'center', 'important');
                            const footerImg = footer.querySelector('img');
                            if (footerImg) footerImg.style.setProperty('max-height', '50px', 'important');
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

                <div className="important-note-card animate-fade-in">
                    <div className="note-icon">
                        <AlertCircle size={28} />
                    </div>
                    <p className="note-text">
                        <strong>Nota Importante:</strong> si alguien está en crisis intensa o con síntomas severos, esto no reemplaza acompañamiento profesional. Pide ayuda.
                    </p>
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
