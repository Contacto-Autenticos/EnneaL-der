/**
 * BACKUP DE CONFIGURACIÓN DE PDF - REPORTE FASCINANTES
 * Fecha: 2026-04-15
 * Descripción: Configuración en fondo blanco, texto azul oscuro (#00121d), 
 * escala 3.0 para alta nitidez, y gráfico de radar al 110% de tamaño.
 * 
 * Para restaurar: Reemplazar la función 'handleDownloadPDF' en 
 * src/pages/FascinantesResult.jsx con el código de abajo.
 */

const handleDownloadPDF = async () => {
    if (!reportRef.current || isDownloading) return;
    setIsDownloading(true);

    try {
        const element = reportRef.current;
        const captureWidth = 1000;
        const captureHeight = element.scrollHeight + 100;

        const canvas = await html2canvas(element, {
            backgroundColor: '#ffffff',
            scale: 3.0, // Ultra-sharpness
            useCORS: true,
            imageTimeout: 20000, 
            windowWidth: captureWidth,
            width: captureWidth,
            height: captureHeight,
            scrollX: 0,
            scrollY: 0,
            x: 0,
            y: 0,
            onclone: (clonedDoc) => {
                // RADICAL: Strip ALL filters, blurs and transparency
                clonedDoc.querySelectorAll('*').forEach(el => {
                    el.style.setProperty('filter', 'none', 'important');
                    el.style.setProperty('backdrop-filter', 'none', 'important');
                    el.style.setProperty('opacity', '1', 'important');
                    el.style.setProperty('box-shadow', 'none', 'important');
                    el.style.setProperty('text-shadow', 'none', 'important');
                });

                const clonedContent = clonedDoc.querySelector('.result-content');
                if (clonedContent) {
                    const themeBlue = '#00121d'; // Deep Navy Blue
                    const themeGold = '#f2b705'; 
                    const bgColor = '#ffffff'; 
                    
                    clonedContent.style.setProperty('width', '1000px', 'important');
                    clonedContent.style.setProperty('min-width', '1000px', 'important');
                    clonedContent.style.setProperty('margin', '0', 'important');
                    clonedContent.style.setProperty('padding', '50px', 'important');
                    clonedContent.style.setProperty('background', bgColor, 'important');
                    clonedContent.style.setProperty('color', themeBlue, 'important');
                    clonedContent.style.setProperty('color-scheme', 'light', 'important');

                    const title = clonedContent.querySelector('h1');
                    if (title) {
                        title.style.setProperty('color', themeBlue, 'important'); 
                        title.style.setProperty('font-weight', '950', 'important');
                    }

                    const radarSection = clonedContent.querySelector('.radar-section');
                    if (radarSection) {
                        radarSection.style.setProperty('background', 'transparent', 'important'); 
                        radarSection.style.setProperty('border-left', `15px solid ${themeGold}`, 'important');
                        radarSection.style.setProperty('margin-bottom', '120px', 'important'); 

                        const radarContainer = radarSection.querySelector('.fascinantes-radar-container');
                        if (radarContainer) {
                            const svg = radarContainer.querySelector('svg');
                            if (svg) {
                                const newW = 836; // +10% increase from previous 760
                                const newH = 660; // +10% increase from previous 600
                                svg.setAttribute('width', newW.toString());
                                svg.setAttribute('height', newH.toString());
                                svg.style.setProperty('width', `${newW}px`, 'important');
                                svg.style.setProperty('height', `${newH}px`, 'important');
                                
                                const textBlocks = svg.querySelectorAll('text');
                                textBlocks.forEach(textBlock => {
                                    const textContent = textBlock.textContent.trim().toUpperCase();
                                    const isNumeric = /^\d+$/.test(textContent);

                                    Object.assign(textBlock.style, {
                                        fill: isNumeric ? '#ffffff' : themeBlue,
                                        opacity: '1',
                                        fontWeight: '950',
                                        filter: 'none'
                                    });

                                    const isDomainLabel = textContent.includes('DOMINIO') || 
                                        ['CORPORAL', 'MENTAL', 'EMOCIONAL', 'SOCIAL', 'ESPIRITUAL', 'FINANCIERO'].some(d => textContent.includes(d));

                                    if (isDomainLabel) {
                                        textBlock.style.fontSize = '14px';
                                        const tspans = textBlock.querySelectorAll('tspan');
                                        tspans.forEach(ts => {
                                            ts.style.fill = themeBlue;
                                            ts.style.fontSize = '14px';
                                            ts.style.fontWeight = '950';
                                        });
                                    }
                                });

                                // Robust radar lines
                                svg.querySelectorAll('.recharts-polar-grid-concentric-path').forEach(path => {
                                    path.style.setProperty('stroke', '#94a3b8', 'important');
                                    path.style.setProperty('stroke-width', '2px', 'important');
                                });
                                svg.querySelectorAll('.recharts-polar-grid-angle-line').forEach(line => {
                                    line.style.setProperty('stroke', '#94a3b8', 'important');
                                    line.style.setProperty('stroke-width', '1.5px', 'important');
                                });
                                svg.querySelectorAll('.recharts-radar-polygon').forEach(poly => {
                                    poly.style.setProperty('fill-opacity', '0.7', 'important');
                                    poly.style.setProperty('stroke-width', '3px', 'important');
                                });
                            }
                        }
                    }

                    const expertCard = clonedContent.querySelector('.expert-card');
                    if (expertCard) {
                        expertCard.style.setProperty('background', '#f8fafc', 'important');
                        expertCard.style.setProperty('border', '2px solid #94a3b8', 'important');
                        expertCard.style.setProperty('border-left', `10px solid ${themeGold}`, 'important');
                        
                        const eInsight = expertCard.querySelector('.expert-insight-text');
                        if (eInsight) {
                            eInsight.style.setProperty('color', themeBlue, 'important');
                            eInsight.style.setProperty('font-weight', '900', 'important');
                        }
                        expertCard.querySelectorAll('.expert-label').forEach(label => {
                            label.style.setProperty('color', '#b45309', 'important');
                            label.style.setProperty('font-weight', '950', 'important');
                        });
                        expertCard.querySelectorAll('.expert-text, .expert-list li').forEach(text => {
                            text.style.setProperty('color', themeBlue, 'important');
                            text.style.setProperty('font-weight', '500', 'important');
                        });
                    }

                    const cards = clonedContent.querySelectorAll('.domain-result-card');
                    cards.forEach(card => {
                        card.style.setProperty('background', '#ffffff', 'important'); 
                        card.style.setProperty('border', '2px solid #94a3b8', 'important');
                        
                        const domainId = card.className.match(/neon-(\w+)/);
                        if (domainId && domainId[1]) {
                            const saturatedColors = {
                                corporal: '#ff0000', mental: '#ff8c00', emocional: '#ffd700',
                                social: '#008000', espiritual: '#00bfff', financiero: '#800080'
                            };
                            const color = saturatedColors[domainId[1]] || themeGold;
                            card.style.setProperty('border-left', `15px solid ${color}`, 'important');
                        }
                        const header = card.querySelector('h3');
                        if (header) {
                            header.style.setProperty('color', themeBlue, 'important');
                            header.style.setProperty('font-weight', '950', 'important');
                        }
                        const definition = card.querySelector('.domain-definition');
                        if (definition) definition.style.setProperty('color', themeBlue, 'important');
                        const tag = card.querySelector('.result-tag');
                        if (tag) {
                            tag.style.setProperty('background', '#e2e8f0', 'important');
                            tag.style.setProperty('color', themeBlue, 'important');
                            tag.style.setProperty('font-weight', '900', 'important');
                        }
                        const score = card.querySelector('.score-num');
                        if (score) score.style.setProperty('color', themeBlue, 'important');
                        const barBg = card.querySelector('.score-bar-bg');
                        if (barBg) barBg.style.setProperty('background', '#cbd5e1', 'important');
                    });

                    const importantNote = clonedContent.querySelector('.important-note-card');
                    if (importantNote) {
                        importantNote.style.setProperty('background', '#ffffff', 'important');
                        importantNote.style.setProperty('border', '2px solid #ff0000', 'important');
                        importantNote.style.setProperty('border-left', `15px solid #ff0000`, 'important');
                        const noteText = importantNote.querySelector('.note-text');
                        if (noteText) {
                            noteText.style.setProperty('color', themeBlue, 'important');
                            noteText.style.setProperty('font-weight', '700', 'important');
                        }
                    }

                    // Hide UI-only elements
                    ['.result-actions', '.post-note-cta', '.primary-action-container'].forEach(sel => {
                        const el = clonedContent.querySelector(sel);
                        if (el) el.style.setProperty('display', 'none', 'important');
                    });

                    const footer = clonedContent.querySelector('.result-footer-minimal');
                    if (footer) {
                        footer.style.setProperty('margin-top', '50px', 'important');
                        footer.style.setProperty('display', 'flex', 'important');
                        footer.style.setProperty('justify-content', 'center', 'important');
                        const img = footer.querySelector('img');
                        if (img) {
                            img.style.setProperty('max-height', '80px', 'important');
                            img.setAttribute('src', '/logo-azul.png');
                        }
                    }
                }
            }
        });

        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = 210; 
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
