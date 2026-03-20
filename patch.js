const fs = require('fs');
const file = 'src/pages/FascinantesResult.jsx';
let content = fs.readFileSync(file, 'utf8');

const startIndex = content.indexOf('    const handleDownloadPDF = async () => {');
const endIndexStr = '    if (loading) return <div className="loading-fascinantes">Procesando resultados...</div>;';
const endIndex = content.indexOf(endIndexStr);

if (startIndex === -1 || endIndex === -1) {
    console.error('Indices not found!');
    process.exit(1);
}

const newMethod = `    const handleDownloadPDF = async () => {
        if (!reportRef.current || isDownloading) return;
        setIsDownloading(true);

        try {
            // Remove scroll to prevent capturing blank areas on iOS
            window.scrollTo(0, 0);

            const canvas = await html2canvas(reportRef.current, {
                backgroundColor: '#ffffff',
                scale: window.innerWidth < 768 ? 2 : 1.5,
                useCORS: true,
                onclone: (clonedDoc) => {
                    const clonedContent = clonedDoc.querySelector('.result-content');
                    if (clonedContent) {
                        const intenseDarkBlue = '#061625';
                        const themeGold = '#ddbe3d';
                        
                        clonedContent.style.setProperty('width', '1000px', 'important');
                        clonedContent.style.setProperty('min-width', '1000px', 'important');
                        clonedContent.style.setProperty('margin', '0 auto', 'important');
                        clonedContent.style.setProperty('padding', '60px', 'important');
                        clonedContent.style.setProperty('box-sizing', 'border-box', 'important');
                        clonedContent.style.setProperty('background', '#ffffff', 'important');
                        clonedContent.style.setProperty('filter', 'none', 'important');
                        
                        const title = clonedContent.querySelector('h1');
                        if (title) {
                            title.style.setProperty('color', '#9e7b22', 'important');
                            title.style.setProperty('text-align', 'center', 'important');
                            title.style.setProperty('margin-bottom', '50px', 'important');
                        }

                        const radarSection = clonedContent.querySelector('.radar-section');
                        if (radarSection) {
                            radarSection.style.setProperty('background', intenseDarkBlue, 'important'); 
                            radarSection.style.setProperty('border-left', '12px solid ' + themeGold, 'important');
                            radarSection.style.setProperty('border-radius', '20px', 'important');
                            radarSection.style.setProperty('padding', '40px', 'important');
                            radarSection.style.setProperty('margin-bottom', '50px', 'important');
                            
                            const radarContainer = radarSection.querySelector('.fascinantes-radar-container');
                            if (radarContainer) {
                                radarContainer.style.setProperty('width', '800px', 'important');
                                radarContainer.style.setProperty('height', '600px', 'important');
                                radarContainer.style.setProperty('margin', '0 auto', 'important');
                                
                                const svg = radarContainer.querySelector('svg');
                                if (svg) {
                                    const svgTexts = svg.querySelectorAll('text, tspan');
                                    svgTexts.forEach(t => t.style.setProperty('fill', '#ffffff', 'important'));
                                }
                            }
                        }

                        const grid = clonedContent.querySelector('.interpretations-grid');
                        if (grid) {
                            grid.style.setProperty('display', 'flex', 'important');
                            grid.style.setProperty('flex-wrap', 'wrap', 'important');
                            grid.style.setProperty('justify-content', 'space-between', 'important');
                            grid.style.setProperty('gap', '0', 'important');
                        }

                        const cards = clonedContent.querySelectorAll('.domain-result-card');
                        cards.forEach(card => {
                            card.style.setProperty('background', intenseDarkBlue, 'important'); 
                            card.style.setProperty('border', '2px solid rgba(255,220,71,0.4)', 'important');
                            card.style.setProperty('padding', '30px', 'important');
                            card.style.setProperty('border-radius', '20px', 'important');
                            card.style.setProperty('width', '48%', 'important');
                            card.style.setProperty('box-sizing', 'border-box', 'important');
                            card.style.setProperty('margin-bottom', '25px', 'important');
                            card.style.setProperty('box-shadow', 'none', 'important');
                            card.style.setProperty('break-inside', 'avoid', 'important');
                            
                            const domainId = card.className.match(/neon-(\\w+)/);
                            if (domainId && domainId[1]) {
                                // Fallback colors depending on domain to maintain consistency
                                card.style.setProperty('border-left', '10px solid ' + themeGold, 'important');
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
                                tag.style.setProperty('color', '#ffffff', 'important');
                            }
                            
                            const score = card.querySelector('.score-num');
                            if (score) score.style.setProperty('color', '#ffffff', 'important');
                            
                            const tip = card.querySelector('.card-footer-tip');
                            if (tip) tip.style.setProperty('display', 'none', 'important');
                        });

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

`;

content = content.substring(0, startIndex) + newMethod + content.substring(endIndex);
fs.writeFileSync(file, content, 'utf8');
console.log('Success!');
