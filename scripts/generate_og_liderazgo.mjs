import sharp from 'sharp';

async function generateSquareOg() {
    const size = 1200;
    
    // Resize Faro blanco keeping aspect ratio with fully transparent background
    const faroResized = await sharp('public/Faro blanco.png')
        .resize({ 
            width: 900, 
            background: { r: 0, g: 0, b: 0, alpha: 0 } 
        })
        .toBuffer();

    const faroMeta = await sharp(faroResized).metadata();

    // Background color: Brand navy blue #002d44 with elegant radial depth
    const svgBg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <radialGradient id="blueGlow" cx="50%" cy="50%" r="65%">
                <stop offset="0%" stop-color="#004368" />
                <stop offset="65%" stop-color="#002d44" />
                <stop offset="100%" stop-color="#001826" />
            </radialGradient>
        </defs>
        <rect width="${size}" height="${size}" fill="url(#blueGlow)" />
    </svg>
    `;

    const left = Math.round((size - faroMeta.width) / 2);
    const top = Math.round((size - faroMeta.height) / 2);

    const jpgResult = await sharp(Buffer.from(svgBg))
        .composite([
            {
                input: faroResized,
                top: top,
                left: left
            }
        ])
        .jpeg({ quality: 95 })
        .toFile('public/og-liderazgo.jpg');

    console.log('Square og-liderazgo.jpg created successfully:', jpgResult);

    const pngResult = await sharp('public/og-liderazgo.jpg')
        .png()
        .toFile('public/og-liderazgo.png');

    console.log('Square og-liderazgo.png created successfully:', pngResult);
}

generateSquareOg().catch(console.error);
