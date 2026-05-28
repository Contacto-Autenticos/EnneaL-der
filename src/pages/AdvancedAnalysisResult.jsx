import React, { useEffect } from 'react';
import html2canvas from 'html2canvas';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Target,
    Layers,
    TrendingUp,
    Lightbulb,
    ArrowLeft,
    Share2,
    CheckCircle2,
    X,
    Info,
    Quote,
    HelpCircle,
    Download,
    Loader2,
    MousePointerClick,
    Shield,
    AlertTriangle,
    Check,
    Zap,
    Activity,
    Wind,
    Rocket
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { advancedEnneagramInfo } from '../data/advancedInfo';
import { differentiationInfo } from '../data/differentiationInfo';
import { getEnneagramInfo } from '../utils/calculator';
import EneagramaReportTemplate from '../components/EneagramaReportTemplate';
import './AdvancedAnalysisResult.css';

const EnneagramRing = ({ activeType }) => {
    const radius = 180;
    const innerRadius = 150;
    const centerX = 200;
    const centerY = 200;

    const getTriadColor = (type) => {
        const t = parseInt(type);
        if ([8, 9, 1].includes(t)) return '#E74C3C'; // Red (Gut)
        if ([2, 3, 4].includes(t)) return '#2ECC71'; // Green (Heart)
        if ([5, 6, 7].includes(t)) return '#3498DB'; // Blue (Head)
        return '#ccc';
    };

    const types = ['9', '1', '2', '3', '4', '5', '6', '7', '8'];

    return (
        <div className="enneagram-ring-svg-wrapper">
            <svg viewBox="0 0 400 400" className="enneagram-ring-svg" style={{ overflow: 'visible' }}>
                <defs>
                    {/* Filter for a soft glow on the active segment */}
                    <filter id="activeGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feComponentTransfer in="blur">
                            <feFuncA type="linear" slope="1.5" />
                        </feComponentTransfer>
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Golden Background Elements: Broken Lines & Angles */}
                <g className="background-geometry" style={{ opacity: 0.3 }}>
                    {/* Top Horizontal Lines */}
                    <line x1="-150" y1="40" x2="70" y2="40" stroke="#9e7b22" strokeWidth="1.5" />
                    <line x1="330" y1="40" x2="550" y2="40" stroke="#9e7b22" strokeWidth="1.5" />

                    {/* Bottom Horizontal Lines */}
                    <line x1="-150" y1="360" x2="70" y2="360" stroke="#9e7b22" strokeWidth="1.5" />
                    <line x1="330" y1="360" x2="550" y2="360" stroke="#9e7b22" strokeWidth="1.5" />

                    {/* Left Diagonal Angle */}
                    <polyline points="70,40 -30,200 70,360" fill="none" stroke="#9e7b22" strokeWidth="1.5" />

                    {/* Right Diagonal Angle */}
                    <polyline points="330,40 430,200 330,360" fill="none" stroke="#9e7b22" strokeWidth="1.5" />
                </g>

                {types.map((type, index) => {
                    const startAngle = (index * 40 - 20) * (Math.PI / 180);
                    const endAngle = ((index + 1) * 40 - 20) * (Math.PI / 180);

                    const x1 = centerX + radius * Math.sin(startAngle);
                    const y1 = centerY - radius * Math.cos(startAngle);
                    const x2 = centerX + radius * Math.sin(endAngle);
                    const y2 = centerY - radius * Math.cos(endAngle);

                    const iX1 = centerX + innerRadius * Math.sin(startAngle);
                    const iY1 = centerY - innerRadius * Math.cos(startAngle);
                    const iX2 = centerX + innerRadius * Math.sin(endAngle);
                    const iY2 = centerY - innerRadius * Math.cos(endAngle);

                    const isActive = type === activeType;
                    const color = getTriadColor(type);

                    const pathData = `
                        M ${iX1} ${iY1}
                        L ${x1} ${y1}
                        A ${radius} ${radius} 0 0 1 ${x2} ${y2}
                        L ${iX2} ${iY2}
                        A ${innerRadius} ${innerRadius} 0 0 0 ${iX1} ${iY1}
                    `.replace(/\s+/g, ' ');

                    const textRadius = (radius + innerRadius) / 2;
                    const tx = centerX + textRadius * Math.sin((startAngle + endAngle) / 2);
                    const ty = centerY - textRadius * Math.cos((startAngle + endAngle) / 2);

                    return (
                        <g key={type} className={`ring-segment ${isActive ? 'active' : 'dimmed'}`}>
                            <path
                                d={pathData}
                                fill={isActive ? color : '#1a2228'}
                                stroke={isActive ? color : '#2a353d'}
                                strokeWidth={isActive ? "2" : "1"}
                                fillOpacity={isActive ? 1 : 0.6}
                                filter={isActive ? 'url(#activeGlow)' : 'none'}
                                style={{ transition: 'all 0.5s ease' }}
                            />
                            <text
                                x={tx}
                                y={ty}
                                fill={isActive ? 'white' : 'rgba(255,255,255,0.4)'}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize={isActive ? "17" : "14"}
                                fontWeight="900"
                                style={{ transition: 'all 0.5s ease' }}
                            >
                                {type}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

const ScoreModal = ({ isOpen, onClose, results }) => {
    if (!isOpen) return null;

    const sortedResults = [...results].sort((a, b) => b.score - a.score);
    const maxScore = Math.max(...results.map(r => r.score));

    return (
        <div className="score-modal-overlay" onClick={onClose}>
            <div className="score-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    <X size={24} />
                </button>
                <div className="modal-header">
                    <h2 className="modal-title">Puntajes por eneatipo</h2>
                    <p className="modal-subtitle">Tu configuración energética detallada</p>
                </div>
                <div className="score-bars-container">
                    {sortedResults.map((res, index) => (
                        <div key={res.type} className="score-bar-row">
                            <div className="score-bar-info">
                                <div className="score-bar-labels">
                                    <span className="score-bar-type">Tipo {res.type}</span>
                                    <span className="score-bar-name">{res.name}</span>
                                </div>
                            </div>
                            <div className="score-bar-visual">
                                <div className="score-bar-track-wrapper">
                                    <div className="score-bar-track">
                                        <div
                                            className="score-bar-fill"
                                            style={{
                                                width: `${(res.score / maxScore) * 100}%`,
                                                background: index < 3 ? '#ddbe3d' : '#547689'
                                            }}
                                        ></div>
                                    </div>
                                </div>
                                <span className="score-bar-pts">{res.score}pts</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="modal-footer">
                    <button className="modal-back-btn" onClick={onClose}>
                        <ArrowLeft size={18} />
                        Regresar
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdvancedAnalysisResult = ({ result, user: propUser }) => {
    const navigate = useNavigate();
    const { type: urlType } = useParams();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = React.useState(false);
    const [isDownloadingKit, setIsDownloadingKit] = React.useState(false);
    const [downloadProgress, setDownloadProgress] = React.useState(0);
    const [totalPages, setTotalPages] = React.useState(0);
    const [hasPaidForKit, setHasPaidForKit] = React.useState(false);
    const [showAdvancedProgram, setShowAdvancedProgram] = React.useState(true);

    const [localResult, setLocalResult] = React.useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);

        // Check if user has explicitly bought the Executive Kit order bump
        const purchasedKit = localStorage.getItem('hasPaidForKit') === 'true';
        if (purchasedKit) {
            setHasPaidForKit(true);
        }

        // Check if Advanced Program should be hidden (test mode)
        const hideProgram = localStorage.getItem('hideAdvancedProgram') === 'true';
        const isPartner = localStorage.getItem('partner_source');
        if (hideProgram || isPartner) {
            setShowAdvancedProgram(false);
        }

        // Load result from localStorage if not provided via props
        if (!result) {
            const stored = localStorage.getItem('enneagramAdvancedResult');
            if (stored) {
                try {
                    setLocalResult(JSON.parse(stored));
                } catch (e) {
                    console.error('Error parsing stored advanced result', e);
                }
            }
        }
    }, [result]);

    // Determine the result to use
    const activeResult = result || localResult;

    // Determine the type and result to display
    const type = urlType || activeResult?.confirmedType;
    const user = propUser || { name: 'Eduardo Ruiz' };

    console.log('AdvancedAnalysisResult: Init', { type, user, result });

    if (!type || !advancedEnneagramInfo[type]) {
        console.warn('AdvancedAnalysisResult: Invalid type', type);
        return (
            <div className="advanced-result-page">
                <div className="advanced-result-container no-data-view">
                    <h2>No se encontraron resultados</h2>
                    <p>Por favor, realiza el análisis avanzado primero.</p>
                    <button onClick={() => navigate('/eneagrama')} className="btn-advanced-finish btn-deepen-primary">
                        Ir al inicio
                    </button>
                </div>
            </div>
        );
    }

    const details = advancedEnneagramInfo[type];
    const basicInfo = getEnneagramInfo(type);

    // Create a normalized result if missing (for public links)
    const displayResult = result || {
        confirmedType: type,
        winner: {
            type: type,
            name: basicInfo.name,
            image: basicInfo.image
        }
    };

    // Ensure winner matches displayResult or basicInfo fallback
    const winner = {
        ...displayResult.winner,
        image: displayResult.winner?.image || basicInfo.image,
        name: displayResult.winner?.name || basicInfo.name
    };

    console.log('AdvancedAnalysisResult: Render Data', { details, winner });

    // Get the runner-ups (top 2 rivals) for differentiation
    const rivals = (activeResult?.results || [])
        .filter(r => r.type !== type.toString())
        .sort((a, b) => b.score - a.score)
        .slice(0, 2);

    const shareRef = React.useRef(null);
    const reportTemplateRef = React.useRef(null);

    const handleDownloadPDF = async () => {
        if (!reportTemplateRef.current || isDownloadingPdf) return;
        setIsDownloadingPdf(true);

        try {
            const template = reportTemplateRef.current;
            
            // Show template temporarily (it's at left -9999px)
            template.style.left = '0';
            template.style.opacity = '1';
            
            await new Promise(resolve => setTimeout(resolve, 200)); // Allow styles to apply
            
            const originalScrollY = window.scrollY;
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = 210;
            const pdfHeight = 297;
            
            // Collect all pdf pages from the template
            const pages = template.querySelectorAll('.pdf-page');
            
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const canvas = await html2canvas(page, {
                    backgroundColor: '#ffffff',
                    scale: 2.5,
                    useCORS: true,
                    width: 800,
                    height: 1131
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.92);
                
                if (i > 0) {
                    pdf.addPage();
                }
                
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            }

            // Hide template again
            template.style.left = '-9999px';
            window.scrollTo({ top: originalScrollY, left: 0, behavior: 'instant' });

            pdf.save(`Reporte-Eneatipo-${type}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Hubo un error al generar el reporte PDF.');
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    const handleDownloadExecutiveKit = () => {
        if (isDownloadingKit) return;
        setIsDownloadingKit(true);
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = `/pdfs/Plan-de-Accion-Eneatipo-${type}.pdf`;
            link.download = `Plan-de-Accion-Eneatipo-${type}.pdf`;
            link.click();
            setIsDownloadingKit(false);
        }, 800);
    };

    const handleShare = async () => {
        if (!shareRef.current) return;

        try {
            const canvas = await html2canvas(shareRef.current, {
                backgroundColor: '#ffffff',
                scale: 3,
                useCORS: true,
                onclone: (clonedDoc) => {
                    const clonedWrapper = clonedDoc.querySelector('.share-content-wrapper');
                    const clonedHero = clonedDoc.querySelector('.advanced-hero');
                    const shareClonedDescription = clonedDoc.querySelector('.description-section');
                    const shareClonedPhrase = clonedDoc.querySelector('.phrase-section');
                    const coinHint = clonedDoc.querySelector('.advanced-coin-hint');

                    if (clonedWrapper) {
                        clonedWrapper.style.background = '#ffffff';
                        clonedWrapper.style.padding = '40px 20px';
                        clonedWrapper.style.width = '100%';
                        clonedWrapper.style.maxWidth = '600px';
                        clonedWrapper.style.margin = '0 auto';
                    }

                    if (clonedHero) {
                        clonedHero.style.marginBottom = '20px';
                        clonedHero.style.padding = '0';

                        // Fix title breaking
                        const heroTitle = clonedHero.querySelector('.advanced-hero-title');
                        const profileText = clonedHero.querySelector('.profile-text-title');

                        if (heroTitle) {
                            heroTitle.style.letterSpacing = '1px'; // Reduce spacing to fit
                        }
                        if (profileText) {
                            profileText.style.whiteSpace = 'nowrap'; // Force single line
                        }
                    }

                    if (shareClonedDescription) {
                        shareClonedDescription.style.setProperty('box-shadow', 'none', 'important');
                        shareClonedDescription.style.setProperty('background', '#0d2535', 'important');
                        shareClonedDescription.style.setProperty('background-color', '#0d2535', 'important');
                        shareClonedDescription.style.setProperty('border', '1px solid rgba(221, 190, 61, 0.2)', 'important');
                        shareClonedDescription.style.setProperty('border-left', '5px solid #ddbe3d', 'important');
                        shareClonedDescription.style.setProperty('margin', '0 0 30px 0', 'important');
                        shareClonedDescription.style.setProperty('animation', 'none', 'important');
                        shareClonedDescription.style.setProperty('transition', 'none', 'important');
                        shareClonedDescription.style.setProperty('color', '#ffffff', 'important');

                        const text = shareClonedDescription.querySelector('.description-text');
                        if (text) text.style.setProperty('color', '#ffffff', 'important');

                        const label = shareClonedDescription.querySelector('.description-label');
                        if (label) label.style.setProperty('color', '#ddbe3d', 'important');
                    }

                    if (shareClonedPhrase) {
                        shareClonedPhrase.style.setProperty('box-shadow', 'none', 'important');
                        shareClonedPhrase.style.setProperty('background', '#0d2535', 'important');
                        shareClonedPhrase.style.setProperty('background-color', '#0d2535', 'important');
                        shareClonedPhrase.style.setProperty('border', '1px solid rgba(221, 190, 61, 0.2)', 'important');
                        shareClonedPhrase.style.setProperty('border-left', '5px solid #ddbe3d', 'important');
                        shareClonedPhrase.style.setProperty('margin', '0 0 30px 0', 'important');
                        shareClonedPhrase.style.setProperty('animation', 'none', 'important');
                        shareClonedPhrase.style.setProperty('transition', 'none', 'important');
                        shareClonedPhrase.style.setProperty('color', '#ffffff', 'important');

                        const text = shareClonedPhrase.querySelector('.phrase-text');
                        if (text) text.style.setProperty('color', '#ffffff', 'important');

                        const label = shareClonedPhrase.querySelector('strong');
                        if (label) label.style.setProperty('color', '#ddbe3d', 'important');
                    }

                    const advancedSections = clonedDoc.querySelectorAll('.advanced-section');
                    advancedSections.forEach(section => {
                        section.style.setProperty('background', '#0d2535', 'important');
                        section.style.setProperty('background-color', '#0d2535', 'important');
                        section.style.setProperty('color', '#ffffff', 'important');
                        section.style.setProperty('animation', 'none', 'important');
                        section.style.setProperty('transition', 'none', 'important');
                    });

                    const footerActions = clonedDoc.querySelector('.advanced-footer-actions');
                    const kitPromo = clonedDoc.querySelector('.executive-kit-promo');
                    const brandFooter = clonedDoc.querySelector('.detailed-brand-footer');

                    if (coinHint) coinHint.style.display = 'none';
                    if (footerActions) footerActions.style.display = 'none';
                    if (kitPromo) kitPromo.style.display = 'none';
                    if (brandFooter) brandFooter.style.display = 'none';
                }
            });

            const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const imageFile = new File([imageBlob], `mi-perfil-autentico-${type}.png`, { type: 'image/png' });

            const shareData = {
                title: `Mi Perfil Auténtico: Eneatipo ${type}`,
                text: `He completado mi análisis avanzado de Eneagrama. Soy Eneatipo ${type} - ${winner.name}.\n\n¡Descubre el tuyo en https://enesencia.autenticos.co`,
                files: [imageFile],
            };

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
                await navigator.share(shareData);
            } else {
                // Fallback download
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = `mi-perfil-autentico-${type}.png`;
                link.click();
                alert('La imagen se ha descargado porque tu navegador no soporta compartir imágenes directamente.');
            }

        } catch (error) {
            console.error('Error sharing image:', error);
            // Fallback text
            if (navigator.share) {
                navigator.share({
                    title: `Mi Perfil Auténtico: Eneatipo ${type}`,
                    text: `He completado mi análisis avanzado de Eneagrama. Soy Eneatipo ${type} - ${winner.name}.\n\n¡Descubre el tuyo en https://enesencia.autenticos.co`,
                    // url property removed to avoid duplication
                }).catch(console.error);
            } else {
                navigator.clipboard.writeText(`He completado mi análisis avanzado de Eneagrama. Soy Eneatipo ${type} - ${winner.name}.\n\n¡Descubre el tuyo en https://enesencia.autenticos.co`);
                alert('¡Texto copiado al portapapeles!');
            }
        }
    };

    return (
        <>
            <EneagramaReportTemplate 
                ref={reportTemplateRef} 
                type={type} 
                details={details} 
                basicInfo={basicInfo} 
                winner={winner} 
                rivals={rivals} 
                user={user} 
            />
            <div className="advanced-result-page">
            <div className="advanced-result-container">
                <div id="advanced-report-content">
                    <div ref={shareRef} className="share-content-wrapper pdf-export-page">
                        {/* Hero Section */}
                        <section className="advanced-hero">
                            <h1 className="advanced-hero-title">
                                {user?.name && <span className="user-name-title">{String(user.name).toLowerCase()}</span>}
                                <span className="profile-text-title">
                                    Tu perfil dominante es:
                                </span>
                            </h1>
                            <p className="advanced-hero-subtitle">
                                Eneatipo {type} — {winner.name}
                            </p>

                            <div className="advanced-coin-wrapper">
                                <EnneagramRing activeType={type} />
                                <div
                                    className={`advanced-coin-container ${activeResult?.results ? 'clickable' : ''}`}
                                    onClick={() => activeResult?.results && setIsModalOpen(true)}
                                    title={activeResult?.results ? "Ver puntajes detallados" : ""}
                                >
                                    <img
                                        src={winner.image ? encodeURI(winner.image) : "/logo-moneda.png"}
                                        alt={`Eneatipo ${type}`}
                                        className="advanced-coin-img"
                                        crossOrigin="anonymous"
                                    />
                                </div>
                            </div>

                            {activeResult?.results && (
                                <div
                                    className="advanced-coin-hint"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    <MousePointerClick size={18} />
                                    <span>Toca el grafico para ver puntajes</span>
                                </div>
                            )}
                        </section>

                        {/* Section: Brief Description */}
                        <div className="description-section">
                            <div className="description-content">
                                <Info className="description-info-icon" size={20} />
                                <div className="description-text-wrapper">
                                    <strong className="description-label">Una breve descripción:</strong>
                                    <p className="description-text">{details.description}</p>
                                </div>
                            </div>
                        </div>

                        {/* Section: Internal Phrase */}
                        <div className="phrase-section">
                            <div className="phrase-content">
                                <Quote className="phrase-quote-icon" size={20} />
                                <p className="phrase-text">
                                    <strong>Frase interna que suele repetirse:</strong> {details.phrase}
                                </p>
                            </div>
                        </div>
                    </div>

                    {activeResult?.results && (
                        <ScoreModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            results={activeResult.results || []}
                        />
                    )}

                    <div className="pdf-export-page">
                        {/* Section 1: Motivations */}
                        <section className="advanced-section">
                            <div className="section-header">
                                <Target className="section-icon" size={24} />
                                <h2 className="section-title">Motivaciones Centrales</h2>
                            </div>
                            <div className="motivation-grid">
                                <div className="motivation-item">
                                    <span className="motivation-label">Miedo Básico</span>
                                    <p className="motivation-value">{details.motivations.fear}</p>
                                </div>
                                <div className="motivation-item">
                                    <span className="motivation-label">Deseo Básico</span>
                                    <p className="motivation-value">{details.motivations.desire}</p>
                                </div>
                            </div>
                            <p className="motivation-summary">
                                {details.motivations.msg}
                            </p>
                        </section>

                        {/* Section 2: The Triads */}
                        <section className="advanced-section">
                            <div className="section-header">
                                <Layers className="section-icon" size={24} />
                                <h2 className="section-title">Tu Estructura</h2>
                            </div>
                            <div className="triad-list">
                                <div className="triad-row">
                                    <span className="triad-label">Centro de Inteligencia:</span>
                                    <span className="triad-value">{details.triads.center}</span>
                                </div>
                                <div className="triad-row">
                                    <span className="triad-label">Buscas:</span>
                                    <span className="triad-value">{details.triads.seeking}</span>
                                </div>
                                <div className="triad-row">
                                    <span className="triad-label">Estrategia relacional:</span>
                                    <span className="triad-value">{details.triads.social}</span>
                                </div>
                                <div className="triad-row">
                                    <span className="triad-label">Emoción base:</span>
                                    <span className="triad-value">{details.triads.coping}</span>
                                </div>
                            </div>
                            <p className="triad-desc">
                                {details.triads.desc}
                            </p>
                        </section>
                    </div>

                    <div className="pdf-export-page">
                        {/* Section 2.5: Differentiation Analysis */}
                        {rivals.length > 0 && (
                            <section className="advanced-section differentiation-section">
                                <div className="section-header">
                                    <HelpCircle className="section-icon" size={24} />
                                    <h2 className="section-title">Análisis de Diferenciación</h2>
                                </div>
                                <p className="differentiation-intro">
                                    Es común que tu perfil muestre rasgos de otros eneatipos. Aquí te explicamos por qué
                                    <strong> NO </strong> eres los otros tipos que estuvieron cerca en tu puntaje:
                                </p>
                                <div className="differentiation-grid">
                                    {rivals.map((rival) => (
                                        <div key={rival.type} className="differentiation-card">
                                            <div className="diff-card-header">
                                                <div className="diff-badge winner-badge">T{type}</div>
                                                <span className="diff-vs">vs</span>
                                                <div className="diff-badge rival-badge">T{rival.type}</div>
                                            </div>
                                            <div className="diff-card-body">
                                                <h4 className="diff-rival-name">¿Por qué no Eneatipo {rival.type}?</h4>
                                                <p className="diff-text">
                                                    {differentiationInfo[type]?.[rival.type] ||
                                                        `Aunque compartes intensidad con el tipo ${rival.type}, tu motivación profunda de ${winner.name} prevalece.`}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Section 3: Growth & Stress */}
                        <section className="advanced-section">
                            <div className="section-header">
                                <TrendingUp className="section-icon" size={24} />
                                <h2 className="section-title">Dinámica de Crecimiento</h2>
                            </div>
                            <ul className="advice-list">
                                <li className="advice-item">
                                    <div className="advice-bullet" style={{ background: '#2ECC71' }}><TrendingUp size={14} /></div>
                                    <div className="advice-text">
                                        {details.paths.growth.includes(':') ? (
                                            <>
                                                <strong style={{ color: '#ddbe3d' }}>{details.paths.growth.split(':')[0]}:</strong>
                                                {details.paths.growth.split(':')[1]}
                                            </>
                                        ) : details.paths.growth}
                                    </div>
                                </li>
                                <li className="advice-item">
                                    <div className="advice-bullet" style={{ background: '#E74C3C' }}><TrendingUp size={14} style={{ transform: 'rotate(180deg)' }} /></div>
                                    <div className="advice-text">
                                        {details.paths.stress.includes(':') ? (
                                            <>
                                                <strong style={{ color: '#ddbe3d' }}>{details.paths.stress.split(':')[0]}:</strong>
                                                {details.paths.stress.split(':')[1]}
                                            </>
                                        ) : details.paths.stress}
                                    </div>
                                </li>
                            </ul>
                            <p className="motivation-summary" style={{ marginTop: '20px' }}>
                                {details.paths.msg.includes(':') ? (
                                    <>
                                        <strong style={{ color: '#ddbe3d' }}>{details.paths.msg.split(':')[0]}:</strong>
                                        {details.paths.msg.split(':')[1]}
                                    </>
                                ) : details.paths.msg}
                            </p>
                        </section>
                    </div>

                    <div className="pdf-export-page">
                        {/* Section 3.2: Automatic Pattern */}
                        {details.automaticPattern && (
                            <section className="advanced-section pattern-section">
                                <div className="section-header">
                                    <Zap className="section-icon" size={24} />
                                    <h2 className="section-title">Tu Patrón Automático en 5 Pasos</h2>
                                </div>
                                <div className="pattern-grid">
                                    <div className="pattern-column activators-column">
                                        <h4 className="pattern-column-title">Lo que más te activa:</h4>
                                        <ul className="pattern-list">
                                            {details.automaticPattern.activators.map((item, idx) => (
                                                <li key={idx} className="pattern-item">
                                                    <div className="pattern-dot" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="pattern-column responses-column">
                                        <h4 className="pattern-column-title">Ante lo inesperado, sueles:</h4>
                                        <ul className="pattern-list">
                                            {details.automaticPattern.responses.map((item, idx) => (
                                                <li key={idx} className="pattern-item">
                                                    <Activity size={14} className="pattern-icon-activity" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Section 3.3: Body Impact */}
                        {details.bodyImpact && (
                            <section className="advanced-section body-impact-section">
                                <div className="section-header">
                                    <Wind className="section-icon" size={24} />
                                    <h2 className="section-title">Impacto en el Cuerpo</h2>
                                </div>
                                <div className="body-impact-content">
                                    <p className="body-impact-intro">{details.bodyImpact.intro}</p>
                                    <div className="body-impact-grid">
                                        {details.bodyImpact.items.map((item, idx) => (
                                            <div key={idx} className="body-impact-item">
                                                <div className="body-impact-dot" />
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>

                    <div className="pdf-export-page">
                        {/* Section 3.5: Leadership Style */}
                        {details.leadershipStyle && (
                            <section className="advanced-section leadership-style-section">
                                <div className="section-header">
                                    <Shield className="section-icon" size={24} />
                                    <h2 className="section-title">Tu Estilo de Liderazgo</h2>
                                </div>
                                <div className="leadership-style-grid">
                                    <div className="style-column strengths-column">
                                        <h4 className="style-column-title">Fortalezas:</h4>
                                        <ul className="style-list">
                                            {details.leadershipStyle?.strengths?.map((item, idx) => (
                                                <li key={idx} className="style-item">
                                                    <Check size={16} className="style-icon-check" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="style-column risks-column">
                                        <h4 className="style-column-title">Riesgos:</h4>
                                        <ul className="style-list">
                                            {details.leadershipStyle?.risks?.map((item, idx) => (
                                                <li key={idx} className="style-item">
                                                    <AlertTriangle size={16} className="style-icon-alert" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                {details.leadershipStyle?.footer && (
                                    <p className="leadership-footer" style={{
                                        marginTop: '25px',
                                        fontStyle: 'italic',
                                        color: 'rgba(255, 255, 255, 0.75)',
                                        textAlign: 'center'
                                    }}>
                                        {details.leadershipStyle.footer}
                                    </p>
                                )}
                            </section>
                        )}

                        {/* Section 4: Actionable Advice (Fall back to legacy section) */}
                        {details.leadership && (
                            <section className="advanced-section">
                                <div className="section-header">
                                    <Lightbulb className="section-icon" size={24} />
                                    <h2 className="section-title">Consejos para el Liderazgo</h2>
                                </div>
                                <div className="advice-list">
                                    {details.leadership.map((item, idx) => (
                                        <div key={idx} className="advice-item">
                                            <div className="advice-bullet"><CheckCircle2 size={14} /></div>
                                            <div className="advice-text">{item}</div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Actions Footer */}
                    <div className="advanced-footer-actions">
                        <button
                            onClick={() => window.location.href = `https://www.autenticos.co/eneagrama-eneatipo-${type}`}
                            className="btn-advanced-finish btn-blue-gold"
                        >
                            Profundizar en mi perfil
                        </button>

                        <div className="footer-bottom-row">
                            <button
                                onClick={() => navigate('/eneagrama')}
                                className="btn-advanced-finish btn-back-alt"
                            >
                                <ArrowLeft size={18} /> Regresar
                            </button>
                            <button
                                onClick={handleDownloadPDF}
                                className={`btn-advanced-finish btn-download-pdf ${isDownloadingPdf ? 'loading' : ''}`}
                                title="Descargar Reporte PDF"
                                disabled={isDownloadingPdf}
                            >
                                {isDownloadingPdf ? <Loader2 size={18} className="spinner" /> : <Download size={18} />}
                                <span>{isDownloadingPdf ? 'Generando...' : 'PDF'}</span>
                            </button>
                            <button
                                onClick={handleShare}
                                className="btn-advanced-finish btn-share-main"
                            >
                                <span>Compartir</span> <Share2 size={18} />
                            </button>
                        </div>

                        {/* Order Bump Section: Executive Kit - CONDITIONALLY RENDERED */}
                        {hasPaidForKit && (
                            <div className="executive-kit-promo">
                                <div className="kit-promo-content">
                                    <div className="kit-title-shimmer">
                                        <h3>Tu Plan de Acción</h3>
                                    </div>
                                    <p>Liderazgo estratégico según tu eneatipo. Informe de 13 páginas con planes de acción y protocolos corporativos.</p>
                                    <button
                                        onClick={handleDownloadExecutiveKit}
                                        className={`btn-kit-download ${isDownloadingKit ? 'loading' : ''}`}
                                        disabled={isDownloadingKit}
                                    >
                                        {isDownloadingKit ? (
                                            <>
                                                <Loader2 size={18} className="spinner" />
                                                {downloadProgress > 0 && totalPages > 0
                                                    ? `Generando página ${downloadProgress} de ${totalPages}...`
                                                    : 'Preparando documento...'}
                                            </>
                                        ) : (
                                            <>
                                                <Download size={18} /> Descargar mi Plan de Acción
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                        {showAdvancedProgram && (
                            <div className="executive-kit-promo" style={{ marginTop: '20px', background: 'linear-gradient(135deg, #002d44 0%, #001a29 100%)', border: '1px solid rgba(221, 190, 61, 0.4)' }}>
                                <div className="kit-promo-content">
                                    <div className="kit-title-shimmer">
                                        <h3 style={{ color: '#050e14' }}>Programa avanzado</h3>
                                    </div>
                                    <h4 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '10px', marginTop: '10px' }}>Transforma tu patrón de personalidad</h4>
                                    <p style={{ color: '#ffffff' }}>Aprende a utilizar tu eneatipo para mejorar tu toma de decisiones y liderar con propósito en este programa exclusivo.</p>
                                    <button
                                        onClick={() => navigate('/programa-genuinos')}
                                        className="btn-advanced-finish btn-deepen-primary"
                                        style={{ width: '100%', maxWidth: '100%', marginTop: '15px' }}
                                    >
                                        Explorar el programa <Rocket size={18} style={{ marginLeft: '10px' }} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Order Bump Section: Plan de Acción - Show if NOT paid */}
                        {!hasPaidForKit && (
                            <div className="order-bump-container" style={{ marginTop: '40px', background: '#002d44', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(221, 190, 61, 0.4)', textAlign: 'left', width: '100%', maxWidth: '500px' }}>
                                <div className="order-bump-header-image" style={{ width: '100%', position: 'relative' }}>
                                    <img src="/Portada - Plan de Acción-1.jpg" alt="Plan de Acción" className="order-bump-full-image" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
                                    <div className="order-bump-badge" style={{ position: 'absolute', top: '15px', left: '20px', background: '#ddbe3d', color: '#002d44', padding: '6px 16px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '1.5px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)' }}>OPCIONAL PLAN DE ACCIÓN</div>
                                </div>

                                <div className="order-bump-content" style={{ padding: '30px' }}>
                                    <h2 className="order-bump-title" style={{ color: '#ffffff', fontSize: '1.45rem', fontWeight: '800', lineHeight: '1.3', marginBottom: '12px' }}>Convierte tu resultado en un Plan de Acción</h2>
                                    <p className="order-bump-subtitle" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem', lineHeight: '1.4', marginBottom: '20px' }}>Aplica tu resultado en decisiones estratégicas concretas</p>

                                    <div className="order-bump-divider" style={{ height: '1px', background: 'rgba(255, 255, 255, 0.15)', margin: '20px 0' }}></div>

                                    <ul className="order-bump-benefits" style={{ listStyle: 'none', padding: 0, margin: '0 0 25px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ffffff', fontSize: '0.95rem', fontWeight: '500' }}><span style={{ color: '#ddbe3d', fontWeight: '900' }}>✔</span> Plan de implementación de 30 días</li>
                                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ffffff', fontSize: '0.95rem', fontWeight: '500' }}><span style={{ color: '#ddbe3d', fontWeight: '900' }}>✔</span> Matriz de decisiones estratégicas</li>
                                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ffffff', fontSize: '0.95rem', fontWeight: '500' }}><span style={{ color: '#ddbe3d', fontWeight: '900' }}>✔</span> Protocolo bajo presión</li>
                                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ffffff', fontSize: '0.95rem', fontWeight: '500' }}><span style={{ color: '#ddbe3d', fontWeight: '900' }}>✔</span> Guia para conversaciones difíciles</li>
                                    </ul>

                                    <div className="order-bump-pricing-area" style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        <span className="order-bump-old-price" style={{ color: 'rgba(255, 255, 255, 0.4)', textDecoration: 'line-through', fontSize: '1rem' }}>$30.000</span>
                                        <div className="order-bump-current-price-row" style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                                            <span className="order-bump-new-price" style={{ color: '#ddbe3d', fontSize: '2.2rem', fontWeight: '800' }}>
                                                $15.000
                                            </span>
                                            <span className="order-bump-currency-white" style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: '600', opacity: 0.9 }}>COP</span>
                                        </div>
                                    </div>
                                    <p className="order-bump-price-bottom-note" style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>Pago único · Acceso inmediato</p>
                                    
                                    <button 
                                        onClick={() => navigate('/eneagrama-payment?mode=plan')}
                                        className="btn-advanced-finish btn-deepen-primary"
                                        style={{ width: '100%', maxWidth: '100%', marginTop: '25px' }}
                                    >
                                        Adquirir mi Plan de Acción
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Brand footer */}
                        <div className="detailed-brand-footer">
                            <img
                                src="/Logo-Blanco.png"
                                alt="Logo Auténticos Blanco"
                                className="register-footer-logo"
                            />
                        </div>

                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default AdvancedAnalysisResult;
