import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Info, User, Brain, HeartPulse, Handshake, Eye, TrendingUp, Zap, Download, AlertCircle, MessageCircle, Twitter, Linkedin } from 'lucide-react';
import { fascinantesQuestions, fascinantesDomains, fascinantesInterpretations } from '../data/fascinantesData';
import FascinantesRadar from '../components/FascinantesRadar';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './FascinantesResult.css';

const DOMAIN_STYLES = {
    corporal: { color: '#cc0000', class: 'neon-corporal' },
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
    const [showSocialOptions, setShowSocialOptions] = useState(false); // Senior: Better state management for fallback
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
            case 1: return '#cc0000'; // Rojo
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
            // SENIOR: Ensure UI is settled and animations (Recharts) are done
            window.scrollTo(0, 0);
            await new Promise(resolve => requestAnimationFrame(resolve));
            await new Promise(resolve => setTimeout(resolve, 500)); // Safety buffer for SVG rendering

            const canvas = await html2canvas(radarRef.current, {
                backgroundColor: '#00121d',
                scale: 3, // High-quality for text/labels
                useCORS: true,
                imageTimeout: 0,
                // Higher quality but still mobile friendly
                width: 800,
                height: 800,
                onclone: (clonedDoc) => {
                    const clonedSection = clonedDoc.querySelector('.radar-section');
                    if (clonedSection) {
                        // 1. RECONSTRUCTION: Total wipeout of captured content
                        clonedSection.innerHTML = '';
                        
                        // 2. ISOLATED CANVAS (800x800)
                        // This ensures the capture area is exactly what we want, regardless of the screen
                        Object.assign(clonedSection.style, {
                            width: '800px',
                            height: '800px',
                            display: 'block',
                            background: '#00121d',
                            padding: '0',
                            margin: '0',
                            position: 'relative',
                            overflow: 'visible',
                            boxSizing: 'border-box'
                        });

                        // 3. DEDICATED RADAR CONTAINER (800x800 full-size)
                        const radarContainer = clonedDoc.createElement('div');
                        Object.assign(radarContainer.style, {
                            width: '800px',
                            height: '800px',
                            position: 'absolute',
                            left: '0', 
                            top: '-30px', // Shifted up for balance
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            background: 'transparent',
                            margin: '0',
                            padding: '0',
                            overflow: 'visible'
                        });
                        clonedSection.appendChild(radarContainer);

                        // 4. SVG CLONE & ASPECT RATIO PRESERVATION
                        const originalSvg = document.querySelector('.radar-section svg');
                        if (originalSvg) {
                            const svg = originalSvg.cloneNode(true);
                            
                            // Instead of forcing a viewBox, we respect the original one
                            // and let Flexbox on the parent handle the centering.
                            const originalViewBox = originalSvg.getAttribute('viewBox');
                            const originalW = originalSvg.getAttribute('width') || 650;
                            const originalH = originalSvg.getAttribute('height') || 650;

                            // Reset SVG to be a clean, styled child of the flex container
                            svg.removeAttribute('width');
                            svg.removeAttribute('height');
                            
                            if (originalViewBox) {
                                svg.setAttribute('viewBox', originalViewBox);
                            } else {
                                svg.setAttribute('viewBox', `0 0 ${originalW} ${originalH}`);
                            }

                            Object.assign(svg.style, {
                                width: '600px', // Adjusted to user request for 600px
                                height: '600px',
                                margin: '0 auto',
                                padding: '0',
                                position: 'relative',
                                overflow: 'visible',
                                transform: 'none', 
                                display: 'block',
                                filter: 'none'
                             });
                            
                            // Force absolute visibility on all nested elements
                            svg.querySelectorAll('*').forEach(el => {
                                if (el.style) {
                                    el.style.overflow = 'visible';
                                    el.style.clipPath = 'none';
                                }
                            });
                            
                            radarContainer.appendChild(svg);
                            
                            // 5. SURGICAL LABEL POSITIONING
                            const textBlocks = svg.querySelectorAll('text');
                            textBlocks.forEach(textBlock => {
                                Object.assign(textBlock.style, {
                                    fill: '#ffffff',
                                    opacity: '1',
                                    visibility: 'visible',
                                    display: 'block'
                                });

                                const textContent = textBlock.textContent.trim().toUpperCase();
                                const isNumeric = /^\d+$/.test(textContent);
                                
                                if (isNumeric) {
                                    textBlock.style.fontWeight = 'bold';
                                    textBlock.style.fontSize = '12px';
                                    return; 
                                }

                                const isDomainLabel = textContent.includes('DOMINIO') || 
                                    ['CORPORAL', 'MENTAL', 'EMOCIONAL', 'SOCIAL', 'ESPIRITUAL', 'FINANCIERO', 'RITUAL'].some(d => textContent.includes(d));

                                if (isDomainLabel) {
                                    Object.assign(textBlock.style, {
                                        fontWeight: '800',
                                        fontSize: '8px', // High readability
                                        textTransform: 'uppercase',
                                        textAnchor: 'middle'
                                    });
                                    const tspans = textBlock.querySelectorAll('tspan');
                                    
                                    // FINAL REFINEMENT: Detailed Below & Aligned configuration
                                    const isFinanciero = textContent.includes('FINANCIERO');
                                    const isEspiritual = textContent.includes('ESPIRITUAL');
                                    const isMental = textContent.includes('MENTAL');
                                    const isEmocional = textContent.includes('EMOCIONAL');
                                    const isSocial = textContent.includes('SOCIAL');
                                    const isCorporal = textContent.includes('CORPORAL');

                                    if (isCorporal) {
                                        // TOP: Text ABOVE icon
                                        textBlock.setAttribute('x', '0');
                                        textBlock.style.textAnchor = 'middle';
                                        if (tspans.length > 0) tspans[0].setAttribute('dy', '-1.5em'); 
                                        if (tspans.length === 0) textBlock.setAttribute('dy', '-1.5em');
                                    } else if (isSocial) {
                                        // BOTTOM: Text BELOW icon
                                        textBlock.setAttribute('x', '0');
                                        textBlock.style.textAnchor = 'middle';
                                        if (tspans.length > 0) tspans[0].setAttribute('dy', '1.5em'); 
                                        if (tspans.length === 0) textBlock.setAttribute('dy', '1.5em');
                                    } else if (isFinanciero || isEspiritual) {
                                        // LEFT SIDE: BELOW icon + Left Aligned (Start)
                                        textBlock.setAttribute('x', '-80');
                                        textBlock.style.textAnchor = 'start';
                                        if (tspans.length > 0) tspans[0].setAttribute('dy', '3.5em');
                                        if (tspans.length === 0) textBlock.setAttribute('dy', '3.5em');
                                    } else if (isMental || isEmocional) {
                                        // RIGHT SIDE: BELOW icon + Right Aligned (End)
                                        textBlock.setAttribute('x', '80');
                                        textBlock.style.textAnchor = 'end';
                                        if (tspans.length > 0) tspans[0].setAttribute('dy', '3.5em');
                                        if (tspans.length === 0) textBlock.setAttribute('dy', '3.5em');
                                    }

                                    // Apply core styling and shared properties to tspan children in one pass
                                    tspans.forEach(ts => {
                                        ts.setAttribute('x', textBlock.getAttribute('x'));
                                        ts.style.fill = '#ffffff';
                                        ts.style.fontSize = '11px';
                                        ts.style.fontWeight = '800';
                                        ts.style.opacity = '1';
                                        ts.style.visibility = 'visible';
                                    });

                                    // Secondary line spacing remains consistent
                                    if (tspans.length > 1) {
                                        tspans[1].setAttribute('dy', '1.2em');
                                    }
                                }
                            });
                            
                            // Ensure all icons are visible
                            svg.querySelectorAll('svg').forEach(icon => {
                                Object.assign(icon.style, {
                                    filter: 'none',
                                    opacity: '1',
                                    visibility: 'visible',
                                    display: 'block'
                                });
                            });
                        }

                        // 6. BRANDING RECONSTRUCTION
                        const branding = clonedDoc.createElement('div');
                        Object.assign(branding.style, {
                            position: 'absolute',
                            bottom: '30px',
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '2px', // Tightened gap
                            zIndex: '10'
                        });

                        const logo = clonedDoc.createElement('img');
                        logo.src = '/Logo-Blanco.png';
                        Object.assign(logo.style, {
                            height: '40px',
                            width: 'auto',
                            display: 'block',
                            marginBottom: '0px' // Removed margin
                        });
                        branding.appendChild(logo);

                        const footerText = clonedDoc.createElement('div');
                        footerText.textContent = 'AUTODIAGNÓSTICO'; // Removed "- AUTÉNTICOS"
                        Object.assign(footerText.style, {
                            color: '#FFD700',
                            fontSize: '11px',
                            fontWeight: '700',
                            letterSpacing: '2px',
                            fontFamily: 'sans-serif'
                        });
                        branding.appendChild(footerText);

                        clonedSection.appendChild(branding);
                    }
                }
            });

            const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const imageFile = new File([imageBlob], 'mi-radar-fascinante.png', { type: 'image/png' });

            const shareData = {
                title: 'Resultados de mi Autodiagnóstico',
                text: 'He descubierto mi configuración en el Autodiagnóstico "Fascinantes" de Auténticos. ¡Mira mis resultados!',
                files: [imageFile],
            };

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
                await navigator.share(shareData);
            } else {
                // SENIOR: Proper fallback UX for Desktop
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = 'mi-radar-autenticos.png';
                link.click();
                
                // Show social links since we can't share the file directly on Desktop
                setShowSocialOptions(true);
            }
        } catch (error) {
            console.error('Error sharing:', error);
            alert('No se pudo generar la imagen del radar.');
        } finally {
            setIsSharing(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!reportRef.current || isDownloading) return;
        setIsDownloading(true);

        // Map real SVG physical dimensions to the viewBox inside the clone
        const liveSvg = reportRef.current.querySelector('.fascinantes-radar-container svg');
        let realSvgW = 800; let realSvgH = 720;
        if (liveSvg) {
            const rect = liveSvg.getBoundingClientRect();
            realSvgW = rect.width;
            realSvgH = rect.height;
        }

        try {
            // Ensure we are at the top for capture
            window.scrollTo(0, 0);

            const canvas = await html2canvas(reportRef.current, {
                backgroundColor: null,
                scale: 3,
                useCORS: true,
                imageTimeout: 0,
                windowWidth: 1000,
                width: 1000,
                scrollX: 0,
                scrollY: 0,
                onclone: (clonedDoc) => {
                    const clonedContent = clonedDoc.querySelector('.result-content');
                    if (clonedContent) {
                        const themeBlue = '#000000'; // Pure Black for maximum contrast
                        const themeGold = '#ffd700'; // Vibrant Gold
                        const bgColor = '#000000'; 
                        
                        // Force rigid width that matches the capture viewport
                        clonedContent.style.setProperty('width', '1000px', 'important');
                        clonedContent.style.setProperty('min-width', '1000px', 'important');
                        clonedContent.style.setProperty('margin', '0', 'important');
                        clonedContent.style.setProperty('padding', '50px', 'important'); // Balanced padding
                        clonedContent.style.setProperty('box-sizing', 'border-box', 'important');
                        clonedContent.style.setProperty('background', '#ffffff', 'important');
                        clonedContent.style.setProperty('display', 'block', 'important');
                        clonedContent.style.setProperty('color-scheme', 'dark', 'important');
                        clonedContent.style.setProperty('filter', 'none', 'important');
                        clonedContent.style.setProperty('box-shadow', 'none', 'important');

                        const title = clonedContent.querySelector('h1');
                        if (title) {
                            title.style.setProperty('color', '#9e7b22', 'important'); // Darker gold for main title
                            title.style.setProperty('text-align', 'center', 'important');
                            title.style.setProperty('width', '100%', 'important');
                            title.style.setProperty('margin-bottom', '30px', 'important');
                        }

                        const radarSection = clonedContent.querySelector('.radar-section');
                        if (radarSection) {
                            // Use pure black for robustness
                            radarSection.style.setProperty('background', '#000000', 'important'); 
                            radarSection.style.setProperty('background-color', '#000000', 'important');
                            radarSection.style.setProperty('border-left', `12px solid ${themeGold}`, 'important');
                            radarSection.style.setProperty('margin', '0 0 40px 0', 'important');
                            radarSection.style.setProperty('width', '100%', 'important');
                            radarSection.style.setProperty('display', 'flex', 'important');
                            radarSection.style.setProperty('justify-content', 'center', 'important');
                            radarSection.style.setProperty('align-items', 'center', 'important');
                            radarSection.style.setProperty('border-radius', '20px', 'important');
                            radarSection.style.setProperty('filter', 'none', 'important');
                            radarSection.style.setProperty('backdrop-filter', 'none', 'important');
                            radarSection.style.setProperty('box-shadow', 'none', 'important');

                            
                            const radarContainer = radarSection.querySelector('.fascinantes-radar-container');
                            if (radarContainer) {
                                radarContainer.style.setProperty('background', 'transparent', 'important');
                                radarContainer.style.setProperty('box-shadow', 'none', 'important');
                                radarContainer.style.setProperty('border', 'none', 'important');
                                radarContainer.style.setProperty('transform', 'translateX(30px)', 'important'); // Shift ONLY the chart right
                                
                                const svg = radarContainer.querySelector('svg');
                                if (svg) {
                                    // Ensure all path/text in SVG are visibly white in PDF
                                    const svgTexts = svg.querySelectorAll('text, tspan');
                                    svgTexts.forEach(t => t.style.setProperty('fill', '#ffffff', 'important'));
                                }
                            }
                        }

                        // Remove explicit grid forced columns so it respects original layout naturally
                        const cards = clonedContent.querySelectorAll('.domain-result-card');
                        cards.forEach(card => {
                            // Use pure black for robustness
                            card.style.setProperty('background', '#000000', 'important'); 
                            card.style.setProperty('background-color', '#000000', 'important');
                            card.style.setProperty('border', `1px solid rgba(255, 255, 255, 0.4)`, 'important');
                            card.style.setProperty('padding', '30px', 'important');
                            card.style.setProperty('border-radius', '20px', 'important');
                            card.style.setProperty('break-inside', 'avoid', 'important');
                            card.style.setProperty('width', '100%', 'important');
                            card.style.setProperty('box-shadow', 'none', 'important');
                            card.style.setProperty('filter', 'none', 'important');
                            card.style.setProperty('backdrop-filter', 'none', 'important');

                            
                            const domainId = card.className.match(/neon-(\w+)/);
                            if (domainId && domainId[1]) {
                                const color = DOMAIN_STYLES[domainId[1]]?.color || themeGold;
                                card.style.setProperty('border-left', `10px solid ${color}`, 'important');
                            }

                            const header = card.querySelector('h3');
                            if (header) {
                                header.style.setProperty('color', themeGold, 'important');
                                header.style.setProperty('font-size', '1.6rem', 'important');
                                header.style.setProperty('margin-bottom', '10px', 'important');
                            }

                            const definition = card.querySelector('.domain-definition');
                            if (definition) {
                                definition.style.setProperty('color', '#ffffff', 'important');
                                definition.style.setProperty('opacity', '1', 'important');
                                definition.style.setProperty('font-size', '1.1rem', 'important');
                            }

                            const tag = card.querySelector('.result-tag');
                            if (tag) {
                                tag.style.setProperty('background', 'rgba(0, 0, 0, 0.4)', 'important');
                                tag.style.setProperty('border', '1px solid rgba(255, 255, 255, 0.2)', 'important');
                                tag.style.setProperty('color', '#ffffff', 'important');
                            }
                            
                            const score = card.querySelector('.score-num');
                            if (score) score.style.setProperty('color', '#ffffff', 'important');
                        });

                        const importantNote = clonedContent.querySelector('.important-note-card');
                        if (importantNote) {
                            importantNote.style.setProperty('background', '#000000', 'important');
                            importantNote.style.setProperty('background-color', '#000000', 'important');
                            importantNote.style.setProperty('border', `1px solid rgba(255, 255, 255, 0.3)`, 'important');
                            importantNote.style.setProperty('border-left', `10px solid ${themeGold}`, 'important');
                            importantNote.style.setProperty('filter', 'none', 'important');
                            importantNote.style.setProperty('backdrop-filter', 'none', 'important');
                            importantNote.style.setProperty('box-shadow', 'none', 'important');
                            importantNote.style.setProperty('opacity', '1', 'important');
                            
                            const noteText = importantNote.querySelector('.note-text');
                            if (noteText) noteText.style.setProperty('color', '#ffffff', 'important');
                            
                            const noteIcon = importantNote.querySelector('.note-icon');
                            if (noteIcon) noteIcon.style.setProperty('color', themeGold, 'important');
                        }

                        const actions = clonedContent.querySelector('.result-actions');
                        if (actions) actions.style.setProperty('display', 'none', 'important');

                        const footer = clonedContent.querySelector('.result-footer-minimal');
                        if (footer) {
                            footer.style.setProperty('margin-top', '50px', 'important');
                            footer.style.setProperty('display', 'flex', 'important');
                            footer.style.setProperty('justify-content', 'center', 'important');
                            const img = footer.querySelector('img');
                            if (img) img.style.setProperty('max-height', '70px', 'important');
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
                    <h1 style={{ lineHeight: 1 }}>
                        <span style={{ display: 'block' }}>RESULTADO</span>
                        <span style={{ display: 'block', marginTop: '5px' }}>AUTODIAGNÓSTICO</span>
                    </h1>
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
                        className="btn-action tertiary" 
                        onClick={() => navigate('/autodiag-intro')}
                    >
                        <ArrowLeft size={18} /> REGRESAR
                    </button>
                    <button 
                        className="btn-action secondary" 
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                    >
                        <Download size={18} /> {isDownloading ? '...' : 'PDF'}
                    </button>
                    <button 
                        className="btn-action primary" 
                        onClick={handleShare}
                        disabled={isSharing}
                    >
                        {isSharing ? 'GENERANDO...' : 'COMPARTIR'} <Share2 size={18} />
                    </button>
                </div>

                {/* SENIOR: Desktop Social Fallback UI */}
                {showSocialOptions && (
                    <div className="social-fallback-container animate-fade-in">
                        <p>¡Imagen lista! Compártela también en:</p>
                        <div className="social-links">
                            <a 
                                href={`https://wa.me/?text=${encodeURIComponent('He descubierto mi perfil fascinante en Auténticos. ¡Mira mis resultados! ' + window.location.href)}`}
                                target="_blank" rel="noopener noreferrer" className="social-link wa"
                            >
                                <MessageCircle size={16} /> WhatsApp
                            </a>
                            <a 
                                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Mi perfil en Auténticos:')}&url=${encodeURIComponent(window.location.href)}`}
                                target="_blank" rel="noopener noreferrer" className="social-link tw"
                            >
                                <Twitter size={16} /> Twitter/X
                            </a>
                            <a 
                                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                                target="_blank" rel="noopener noreferrer" className="social-link in"
                            >
                                <Linkedin size={16} /> LinkedIn
                            </a>
                        </div>
                        <button className="btn-close-social" onClick={() => setShowSocialOptions(false)}>Cerrar</button>
                    </div>
                )}
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
            
            <div className="result-footer-minimal">
                <img src="/Logo-Blanco.png" alt="Auténticos" />
            </div>
        </div>
    );
};

export default FascinantesResult;
