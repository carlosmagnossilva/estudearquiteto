const { chromium } = require('playwright');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://127.0.0.1:3000';
const USERNAME = process.env.TEST_USER || 'carlos.magno.emp@dc.srv.br';
const PASSWORD = process.env.TEST_PASS || 'Dinsmore@123@123';

async function testLogin() {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Navigating to frontend...');
  try {
    await page.goto(FRONTEND_URL, { timeout: 10000 });
  } catch(e) {
    console.log('Page load failed, checking network...');
    await page.goto(FRONTEND_URL);
  }

  console.log('Waiting for login button...');
  await page.waitForSelector('text=Acessar Hub de Obras', { timeout: 10000 });

  console.log('Clicking login...');
  await page.click('text=Acessar Hub de Obras');

  console.log('Waiting for Azure AD login page...');
  await page.waitForURL('https://login.microsoftonline.com/**', { timeout: 15000 });

  console.log('Filling username...');
  await page.fill('input[name="loginfmts"]', USERNAME);
  await page.click('input[type="submit"]');

  console.log('Waiting for password field...');
  await page.waitForSelector('input[type="password"]', { timeout: 10000 });

  console.log('Filling password...');
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('input[type="submit"]');

  console.log('Waiting for redirect back to app...');
  await page.waitForURL(FRONTEND_URL, { timeout: 30000 });

  console.log('Checking if logged in...');
  await page.waitForSelector('text=Sair', { timeout: 10000 });

  console.log('Login successful!');

  await browser.close();
  process.exit(0);
}

testLogin().catch(err => {
  console.error('Test failed:', err.message);
  process.exit(1);
});