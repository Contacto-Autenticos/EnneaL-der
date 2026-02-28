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
    Loader2
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { executiveKitData } from '../data/executiveKitInfo';
import ExecutiveKitTemplate from '../components/ExecutiveKitTemplate';
import { advancedEnneagramInfo } from '../data/advancedInfo';
import { differentiationInfo } from '../data/differentiationInfo';
import { getEnneagramInfo } from '../utils/calculator';
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
            <svg viewBox="0 0 400 400" className="enneagram-ring-svg">
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

    const maxScore = Math.max(...results.map(r => r.score));

    return (
        <div className="score-modal-overlay" onClick={onClose}>
            <div className="score-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    <X size={24} />
                </button>
                <h2 className="modal-title">Puntajes por eneatipo</h2>
                <div className="score-bars-container">
                    {results.map((res) => (
                        <div key={res.type} className="score-bar-row">
                            <div className="score-bar-info">
                                <span className="score-bar-type">Tipo {res.type}</span>
                                <span className="score-bar-name">{res.name}</span>
                            </div>
                            <div className="score-bar-track">
                                <div
                                    className="score-bar-fill"
                                    style={{ width: `${(res.score / maxScore) * 100}% ` }}
                                ></div>
                            </div>
                            <span className="score-bar-pts">{res.score}pts</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const AdvancedAnalysisResult = ({ result, user: propUser }) => {
    const navigate = useNavigate();
    const { type: urlType } = useParams();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isDownloadingKit, setIsDownloadingKit] = React.useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Determine the type and result to display
    const type = urlType || result?.confirmedType;
    const user = propUser || { name: '' };

    console.log('AdvancedAnalysisResult: Init', { type, user, result });

    if (!type || !advancedEnneagramInfo[type]) {
        console.warn('AdvancedAnalysisResult: Invalid type', type);
        return (
            <div className="advanced-result-page">
                <div className="advanced-result-container no-data-view">
                    <h2>No se encontraron resultados</h2>
                    <p>Por favor, realiza el análisis avanzado primero.</p>
                    <button onClick={() => navigate('/')} className="btn-advanced-finish btn-deepen-primary">
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
    const rivals = (result?.results || [])
        .filter(r => r.type !== type.toString())
        .sort((a, b) => b.score - a.score)
        .slice(0, 2);

    const shareRef = React.useRef(null);

    const handleDownloadPDF = async () => {
        const reportElement = document.getElementById('advanced-report-content');
        if (!reportElement) return;

        try {
            const canvas = await html2canvas(reportElement, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true,
                onclone: (clonedDoc) => {
                    const clonedContent = clonedDoc.getElementById('advanced-report-content');
                    const clonedHero = clonedDoc.querySelector('.advanced-hero');
                    const clonedPhrase = clonedDoc.querySelector('.phrase-section');
                    const footerActions = clonedDoc.querySelector('.advanced-footer-actions');
                    const kitPromo = clonedDoc.querySelector('.executive-kit-promo');
                    const brandFooter = clonedDoc.querySelector('.detailed-brand-footer');

                    if (clonedContent) {
                        clonedContent.style.padding = '40px';
                        clonedContent.style.background = '#ffffff';
                        clonedContent.style.width = '210mm';
                        clonedContent.style.margin = '0 auto';
                    }

                    if (clonedHero) {
                        const heroTitle = clonedHero.querySelector('.advanced-hero-title');
                        const profileText = clonedHero.querySelector('.profile-text-title');
                        const userName = clonedHero.querySelector('.user-name-title');

                        if (heroTitle) heroTitle.style.color = '#002d44';
                        if (profileText) profileText.style.color = '#002d44';
                        if (userName) userName.style.color = '#002d44';
                    }

                    if (clonedPhrase) {
                        clonedPhrase.style.setProperty('background', '#0d2535', 'important');
                        clonedPhrase.style.setProperty('background-color', '#0d2535', 'important');
                        clonedPhrase.style.setProperty('color', '#ffffff', 'important');
                        clonedPhrase.style.setProperty('animation', 'none', 'important');
                        clonedPhrase.style.setProperty('transition', 'none', 'important');

                        const text = clonedPhrase.querySelector('.phrase-text');
                        if (text) text.style.setProperty('color', '#ffffff', 'important');

                        const label = clonedPhrase.querySelector('strong');
                        if (label) label.style.setProperty('color', '#ddbe3d', 'important');
                    }

                    // Also force other sections to be dark blue and disable animations
                    const advancedSections = clonedDoc.querySelectorAll('.advanced-section');
                    advancedSections.forEach(section => {
                        section.style.setProperty('background', '#0d2535', 'important');
                        section.style.setProperty('background-color', '#0d2535', 'important');
                        section.style.setProperty('color', '#ffffff', 'important');
                        section.style.setProperty('animation', 'none', 'important');
                        section.style.setProperty('transition', 'none', 'important');

                        const sectionTitle = section.querySelector('.section-title');
                        if (sectionTitle) sectionTitle.style.setProperty('color', '#ffffff', 'important');
                    });

                    if (footerActions) footerActions.style.display = 'none';
                    if (kitPromo) kitPromo.style.display = 'none';
                    if (brandFooter) brandFooter.style.display = 'none';
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

            if (imgHeight > pdfHeight) {
                const longPdf = new jsPDF('p', 'mm', [pdfWidth, imgHeight]);
                longPdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
                longPdf.save(`Reporte-Eneagrama-Tipo-${type}.pdf`);
            } else {
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
                pdf.save(`Reporte-Eneagrama-Tipo-${type}.pdf`);
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Hubo un error al generar el PDF.');
        }
    };

    const handleDownloadExecutiveKit = async () => {
        const kitRoot = document.getElementById('executive-kit-printable');
        if (!kitRoot || isDownloadingKit) return;

        try {
            setIsDownloadingKit(true);
            // Show the hidden container for capturing
            kitRoot.style.display = 'block';
            kitRoot.style.position = 'absolute';
            kitRoot.style.left = '-9999px';
            kitRoot.style.top = '0';

            const pages = kitRoot.querySelectorAll('.kit-page');
            const pdf = new jsPDF('p', 'mm', 'a4');

            for (let i = 0; i < pages.length; i++) {
                const canvas = await html2canvas(pages[i], {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff'
                });

                const imgData = canvas.toDataURL('image/png');
                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
            }

            pdf.save(`Kit-Ejecutivo-Eneagrama-Tipo-${type}.pdf`);
            kitRoot.style.display = 'none';
        } catch (error) {
            console.error('Error generating Executive Kit:', error);
            alert('Hubo un error al generar el Plan de Acción.');
            kitRoot.style.display = 'none';
        } finally {
            setIsDownloadingKit(false);
        }
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
                    const clonedPhrase = clonedDoc.querySelector('.phrase-section');

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

                    if (clonedPhrase) {
                        clonedPhrase.style.setProperty('box-shadow', 'none', 'important');
                        clonedPhrase.style.setProperty('background', '#0d2535', 'important');
                        clonedPhrase.style.setProperty('background-color', '#0d2535', 'important');
                        clonedPhrase.style.setProperty('border', '1px solid rgba(221, 190, 61, 0.2)', 'important');
                        clonedPhrase.style.setProperty('border-left', '5px solid #ddbe3d', 'important');
                        clonedPhrase.style.setProperty('margin', '0 0 30px 0', 'important');
                        clonedPhrase.style.setProperty('animation', 'none', 'important');
                        clonedPhrase.style.setProperty('transition', 'none', 'important');
                        clonedPhrase.style.setProperty('color', '#ffffff', 'important');

                        const text = clonedPhrase.querySelector('.phrase-text');
                        if (text) text.style.setProperty('color', '#ffffff', 'important');

                        const label = clonedPhrase.querySelector('strong');
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
        <div className="advanced-result-page">
            <div className="advanced-result-container">
                <div id="advanced-report-content">
                    <div ref={shareRef} className="share-content-wrapper">
                        {/* Hero Section */}
                        <section className="advanced-hero">
                            <h1 className="advanced-hero-title">
                                {user?.name && <span className="user-name-title">{String(user.name).toUpperCase()}</span>}
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
                                    className={`advanced-coin-container ${result?.results ? 'clickable' : ''}`}
                                    onClick={() => result?.results && setIsModalOpen(true)}
                                    title={result?.results ? "Ver puntajes detallados" : ""}
                                >
                                    <img
                                        src={winner.image ? encodeURI(winner.image) : "/logo-moneda.png"}
                                        alt={`Eneatipo ${type}`}
                                        className="advanced-coin-img"
                                        crossOrigin="anonymous"
                                    />
                                </div>
                            </div>
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

                    {result?.results && (
                        <ScoreModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            results={result.results || []}
                        />
                    )}

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
                                            <strong>{details.paths.growth.split(':')[0]}:</strong>
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
                                            <strong>{details.paths.stress.split(':')[0]}:</strong>
                                            {details.paths.stress.split(':')[1]}
                                        </>
                                    ) : details.paths.stress}
                                </div>
                            </li>
                        </ul>
                        <p className="motivation-summary" style={{ marginTop: '20px' }}>
                            {details.paths.msg}
                        </p>
                    </section>

                    {/* Section 4: Actionable Advice */}
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

                    {/* Actions Footer */}
                    <div className="advanced-footer-actions">
                        <button
                            onClick={() => window.location.href = `https://www.autenticos.co/eneagrama-eneatipo-${type}`}
                            className="btn-advanced-finish btn-deepen-primary"
                        >
                            Profundizar en mi perfil
                        </button>

                        <div className="footer-bottom-row">
                            <button
                                onClick={() => navigate('/')}
                                className="btn-advanced-finish btn-back-alt"
                            >
                                <ArrowLeft size={18} /> Regresar
                            </button>
                            <button
                                onClick={handleDownloadPDF}
                                className="btn-advanced-finish btn-download-pdf"
                                title="Descargar Reporte PDF"
                            >
                                <Download size={18} /> <span>PDF</span>
                            </button>
                            <button
                                onClick={handleShare}
                                className="btn-advanced-finish btn-share-main"
                            >
                                <span>Compartir</span> <Share2 size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Order Bump Section: Executive Kit */}
                    <div className="executive-kit-promo">
                        <div className="kit-promo-content">
                            <h3>Tu Plan de Acción</h3>
                            <p>Liderazgo estratégico según tu eneatipo. Informe de 13 páginas con planes de acción y protocolos corporativos.</p>
                            <button
                                onClick={handleDownloadExecutiveKit}
                                className={`btn-kit-download ${isDownloadingKit ? 'loading' : ''}`}
                                disabled={isDownloadingKit}
                            >
                                {isDownloadingKit ? (
                                    <>
                                        <Loader2 size={18} className="spinner" /> Generando tu Plan de Acción...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={18} /> Descargar mi Plan de Acción
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Brand footer */}
                    <div className="detailed-brand-footer">
                        <img
                            src="/Logo-Blanco.png"
                            alt="Logo Auténticos Blanco"
                            className="register-footer-logo"
                        />
                    </div>

                </div>

                {/* Hidden container for PDF rendering */}
                <div id="executive-kit-printable" style={{ display: 'none' }}>
                    <ExecutiveKitTemplate
                        data={executiveKitData[type]}
                        type={type}
                        name={user?.name}
                    />
                </div>
            </div>
        </div>
    );
};

export default AdvancedAnalysisResult;
