const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));

  console.log("Navigating to home...");
  await page.goto('http://localhost:5173/eneagrama');
  
  console.log("Setting localStorage...");
  await page.evaluate(() => {
    localStorage.setItem('enneagramResult', JSON.stringify({
       enneatypeScores: { "1": 90, "3": 80, "5": 70 },
       enneatypes: [{type: "1", score: 90}, {type: "3", score: 80}, {type: "5", score: 70}],
       enneatype: "1"
    }));
  });
  
  console.log("Navigating to result...");
  await page.goto('http://localhost:5173/eneagrama-result');
  await page.waitForTimeout(2000);
  
  console.log("Clicking button...");
  await page.evaluate(() => {
     const btns = Array.from(document.querySelectorAll('button'));
     const btn = btns.find(b => b.textContent.includes('CONTINUAR') || b.textContent.includes('Continuar'));
     if(btn) btn.click();
     else console.log('BUTTON NOT FOUND');
  });
  
  await page.waitForTimeout(3000);
  
  console.log("Checking DOM...");
  const inner = await page.evaluate(() => document.getElementById('root').innerHTML);
  console.log("Root innerHTML length:", inner.length);
  if (inner.length < 500) {
      console.log("Root innerHTML:", inner);
  }
  
  const body = await page.evaluate(() => document.body.innerHTML);
  console.log("Body innerHTML length:", body.length);
  
  await browser.close();
})();
