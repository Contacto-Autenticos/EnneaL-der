import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Info, User, Brain, HeartPulse, Handshake, Eye, TrendingUp, Zap, Download, AlertCircle, MessageCircle, Twitter, Linkedin, Lock } from 'lucide-react';
import { fascinantesQuestions, fascinantesDomains, fascinantesInterpretations } from '../data/fascinantesData';
import FascinantesRadar from '../components/FascinantesRadar';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import FascinantesActionPlanTemplate from '../components/FascinantesActionPlanTemplate';
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
    const [isDownloadingActionPlan, setIsDownloadingActionPlan] = useState(false);
    const [showSocialOptions, setShowSocialOptions] = useState(false); // Senior: Better state management for fallback
    const radarRef = React.useRef(null);
    const reportRef = React.useRef(null);
    const actionPlanRef = React.useRef(null);

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

    const getExpertAnalysis = (scores) => {
        if (!scores || scores.length === 0) return null;

        const vals = scores.map(s => s.score);
        const promedio = vals.reduce((a, b) => a + b, 0) / vals.length;
        const max = Math.max(...vals);
        const min = Math.min(...vals);
        const diferencia = max - min;
        const lowestDomain = scores.find(s => s.score === min)?.domain.replace('Dominio ', '') || '';

        let profileKey = "";
        
        // Rules evaluation in order
        if (promedio < 50) {
            profileKey = "POTENCIAL_DORMIDO";
        } else if (diferencia > 20) {
            profileKey = "ESTRATEGA_BLOQUEADO";
        } else if (promedio > 70) {
            profileKey = "OPTIMIZADOR";
        } else if (diferencia <= 10) {
            profileKey = "EQUILIBRADOR";
        } else {
            profileKey = "CONSTANTE_SIN_DIRECCION";
        }

        const profiles = {
            POTENCIAL_DORMIDO: {
                name: "El potencial dormido",
                insight: "Tienes una estructura interna con un potencial inmenso, pero actualmente estás operando en \"modo ahorro\" o supervivencia.",
                critical: `Tu puntuación en el dominio ${lowestDomain} indica una fuga de energía masiva que drena tu capacidad de reacción en los demás dominios.`,
                explanation: "El patrón muestra una falta de bases sólidas. No es falta de capacidad, sino de una estructura que sostenga tus ambiciones. Estás intentando correr sin haber consolidado el suelo que pisas.",
                recommendations: [
                    `Priorizar la recuperación de energía en el dominio ${lowestDomain}.`,
                    "Establecer una rutina mínima viable de 15 minutos diarios.",
                    "Eliminar un compromiso que te reste paz mental hoy mismo."
                ],
                bridge: "Ya identificamos exactamente qué está frenando tu crecimiento. El siguiente paso es trabajar un plan estructurado y personalizado para corregirlo."
            },
            ESTRATEGA_BLOQUEADO: {
                name: "El estratega bloqueado",
                insight: "Eres excelente en áreas específicas, pero un \"punto ciego\" severo está actuando como un ancla, impidiendo que tu éxito sea fluido.",
                critical: `El desbalance en el dominio ${lowestDomain} crea una fricción invisible: cuanto más avanzas en tus fortalezas, más pesado se vuelve este bloqueo.`,
                explanation: "Tienes la mentalidad de logro, pero descuidas el mantenimiento de tu ecosistema vital. Estás intentando ganar una carrera con un motor potente pero una rueda pinchada.",
                recommendations: [
                    "Delegar o sistematizar tareas en tus dominios más fuertes.",
                    `Realizar una "auditoría de fugas" en el dominio ${lowestDomain}.`,
                    "Integrar una pausa activa obligatoria para evaluar prioridades."
                ],
                bridge: "Tu éxito actual es solo una fracción de lo que podrías lograr. Vamos a liberar el ancla con un plan de acción equilibrado."
            },
            OPTIMIZADOR: {
                name: "El optimizador",
                insight: "Estás en el nivel de alto rendimiento, pero a estas alturas, las mejoras ya no son estructurales, sino de sintonía fina y ajustes de elite.",
                critical: `Incluso tú tienes un dominio (${lowestDomain}) que, aunque aceptable, es el único límite entre tu estado actual y la maestría total.`,
                explanation: "Has construido una vida sólida. Tu patrón indica que estás listo para pasar de \"estar bien\" a \"ser extraordinario\". El riesgo aquí es el estancamiento por comodidad.",
                recommendations: [
                    `Identificar el 1% de mejora incremental en el dominio ${lowestDomain}.`,
                    "Buscar un mentor o entorno que desafíe tus estándares actuales.",
                    "Documentar tus procesos para liberar espacio mental creativo."
                ],
                bridge: "Los resultados de elite requieren planes de elite. Vamos a diseñar esos ajustes milimétricos que te llevarán al siguiente nivel."
            },
            EQUILIBRADOR: {
                name: "El equilibrador",
                insight: "Tienes una estabilidad envidiable. Tu vida es armónica, pero es posible que te falte ese \"fuego\" o pico de intensidad necesario para un salto cuántico.",
                critical: `El dominio ${lowestDomain} es tu punto más bajo, pero al ser estable, el riesgo es que pase desapercibido y se convierta en una mediocridad cómoda.`,
                explanation: "El patrón muestra una gestión equilibrada del tiempo y la energía. Sin embargo, el exceso de equilibrio puede llevar a la falta de impacto o dirección clara.",
                recommendations: [
                    "Inyectar una meta ambiciosa y desafiante en tu dominio más fuerte.",
                    `Fortalecer proactivamente el dominio ${lowestDomain} antes de que surja una crisis.`,
                    "Explorar nuevas disciplinas fuera de tu zona de confort actual."
                ],
                bridge: "Tienes el barco estable y el mar en calma. Ahora es el momento de desplegar las velas hacia un destino más ambicioso."
            },
            CONSTANTE_SIN_DIRECCION: {
                name: "El constante sin dirección",
                insight: "Trabajas duro y te mantienes activo, pero sientes que avanzas mucho sin llegar realmente a ninguna parte significativa.",
                critical: `El dominio ${lowestDomain} está absorbiendo recursos que deberían usarse para dar dirección y propósito a tu esfuerzo constante.`,
                explanation: "Tu patrón es el del \"taller abierto\": muchas áreas en mantenimiento pero ninguna terminada de optimizar. Te falta un eje central que unifique tus esfuerzos.",
                recommendations: [
                    "Definir una \"Prioridad Maestra\" para los próximos 90 días.",
                    "Limitar tus frentes de batalla: enfócate solo en 2 dominios clave.",
                    `Establecer indicadores claros de éxito para el dominio ${lowestDomain}.`
                ],
                bridge: "No es falta de esfuerzo, es falta de estrategia. Vamos a canalizar toda esa energía en un plan de acción con una sola dirección: arriba."
            }
        };

        return {
            ...profiles[profileKey],
            promedio: Math.round(promedio),
            diferencia: Math.round(diferencia),
            nivel: promedio < 50 ? "BAJO" : (promedio <= 70 ? "MEDIO" : "ALTO"),
            balance: diferencia <= 10 ? "EQUILIBRADO" : (diferencia <= 20 ? "MODERADO" : "DESEQUILIBRADO")
        };
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
            const element = reportRef.current;
            const captureWidth = 1000;
            // Get actual height to ensure the canvas is large enough
            const captureHeight = element.scrollHeight + 100;

            const canvas = await html2canvas(element, {
                backgroundColor: '#00121d',
                scale: 2.5, // slightly lower for better memory stability on mobile
                useCORS: true,
                imageTimeout: 15000, // wait up to 15s for resources
                windowWidth: captureWidth,
                width: captureWidth,
                height: captureHeight,
                scrollX: 0,
                scrollY: 0,
                x: 0,
                y: 0,
                onclone: (clonedDoc) => {
                    const clonedContent = clonedDoc.querySelector('.result-content');
                    if (clonedContent) {
                        const themeBlue = '#00121d'; // App's Dark Blue for thematic consistency
                        const themeGold = '#ffd700'; // Vibrant Gold
                        const bgColor = '#00121d'; 
                        
                        // Force rigid width that matches the capture viewport
                        clonedContent.style.setProperty('width', '1000px', 'important');
                        clonedContent.style.setProperty('min-width', '1000px', 'important');
                        clonedContent.style.setProperty('margin', '0', 'important');
                        clonedContent.style.setProperty('padding', '50px', 'important'); // Balanced padding
                        clonedContent.style.setProperty('box-sizing', 'border-box', 'important');
                        clonedContent.style.setProperty('background', '#00121d', 'important');
                        clonedContent.style.setProperty('display', 'block', 'important');
                        clonedContent.style.setProperty('color-scheme', 'dark', 'important');
                        clonedContent.style.setProperty('filter', 'none', 'important');
                        clonedContent.style.setProperty('box-shadow', 'none', 'important');
                        clonedContent.style.setProperty('overflow', 'visible', 'important');

                        const title = clonedContent.querySelector('h1');
                        if (title) {
                            title.style.setProperty('color', '#ffd700', 'important'); // Vibrant gold for better contrast on blue
                            title.style.setProperty('text-align', 'center', 'important');
                            title.style.setProperty('width', '100%', 'important');
                            title.style.setProperty('margin-bottom', '30px', 'important');
                        }

                        const radarSection = clonedContent.querySelector('.radar-section');
                        if (radarSection) {
                            // Use theme blue instead of black
                            radarSection.style.setProperty('background', '#00121d', 'important'); 
                            radarSection.style.setProperty('background-color', '#00121d', 'important');
                            radarSection.style.setProperty('border-left', `12px solid ${themeGold}`, 'important');
                            radarSection.style.setProperty('backdrop-filter', 'none', 'important');
                            radarSection.style.setProperty('box-shadow', 'none', 'important');
                            radarSection.style.setProperty('overflow', 'visible', 'important');
                            radarSection.style.setProperty('margin-bottom', '100px', 'important'); // Separate cards from radar

                            
                            const radarContainer = radarSection.querySelector('.fascinantes-radar-container');
                            if (radarContainer) {
                                radarContainer.style.setProperty('background', 'transparent', 'important');
                                radarContainer.style.setProperty('box-shadow', 'none', 'important');
                                radarContainer.style.setProperty('border', 'none', 'important');
                                radarContainer.style.setProperty('transform', 'none', 'important'); // Remove any historical offset
                                
                                // FORCE height and centered layout for PDF capture context
                                radarContainer.style.setProperty('height', '750px', 'important');
                                radarContainer.style.setProperty('width', '100%', 'important');
                                radarContainer.style.setProperty('display', 'flex', 'important');
                                radarContainer.style.setProperty('justify-content', 'center', 'important');
                                radarContainer.style.setProperty('overflow', 'visible', 'important');
                                
                                const svg = radarContainer.querySelector('svg');
                                if (svg) {
                                    // CRITICAL: Force physical width/height so Recharts doesn't render 0x0 in clone
                                    // Increased width to 950 to avoid label clipping
                                    svg.setAttribute('width', '950');
                                    svg.setAttribute('height', '750');
                                    svg.style.setProperty('width', '950px', 'important');
                                    svg.style.setProperty('height', '750px', 'important');
                                    svg.style.setProperty('margin', '0 auto', 'important');
                                    svg.style.setProperty('display', 'block', 'important');
                                    svg.style.setProperty('overflow', 'visible', 'important');
                                    
                                    // SURGICAL LABEL POSITIONING (Logic from Share feature)
                                    const textBlocks = svg.querySelectorAll('text');
                                    textBlocks.forEach(textBlock => {
                                        Object.assign(textBlock.style, {
                                            fill: '#ffffff',
                                            opacity: '1',
                                            visibility: 'visible',
                                            display: 'block',
                                            overflow: 'visible'
                                        });
                                        textBlock.setAttribute('overflow', 'visible');

                                        const textContent = textBlock.textContent.trim().toUpperCase();
                                        const isNumeric = /^\d+$/.test(textContent);
                                        
                                        if (isNumeric) {
                                            textBlock.style.fontWeight = 'bold';
                                            textBlock.style.fontSize = '12px';
                                            return; 
                                        }

                                        const isDomainLabel = textContent.includes('DOMINIO') || 
                                            ['CORPORAL', 'MENTAL', 'EMOCIONAL', 'SOCIAL', 'ESPIRITUAL', 'FINANCIERO'].some(d => textContent.includes(d));

                                        if (isDomainLabel) {
                                            Object.assign(textBlock.style, {
                                                fontWeight: '800',
                                                fontSize: '10px', 
                                                textTransform: 'uppercase',
                                                textAnchor: 'middle'
                                            });
                                            const tspans = textBlock.querySelectorAll('tspan');
                                            
                                            const isFinanciero = textContent.includes('FINANCIERO');
                                            const isEspiritual = textContent.includes('ESPIRITUAL');
                                            const isMental = textContent.includes('MENTAL');
                                            const isEmocional = textContent.includes('EMOCIONAL');
                                            const isSocial = textContent.includes('SOCIAL');
                                            const isCorporal = textContent.includes('CORPORAL');

                                            if (isCorporal) {
                                                textBlock.setAttribute('x', '0');
                                                if (tspans.length > 0) tspans[0].setAttribute('dy', '-1.5em'); 
                                                if (tspans.length === 0) textBlock.setAttribute('dy', '-1.5em');
                                            } else if (isSocial) {
                                                textBlock.setAttribute('x', '0');
                                                if (tspans.length > 0) tspans[0].setAttribute('dy', '1.5em'); 
                                                if (tspans.length === 0) textBlock.setAttribute('dy', '1.5em');
                                            } else if (isFinanciero || isEspiritual) {
                                                textBlock.setAttribute('x', '-80');
                                                textBlock.style.textAnchor = 'start';
                                                if (tspans.length > 0) tspans[0].setAttribute('dy', '3.5em');
                                                if (tspans.length === 0) textBlock.setAttribute('dy', '3.5em');
                                            } else if (isMental || isEmocional) {
                                                textBlock.setAttribute('x', '80');
                                                textBlock.style.textAnchor = 'end';
                                                if (tspans.length > 0) tspans[0].setAttribute('dy', '3.5em');
                                                if (tspans.length === 0) textBlock.setAttribute('dy', '3.5em');
                                            }

                                            tspans.forEach(ts => {
                                                ts.setAttribute('x', textBlock.getAttribute('x'));
                                                ts.style.fill = '#ffffff';
                                                ts.style.fontSize = '12px';
                                                ts.style.fontWeight = '800';
                                            });
                                        }
                                    });

                                    // Ensure icons are centered and visible
                                    svg.querySelectorAll('svg').forEach(icon => {
                                        icon.style.setProperty('filter', 'none', 'important');
                                        icon.style.setProperty('opacity', '1', 'important');
                                        icon.style.setProperty('display', 'block', 'important');
                                    });
                                }
                            }
                        }

                        // Remove explicit grid forced columns so it respects original layout naturally
                        const cards = clonedContent.querySelectorAll('.domain-result-card');
                        cards.forEach(card => {
                            // Use theme blue instead of black
                            card.style.setProperty('background', '#00121d', 'important'); 
                            card.style.setProperty('background-color', '#00121d', 'important');
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
                            importantNote.style.setProperty('background', '#00121d', 'important');
                            importantNote.style.setProperty('background-color', '#00121d', 'important');
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

    const handleDownloadActionPlan = async () => {
        if (!actionPlanRef.current || isDownloadingActionPlan) return;
        setIsDownloadingActionPlan(true);

        try {
            const container = actionPlanRef.current;
            const pages = container.querySelectorAll('.fascinantes-kit-page');
            
            if (pages.length === 0) {
                throw new Error("No se encontraron páginas para el Plan de Acción.");
            }

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                
                // Capture each page individually
                const canvas = await html2canvas(page, {
                    backgroundColor: '#ffffff',
                    scale: 3, // High resolution
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                    width: page.offsetWidth,
                    height: page.offsetHeight
                });

                const imgData = canvas.toDataURL('image/png');
                
                if (i > 0) {
                    pdf.addPage();
                }

                // Add to PDF filling the entire A4 page
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            }

            pdf.save('Plan-de-Accion-Fascinantes.pdf');
        } catch (error) {
            console.error('Error Action Plan PDF:', error);
            alert('Hubo un error al generar el Plan de Acción.');
        } finally {
            setIsDownloadingActionPlan(false);
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

                {/* Expert System Analysis Section */}
                {domainScores.length > 0 && (
                    <div className="expert-analysis-container animate-fade-in" style={{ marginBottom: '40px' }}>
                        {(() => {
                            const analysis = getExpertAnalysis(domainScores);
                            if (!analysis) return null;

                            return (
                                <div className="expert-card glass">
                                    <div className="expert-header">
                                        <div className="expert-profile-badge">
                                            <Zap size={14} /> PERFIL
                                        </div>
                                        <h2 className="expert-profile-name">{analysis.name}</h2>
                                    </div>

                                    <div className="expert-section insight-section">
                                        <p className="expert-insight-text">{analysis.insight}</p>
                                    </div>

                                    <div className="expert-grid">
                                        <div className="expert-section critical-section">
                                            <div className="expert-label">⚠️ PUNTO CRÍTICO</div>
                                            <p className="expert-text">{analysis.critical}</p>
                                        </div>

                                        <div className="expert-section explanation-section">
                                            <div className="expert-label">💡 EXPLICACIÓN BREVE</div>
                                            <p className="expert-text">{analysis.explanation}</p>
                                        </div>
                                    </div>

                                    <div className="expert-section recommendations-section">
                                        <div className="expert-label">RECOMENDACIONES</div>
                                        <ul className="expert-list">
                                            {analysis.recommendations.map((rec, idx) => (
                                                <li key={idx}>
                                                    <span className="bullet-icon">•</span>
                                                    {rec}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}

                {/* Calculate extremes for highlighting */}
                {(() => {
                    if (domainScores.length === 0) return null;
                    
                    const minScore = Math.min(...domainScores.map(s => s.score));

                    return (
                        <div className="interpretations-grid">
                            {[...domainScores]
                                .sort((a, b) => a.score - b.score)
                                .map((score) => {
                                    const isMin = score.score === minScore;

                                    return (
                                        <div 
                                            key={score.id} 
                                            className={`domain-result-card glass clickable ${isMin ? 'neon-highest' : ''}`}
                                            onClick={() => setSelectedDomain(score)}
                                        >
                                            <div className="domain-top" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '5px' }}>
                                                {isMin && (
                                                    <span style={{ 
                                                        fontSize: '0.65rem', 
                                                        fontWeight: '900', 
                                                        color: '#ff3131', 
                                                        background: 'rgba(255, 49, 49, 0.1)',
                                                        padding: '2px 8px',
                                                        borderRadius: '4px',
                                                        marginBottom: '5px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        border: '1px solid rgba(255, 49, 49, 0.2)'
                                                    }}>
                                                        ⚠️ DOMINIO CRÍTICO
                                                    </span>
                                                )}
                                                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div className="domain-info-header">
                                                        <span className="domain-result-icon" style={{ 
                                                            color: isMin ? score.style.color : '#666',
                                                            filter: isMin ? 'drop-shadow(0 0 5px currentColor)' : 'none'
                                                        }}>
                                                            {getDomainIcon(score.id)}
                                                        </span>
                                                        <h3 style={{ color: isMin ? score.style.color : '#888' }}>
                                                            {score.domain}
                                                        </h3>
                                                    </div>
                                                    <span className={`result-tag ${score.interpretation.toLowerCase()}`}>
                                                        {score.interpretation}
                                                    </span>
                                                </div>
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
                                    );
                                })}
                        </div>
                    );
                })()}

                <div className="important-note-card animate-fade-in">
                    <div className="note-icon">
                        <AlertCircle size={28} />
                    </div>
                    <p className="note-text">
                        <strong>Nota Importante:</strong> si alguien está en crisis intensa o con síntomas severos, esto no reemplaza acompañamiento profesional. Pide ayuda.
                    </p>
                </div>

                <div className="post-note-cta animate-fade-in" style={{ textAlign: 'center', marginTop: '30px', padding: '0 20px' }}>
                    <p style={{ 
                        color: '#fff', 
                        fontSize: '1.2rem', 
                        fontWeight: '600', 
                        lineHeight: '1.4',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        Ya identificamos exactamente qué está frenando tu crecimiento. Vamos a liberar el ancla con un plan de acción equilibrado.
                    </p>
                </div>

                <div className="primary-action-container animate-fade-in" style={{ marginTop: '30px', display: 'flex', justifyContent: 'center' }}>
                    <button 
                        className="btn-action plan-accion" 
                        onClick={handleDownloadActionPlan}
                        disabled={isDownloadingActionPlan}
                        style={{ 
                            background: '#ddbe3d', 
                            color: '#00121d', 
                            width: '100%', 
                            maxWidth: '430px', 
                            justifyContent: 'center',
                            fontSize: '1rem',
                            padding: '16px 28px'
                        }}
                    >
                        <Lock size={20} /> {isDownloadingActionPlan ? 'GENERANDO...' : 'VER MI PLAN DE ACCIÓN'}
                    </button>
                </div>

                <div className="result-actions" style={{ marginTop: '15px' }}>
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
                        <Download size={18} /> {isDownloading ? '...' : 'REPORTE'}
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

            {/* Hidden template for PDF generation */}
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <div ref={actionPlanRef}>
                    <FascinantesActionPlanTemplate />
                </div>
            </div>
        </div>
    );
};

export default FascinantesResult;
