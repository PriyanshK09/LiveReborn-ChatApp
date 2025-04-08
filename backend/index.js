import express from 'express';
import bodyParser from 'body-parser';
import puppeteer from 'puppeteer';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

// Login Endpoint
app.post('/login', async (req, res) => {
  const { regno, password } = req.body;

  if (!regno || !password) {
    return res.status(400).json({ error: 'Registration number and password are required' });
  }

  try {
    console.log('Launching Puppeteer...');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Step 1: Navigate to the login page
    console.log('Navigating to login page...');
    await page.goto('https://ums.lpu.in/lpuums/LoginNew.aspx', { waitUntil: 'networkidle2' });

    // Step 2: Wait for the registration number input field to load
    console.log('Waiting for registration number input...');
    await page.waitForSelector('input[name="txtU"]', { timeout: 5000 });

    // Step 3: Enter registration number and trigger form update
    console.log('Entering registration number...');
    await page.type('input[name="txtU"]', regno);
    await page.evaluate(() => {
      const input = document.querySelector('input[name="txtU"]');
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(1000); // Wait for the form to update

    // Step 4: Wait for the password input field to load
    console.log('Waiting for password input...');
    await page.waitForSelector('input[name="TxtpwdAutoId_8767"]', { timeout: 5000 });

    // Step 5: Enter password and submit the form
    console.log('Entering password and submitting...');
    await page.type('input[name="TxtpwdAutoId_8767"]', password);
    await page.click('#iBtnLogins150203125'); // Click the login button

    // Step 6: Wait for navigation or error message
    console.log('Waiting for login response...');
    await page.waitForTimeout(2000);

    // Check for login success or failure
    const errorMessage = await page.$eval('#lblMsg', (el) => el.textContent.trim()).catch(() => null);
    if (errorMessage && errorMessage.includes('Invalid Username or Password')) {
      console.log('Login failed: Invalid credentials');
      await browser.close();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Step 7: Navigate to the user details page
    console.log('Navigating to user details page...');
    await page.goto('https://ums.lpu.in/lpuums/default3.aspx', { waitUntil: 'networkidle2' });

    // Step 8: Extract user details
    console.log('Fetching user details...');
    const userDetails = await page.$eval('#ctl00_cphHeading_Logoutout1_lblId', (el) => el.textContent.trim());
    const [name, regnoExtracted] = userDetails.match(/^(.*) \((\d+)\)$/).slice(1);

    console.log('User details fetched:', { name, regno: regnoExtracted });

    // Step 9: Extract cookies for session persistence
    const cookies = await page.cookies();
    if (!cookies || cookies.length === 0) {
      console.log('Login failed: No authentication cookies received');
      await browser.close();
      return res.status(401).json({ error: 'Authentication failed' });
    }

    console.log('Login successful!');
    await browser.close();

    // Generate JWT token
    const token = jwt.sign({ regno }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Login successful',
      token,
      user: { name, regno: regnoExtracted },
    });
  } catch (error) {
    console.error('Error during login process:', error);
    res.status(500).json({ error: 'An internal server error occurred. Please try again later.' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
