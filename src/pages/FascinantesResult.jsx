import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Share2, Info, User, Brain, HeartPulse, Handshake, Eye, TrendingUp, Zap, Download, AlertCircle, MessageCircle, Twitter, Linkedin, Lock } from 'lucide-react';
import { fascinantesQuestions, fascinantesDomains, fascinantesInterpretations } from '../data/fascinantesData';
import FascinantesRadar from '../components/FascinantesRadar';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import FascinantesActionPlanTemplate from '../components/FascinantesActionPlanTemplate';
import FascinantesReportTemplate from '../components/FascinantesReportTemplate';
import { calculateDomainScores, getExpertAnalysis, DOMAIN_STYLES } from '../utils/fascinantesUtils';
import './FascinantesResult.css';

// DOMAIN_STYLES removed, now imported from utils/fascinantesUtils



const getDomainIcon = (domainId) => {
    const props = { size: 22, stroke: 'currentColor', strokeWidth: 1.5 };
    
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
    const [userData, setUserData] = useState(null);
    const [showSocialOptions, setShowSocialOptions] = useState(false); // Senior: Better state management for fallback
    const radarRef = React.useRef(null);
    const reportRef = React.useRef(null);
    const actionPlanRef = React.useRef(null);
    const reportTemplateRef = React.useRef(null);

    useEffect(() => {
        const isPaid = localStorage.getItem('autodiagPaid') === 'true';
        const hasUser = localStorage.getItem('tempAutodiagUser');
        const storedAnswers = localStorage.getItem('fascinantesAnswers');

        if (!isPaid || !hasUser) {
            navigate('/dominios');
            return;
        }
        
        if (hasUser) {
            try { setUserData(JSON.parse(hasUser)); } catch (e) {}
        }
        
        if (storedAnswers) {
            const answers = JSON.parse(storedAnswers);
            setUserAnswers(answers);
            const scores = calculateDomainScores(answers);
            setDomainScores(scores);
            setLoading(false);
        } else {
            navigate('/dominios-intro');
        }
    }, [navigate]);

    // Save result to database once calculated
    useEffect(() => {
        const saveResult = async () => {
            // Check if we need to save (set in FascinantesTest.jsx)
            const needsSave = localStorage.getItem('fascinantes_needs_save');
            
            if (domainScores.length === 0 || needsSave !== 'true') return;
            
            // Temporary block to prevent multiple simultaneous requests
            if (sessionStorage.getItem('autodiag_saving_lock')) return;
            sessionStorage.setItem('autodiag_saving_lock', 'true');

            const analysis = getExpertAnalysis(domainScores);
            const tempUserStr = localStorage.getItem('tempAutodiagUser');
            let userData = null;
            if (tempUserStr) {
                try { userData = JSON.parse(tempUserStr); } catch (e) {}
            }

            try {
                const { error } = await supabase.from('fascinantes_results').insert([{
                    is_anonymous: !userData,
                    full_name: userData?.name || null,
                    email: userData?.email || null,
                    birth_date: userData?.birth_date || null,
                    profile_name: analysis?.name || 'Indefinido',
                    score_corporal: domainScores.find(s => s.id === 'corporal')?.score || 0,
                    score_mental: domainScores.find(s => s.id === 'mental')?.score || 0,
                    score_emocional: domainScores.find(s => s.id === 'emocional')?.score || 0,
                    score_social: domainScores.find(s => s.id === 'social')?.score || 0,
                    score_espiritual: domainScores.find(s => s.id === 'espiritual')?.score || 0,
                    score_financiero: domainScores.find(s => s.id === 'financiero')?.score || 0,
                    user_answers: userAnswers
                }]);

                if (error) throw error;
                
                // Clear the needs_save flag so it doesn't save again on refresh
                localStorage.removeItem('fascinantes_needs_save');
                sessionStorage.setItem('autodiag_saved', 'true');
            } catch (err) {
                console.error('Error saving fascinantes result:', err);
            } finally {
                sessionStorage.removeItem('autodiag_saving_lock');
            }
        };

        if (domainScores.length > 0) {
            saveResult();
        }
    }, [domainScores, userAnswers]);

    // Generación y envío automático del PDF por email
    const [isPdfSent, setIsPdfSent] = useState(false);
    useEffect(() => {
        const generateAndSendPDFSilently = async () => {
            // Validar que tengamos datos
            if (domainScores.length === 0 || !userData?.email) return;
            
            // TEMPORAL: Removido el bloqueo de sessionStorage para pruebas libres
            // if (sessionStorage.getItem('fascinantes_pdf_auto_sent')) return;
            // sessionStorage.setItem('fascinantes_pdf_auto_sent', 'true');

            try {
                // Esperar un momento para que los gráficos terminen de renderizarse (especialmente recharts)
                await new Promise(resolve => setTimeout(resolve, 2500));
                
                const pdf = await buildPdfDocument(1.0);
                if (!pdf) return;
                
                // Extraer el base64 sin el prefijo "data:application/pdf;base64,"
                const pdfDataUri = pdf.output('datauristring');
                const pdfBase64 = pdfDataUri.split(',')[1];

                const { data, error } = await supabase.functions.invoke('send-fascinantes-report', {
                    body: { 
                        email: userData.email, 
                        name: userData.name || 'Usuario',
                        pdfBase64: pdfBase64 
                    }
                });

                if (error) {
                    console.error('Error invoking edge function:', error);
                    alert('Error en Supabase: ' + error.message);
                    throw error;
                }
                
                setIsPdfSent(true);
                alert('¡Éxito! El sistema intentó enviar el PDF a: ' + userData.email + '. Si no llega, revisa Spam o es un bloqueo de Brevo.');
                console.log('PDF enviado automáticamente con éxito', data);
                // Evitamos multiples envios en la misma sesión si tuvo exito
                sessionStorage.setItem('fascinantes_pdf_auto_sent', 'true');
                
            } catch (err) {
                console.error('Error enviando PDF silenciosamente:', err);
                alert('Error al enviar correo: ' + err.message);
            }
        };

        // Para las pruebas: siempre ejecutar al refrescar la página
        generateAndSendPDFSilently();
    }, [domainScores, userData]);

    const getAnswerColor = (val) => {
        switch(val) {
            case 1: return '#cc0000'; // Rojo
            case 2: return '#ff9100'; // Naranja
            case 3: return '#DDBE3D'; // Amarillo
            case 4: return '#00e5ff'; // Azul claro
            case 5: return '#00ff00'; // Verde
            default: return '#fff';
        }
    };

    const getAnswerLabel = (val) => {
        switch(val) {
            case 1: return 'Casi nunca';
            case 2: return 'Pocas veces';
            case 3: return 'A veces';
            case 4: return 'Con frecuencia';
            case 5: return 'Casi siempre';
            default: return '';
        }
    };

    // getExpertAnalysis removed, now imported from utils/fascinantesUtils


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
                                const isNumeric = /^\d+%?$/.test(textContent);
                                
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

    const buildPdfDocument = async (customScale = 2.5) => {
        const bgColor = '#ffffff';
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = 210;
        const pdfHeight = 297;
        const template = reportTemplateRef.current;
        if (!template) return null;
        
        // Mostrar temporalmente para poder capturarlo (está en left -9999px)
        template.style.left = '0';
        template.style.opacity = '1';
        
        // Esperar un ciclo de renderizado del navegador para asegurar que los estilos aplican y no capture en blanco
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Preservar el scroll actual
        const originalScrollY = window.scrollY;
        // Mover arriba temporalmente para evitar bugs de html2canvas con absolute positioning
        window.scrollTo(0, 0);

            const addLinksToPDF = (pageElement) => {
                const pageRect = pageElement.getBoundingClientRect();
                const scaleX = pdfWidth / pageRect.width;
                const scaleY = pdfHeight / pageRect.height;
                const links = pageElement.querySelectorAll('[data-pdf-link]');
                links.forEach(link => {
                    const rect = link.getBoundingClientRect();
                    
                    const percentX = (rect.left - pageRect.left) / pageRect.width;
                    const percentY = (rect.top - pageRect.top) / pageRect.height;
                    const percentW = rect.width / pageRect.width;
                    const percentH = rect.height / pageRect.height;

                    const finalX = percentX * pdfWidth;
                    const finalY = percentY * pdfHeight;
                    const finalW = percentW * pdfWidth;
                    const finalH = percentH * pdfHeight;

                    pdf.link(finalX, finalY, finalW, finalH, { url: link.getAttribute('data-pdf-link') });
                });
            };

            // --- PAGE 0 (COVER) ---
            const page0 = template.querySelector('#pdf-page-0');
            if (page0) {
                const canvas0 = await html2canvas(page0, {
                    backgroundColor: bgColor,
                    scale: customScale, // Optimizado: balance nitidez/velocidad
                    useCORS: true,
                    width: 800,
                    height: 1131
                });
                const imgData0 = canvas0.toDataURL('image/jpeg', 0.92);
                pdf.addImage(imgData0, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
                addLinksToPDF(page0);
            }

            // --- PAGE 1 ---
            pdf.addPage();
            const page1 = template.querySelector('#pdf-page-1');
            const canvas1 = await html2canvas(page1, {
                backgroundColor: bgColor,
                scale: customScale,
                useCORS: true,
                width: 800,
                height: 1131
            });

            const imgData1 = canvas1.toDataURL('image/jpeg', 0.92);
            pdf.addImage(imgData1, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            addLinksToPDF(page1);

            // --- PAGE 2 ---
            pdf.addPage();
            const page2 = template.querySelector('#pdf-page-2');
            const canvas2 = await html2canvas(page2, {
                backgroundColor: bgColor,
                scale: customScale,
                useCORS: true,
                width: 800,
                height: 1131
            });

            const imgData2 = canvas2.toDataURL('image/jpeg', 0.92);
            pdf.addImage(imgData2, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            addLinksToPDF(page2);

            // --- PAGE 3 ---
            pdf.addPage();
            const page3 = template.querySelector('#pdf-page-3');
            const canvas3 = await html2canvas(page3, {
                backgroundColor: bgColor,
                scale: customScale,
                useCORS: true,
                width: 800,
                height: 1131
            });

            const imgData3 = canvas3.toDataURL('image/jpeg', 0.92);
            pdf.addImage(imgData3, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            addLinksToPDF(page3);

            // --- PAGE 4 ---
            pdf.addPage();
            const page4 = template.querySelector('#pdf-page-4');
            const canvas4 = await html2canvas(page4, {
                backgroundColor: bgColor,
                scale: customScale,
                useCORS: true,
                width: 800,
                height: 1131
            });

            const imgData4 = canvas4.toDataURL('image/jpeg', 0.92);
            pdf.addImage(imgData4, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            addLinksToPDF(page4);

            // --- PAGES 5 TO 10 (QA Tables) ---
            for (let i = 5; i <= 10; i++) {
                const qaPage = template.querySelector(`#pdf-page-${i}`);
                if (qaPage) {
                    pdf.addPage();
                    const canvasQA = await html2canvas(qaPage, {
                        backgroundColor: bgColor,
                        scale: customScale,
                        useCORS: true,
                        width: 800,
                        height: 1131
                    });
                    const imgDataQA = canvasQA.toDataURL('image/jpeg', 0.92);
                    pdf.addImage(imgDataQA, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
                    addLinksToPDF(qaPage);
                }
            }

            // --- PAGE 11 ---
            const page11 = template.querySelector('#pdf-page-11');
            if (page11) {
                pdf.addPage();
                const canvas11 = await html2canvas(page11, {
                    backgroundColor: bgColor,
                    scale: customScale,
                    useCORS: true,
                    width: 800,
                    height: 1131
                });
                const imgData11 = canvas11.toDataURL('image/jpeg', 0.92);
                pdf.addImage(imgData11, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
                addLinksToPDF(page11);
            }

            // --- PAGE 12 & 13 ---
            for (let i = 12; i <= 13; i++) {
                const actionPage = template.querySelector(`#pdf-page-${i}`);
                if (actionPage) {
                    pdf.addPage();
                    const canvasAction = await html2canvas(actionPage, {
                        backgroundColor: bgColor,
                        scale: customScale,
                        useCORS: true,
                        width: 800,
                        height: 1131
                    });
                    const imgDataAction = canvasAction.toDataURL('image/jpeg', 0.92);
                    pdf.addImage(imgDataAction, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
                    addLinksToPDF(actionPage);
                }
            }

            // Ocultar de nuevo
            template.style.left = '-9999px';
            
            // Restaurar scroll
            window.scrollTo(0, originalScrollY);
            
            return pdf;
    };

    const handleDownloadPDF = async () => {
        if (!reportTemplateRef.current || isDownloading) return;
        setIsDownloading(true);

        try {
            const pdf = await buildPdfDocument();
            if (pdf) {
                pdf.save('Reporte-Autodiagnostico.pdf');
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Hubo un error al generar el reporte PDF.');
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
                    scale: 2.2, // Optimizado para velocidad
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                    width: page.offsetWidth,
                    height: page.offsetHeight
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.92);
                
                if (i > 0) {
                    pdf.addPage();
                }

                // Add to PDF filling the entire A4 page
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
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
            {/* Futuristic overlay removed for light theme */}
            
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
                                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#4b5563', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
                                        TU ESTADO ACTUAL ES DE:
                                    </div>
                                    <div className="expert-header">
                                        <h2 className="expert-profile-name">{analysis.name}</h2>
                                    </div>

                                    <div className="expert-section insight-section">
                                        <p className="expert-insight-text">{analysis.insight}</p>
                                    </div>

                                    <div className="expert-grid">
                                        <div className="expert-section explanation-section">
                                            <div className="expert-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Zap size={18} /> EXPLICACIÓN BREVE
                                            </div>
                                            <p className="expert-text">{analysis.explanation}</p>
                                        </div>

                                        <div className="expert-section critical-section">
                                            <div className="expert-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <AlertCircle size={18} /> REQUIERE ATENCIÓN
                                            </div>
                                            <p className="expert-text">{analysis.critical}</p>
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
                    const maxScore = Math.max(...domainScores.map(s => s.score));

                    return (
                        <div className="interpretations-grid">
                            {[...domainScores]
                                .sort((a, b) => b.score - a.score)
                                .map((score) => {
                                    const isMin = minScore < maxScore && score.score === minScore;

                                    return (
                                        <div 
                                            key={score.id} 
                                            className={`domain-result-card glass clickable`}
                                            onClick={() => setSelectedDomain(score)}
                                        >
                                            <div className="domain-top" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '5px' }}>
                                                {isMin && (
                                                    <span style={{ 
                                                        fontSize: '0.75rem', 
                                                        fontWeight: '800', 
                                                        color: '#ddbe3d', 
                                                        marginBottom: '5px',
                                                        display: 'flex',
                                                        width: '100%',
                                                        justifyContent: 'flex-start',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}>
                                                        ⚠️ Atención
                                                    </span>
                                                )}
                                                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div className="domain-info-header">
                                                        <span className="domain-result-icon" style={{ 
                                                            color: '#888'
                                                        }}>
                                                            {getDomainIcon(score.id)}
                                                        </span>
                                                        <h3 style={{ color: '#888' }}>
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
                                                            width: `${(score.score / 70) * 100}%`,
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
                        <strong>Nota Importante:</strong> si estás en crisis intensa o con síntomas severos, esto no reemplaza acompañamiento profesional. Pide ayuda.
                    </p>
                </div>

                <div className="post-note-cta animate-fade-in" style={{ textAlign: 'center', marginTop: '30px', padding: '0 20px' }}>
                    <p style={{ 
                        color: '#111827', 
                        fontSize: '1.2rem', 
                        fontWeight: '600', 
                        lineHeight: '1.4',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        Ya identificamos exactamente qué está frenando tu crecimiento. Vamos a liberar el ancla con un plan de acción equilibrado.
                    </p>
                </div>

                <div className="primary-action-container animate-fade-in" style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <button 
                        className="btn-action plan-accion" 
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
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
                        <Download size={20} /> {isDownloading ? 'GENERANDO...' : 'DESCARGAR REPORTE COMPLETO'}
                    </button>
                    {isPdfSent && (
                        <p style={{ marginTop: '12px', fontSize: '0.85rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: '#10b981' }}>✓</span> Reporte enviado a tu correo electrónico
                        </p>
                    )}
                </div>

                <div className="result-actions" style={{ marginTop: '15px' }}>
                    <button 
                        className="btn-action tertiary" 
                        onClick={() => navigate('/dominios-intro')}
                    >
                        <ArrowLeft size={18} /> REGRESAR
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
            
            <footer className="result-footer-minimal">
                <img src="/logo-azul.png" alt="Auténticos" />
            </footer>

            {/* Hidden Templates for PDF Generation */}
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <FascinantesReportTemplate 
                    ref={reportTemplateRef} 
                    domainScores={domainScores} 
                    analysis={getExpertAnalysis(domainScores)} 
                    userAnswers={userAnswers}
                    userName={userData?.name}
                    date={new Date().toLocaleDateString()}
                />
                
                <div ref={actionPlanRef}>
                    <FascinantesActionPlanTemplate 
                        domainScores={domainScores} 
                        userAnswers={userAnswers}
                        analysis={getExpertAnalysis(domainScores)}
                    />
                </div>
            </div>
        </div>
    );
};

export default FascinantesResult;
