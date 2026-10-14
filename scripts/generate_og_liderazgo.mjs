import sharp from 'sharp';

async function generateOgImage() {
    const width = 1200;
    const height = 630;

    // 1. Prepare Logo Blanco
    const logoBuffer = await sharp('public/Logo-Blanco.png')
        .resize({ width: 220, fit: 'contain' })
        .toBuffer();

    // 2. Prepare Lighthouse
    const faroBuffer = await sharp('public/Faro azul.png')
        .resize({ width: 440, height: 440, fit: 'contain' })
        .toBuffer();

    // 3. Compose SVG Graphic with robust cross-platform sans-serif fonts
    const svgOverlay = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#021526" />
                <stop offset="50%" stop-color="#002d44" />
                <stop offset="100%" stop-color="#061a29" />
            </linearGradient>
            
            <radialGradient id="glowRight" cx="80%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#0d9488" stop-opacity="0.38" />
                <stop offset="60%" stop-color="#021526" stop-opacity="0" />
            </radialGradient>

            <radialGradient id="goldGlow" cx="20%" cy="20%" r="40%">
                <stop offset="0%" stop-color="#ddbe3d" stop-opacity="0.14" />
                <stop offset="100%" stop-color="#021526" stop-opacity="0" />
            </radialGradient>

            <linearGradient id="goldText" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#ddbe3d" />
                <stop offset="100%" stop-color="#fef08a" />
            </linearGradient>

            <linearGradient id="badgeBorder" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#ddbe3d" />
                <stop offset="100%" stop-color="#0d9488" />
            </linearGradient>
        </defs>

        <!-- Background -->
        <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
        <rect width="${width}" height="${height}" fill="url(#glowRight)" />
        <rect width="${width}" height="${height}" fill="url(#goldGlow)" />

        <!-- Subtle geometric lines / circles -->
        <g opacity="0.08" stroke="#ffffff" stroke-width="1">
            <line x1="80" y1="0" x2="80" y2="${height}" />
            <circle cx="950" cy="315" r="230" fill="none" stroke="#ddbe3d" stroke-dasharray="4 8" stroke-width="2" />
            <circle cx="950" cy="315" r="280" fill="none" stroke="#0d9488" stroke-opacity="0.6" />
        </g>

        <!-- Badge -->
        <g transform="translate(80, 150)">
            <rect width="280" height="36" rx="18" fill="#002d44" stroke="url(#badgeBorder)" stroke-width="1.5" />
            <circle cx="20" cy="18" r="4" fill="#ddbe3d" />
            <text x="32" y="23" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="bold" fill="#fef08a" letter-spacing="1.5">TEST • 5 A 7 MINUTOS</text>
        </g>

        <!-- Main Title -->
        <text x="80" y="245" font-family="Segoe UI, Arial, sans-serif" font-size="34" font-weight="bold" fill="#94a3b8" letter-spacing="0.5">
            Diagnóstico de
        </text>
        <text x="80" y="310" font-family="Segoe UI, Arial, sans-serif" font-size="52" font-weight="900" fill="#ffffff" letter-spacing="-0.5">
            Competencias de
        </text>
        <text x="80" y="375" font-family="Segoe UI, Arial, sans-serif" font-size="56" font-weight="900" fill="url(#goldText)" letter-spacing="-0.5">
            Liderazgo
        </text>

        <!-- Subtitle -->
        <text x="80" y="432" font-family="Segoe UI, Arial, sans-serif" font-size="21" font-weight="600" fill="#e2e8f0">
            Reconoce cómo estás liderando y dónde puedes crecer.
        </text>
        <text x="80" y="466" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="400" fill="#94a3b8">
            Evaluación integral en 5 dimensiones con reporte inmediato.
        </text>

        <!-- 5 Dimensions Pills -->
        <g transform="translate(80, 508)" opacity="0.95">
            <!-- Dim 1 -->
            <rect x="0" y="0" width="105" height="28" rx="6" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" />
            <text x="52" y="19" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="bold" fill="#f1f5f9" text-anchor="middle">Personal</text>

            <!-- Dim 2 -->
            <rect x="113" y="0" width="118" height="28" rx="6" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" />
            <text x="172" y="19" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="bold" fill="#f1f5f9" text-anchor="middle">Estratégico</text>

            <!-- Dim 3 -->
            <rect x="239" y="0" width="112" height="28" rx="6" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" />
            <text x="295" y="19" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="bold" fill="#f1f5f9" text-anchor="middle">Relacional</text>

            <!-- Dim 4 -->
            <rect x="359" y="0" width="128" height="28" rx="6" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" />
            <text x="423" y="19" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="bold" fill="#f1f5f9" text-anchor="middle">Multiplicador</text>

            <!-- Dim 5 -->
            <rect x="495" y="0" width="128" height="28" rx="6" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" />
            <text x="559" y="19" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="bold" fill="#f1f5f9" text-anchor="middle">Trascendente</text>
        </g>
    </svg>
    `;

    const svgBuffer = Buffer.from(svgOverlay);

    // Composite everything
    const finalImage = await sharp(svgBuffer)
        .composite([
            {
                input: logoBuffer,
                top: 55,
                left: 80
            },
            {
                input: faroBuffer,
                top: Math.round((height - 440) / 2),
                left: 730
            }
        ])
        .jpeg({ quality: 93, chromaSubsampling: '4:4:4' })
        .toFile('public/og-liderazgo.jpg');

    console.log('Updated og-liderazgo.jpg:', finalImage);

    await sharp('public/og-liderazgo.jpg')
        .png({ quality: 92 })
        .toFile('public/og-liderazgo.png');

    console.log('Updated og-liderazgo.png');
}

generateOgImage().catch(console.error);
