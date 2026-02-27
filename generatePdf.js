import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
    console.log('Starting puppeteer...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // Configura la descarga al directorio actual
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: __dirname,
    });

    console.log('Navigating to http://localhost:5174/advanced-analysis-result/7...');
    await page.goto('http://localhost:5174/advanced-analysis-result/7', { waitUntil: 'networkidle2' });

    console.log('Waiting for the download button...');
    await page.waitForSelector('.btn-kit-download');

    console.log('Clicking the download button...');
    await page.click('.btn-kit-download');

    console.log('Waiting for generating PDF (waiting for loader to disappear)...');

    // Wait for the button to not have the 'loading' class anymore or just wait a generous amount of time.
    // PDF generation from html2canvas and jsPDF can take ~5-15 seconds.
    await new Promise(r => setTimeout(r, 20000));

    console.log('Done waiting. Closing browser...');
    await browser.close();
})();
