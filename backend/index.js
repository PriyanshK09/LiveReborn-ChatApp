import express from 'express';
import bodyParser from 'body-parser';
import puppeteer from 'puppeteer';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const userSchema = new mongoose.Schema({
  regno: String,
  name: String,
  email: String,
  department: String,
  profilePicture: String,
});
const UserData = mongoose.model('UserData', userSchema);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token is missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

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

    // Step 7: Navigate to the StudentDashboard.aspx page
    console.log('Navigating to Student Dashboard...');
    await page.goto('https://ums.lpu.in/lpuums/StudentDashboard.aspx', { 
      waitUntil: 'networkidle2',
      timeout: 30000 // Increase timeout for slower connections
    });

    // Step 8: Extract the base64 profile photo
    console.log('Fetching profile photo...');
    let imagePath = null;

    try {
      // Try different possible selectors for the profile picture
      const selectors = ['#p_picture', '.profile_outer img', '#ctl00_cphHeading_ImageStudent', 'img[src*="DisplayImageforprofileupdation"]'];
      let base64Image = null;
      
      // Increase timeout to give more time for the page to load completely
      await page.waitForTimeout(3000);
      
      // Try each selector until we find one that works
      for (const selector of selectors) {
        console.log(`Trying to find profile image with selector: ${selector}`);
        const exists = await page.$(selector) !== null;
        
        if (exists) {
          console.log(`Found profile image with selector: ${selector}`);
          // Check if the image has a base64 src or a URL
          const srcType = await page.$eval(selector, img => img.src.startsWith('data:image') ? 'base64' : 'url');
          
          if (srcType === 'base64') {
            base64Image = await page.$eval(selector, img => img.src.split(',')[1]);
            if (base64Image) break;
          } else {
            // If it's a URL, we might need to download it
            console.log('Image is URL-based, not base64');
            // Continue to next selector to see if we can find a base64 image
          }
        }
      }
      
      // Create uploads directory and prepare path regardless of finding image
      const uploadsDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
      }
      imagePath = path.join(uploadsDir, `${regno}.jpg`);
      
      // If we found a base64 image, save it
      if (base64Image) {
        console.log('Saving profile photo...');
        const imageBuffer = Buffer.from(base64Image, 'base64');
        fs.writeFileSync(imagePath, imageBuffer);
        imagePath = `/uploads/${regno}.jpg`; // Use relative path for the response
      }
    } catch (error) {
      console.error('Error processing profile photo:', error.message);
      // Continue with login process even if photo fails
    }

    // Step 10: Fetch additional user details
    console.log('Fetching user details...');
    let name = '';
    let regnoExtracted = '';
    let department = '';

    try {
      // Try to capture a screenshot to debug page content
      await page.screenshot({ path: 'dashboard_screenshot.png' });
      console.log('Saved dashboard screenshot for debugging');

      // Get the page HTML for debugging purposes
      const pageContent = await page.content();
      const smallHtmlSample = pageContent.substring(0, 5000); // Increase sample size to capture more content
      console.log('Page HTML sample:', smallHtmlSample);

      // First try to find the h5 element with id "p_name"
      try {
        const hasPNameElement = await page.$('#p_name') !== null;
        console.log('p_name element found:', hasPNameElement);
        
        if (hasPNameElement) {
          name = await page.$eval('#p_name', el => el.textContent.trim());
          console.log('Found user name from p_name element:', name);
          
          // Try to extract reg number from other elements near the name
          try {
            // Sometimes regno is shown in a nearby element with class "text-muted"
            const regnoElement = await page.$('.profile_name .text-muted, .student-info .text-muted');
            if (regnoElement) {
              const regnoText = await page.evaluate(el => el.textContent.trim(), regnoElement);
              // Extract digits from the text
              const regMatch = regnoText.match(/(\d+)/);
              if (regMatch && regMatch[1]) {
                regnoExtracted = regMatch[1];
                console.log('Found registration number:', regnoExtracted);
              }
            }
          } catch (regnoError) {
            console.log('Error extracting registration number:', regnoError.message);
          }
        }
      } catch (pNameError) {
        console.log('Error extracting from p_name element:', pNameError.message);
      }

      // Try the profile_name div structure if p_name wasn't found or name is still empty
      if (!name) {
        try {
          const hasProfileNameDiv = await page.$('.profile_name') !== null;
          console.log('Profile name div found:', hasProfileNameDiv);
          
          if (hasProfileNameDiv) {
            // Extract the text content from the span with id "ctl00_cphHeading_Logoutout1_lblId"
            const userDetailsText = await page.$eval('.profile_name span.aspLabel', el => el.textContent.trim());
            console.log('Found user details text from profile_name:', userDetailsText);
            
            // Extract name and regno using regex
            const userDetailsMatch = userDetailsText.match(/^(.*?)\s*\((\d+)\)$/);
            if (userDetailsMatch && userDetailsMatch.length >= 3) {
              name = userDetailsMatch[1].trim();
              regnoExtracted = userDetailsMatch[2].trim();
              console.log('Successfully extracted from profile_name div:', { name, regnoExtracted });
            }
          }
        } catch (profileNameError) {
          console.log('Error extracting from profile_name div:', profileNameError.message);
        }
      }

      // If we still couldn't extract from the specific structure, try the general selectors
      if (!name || name === 'Unknown') {
        // Try multiple selectors to find user info
        const userDetailsSelectors = [
          '#ctl00_cphHeading_Logoutout1_lblId',
          '.profile_name span',
          'span.aspLabel',
          '.profile_name span[id*="lblId"]',
          'span[id$="lblId"]'
        ];

        // Try each selector to find the name and reg number
        let userDetailsElement = null;
        let userDetailsText = '';
        
        for (const selector of userDetailsSelectors) {
          console.log(`Trying selector for user details: ${selector}`);
          try {
            const exists = await page.$(selector) !== null;
            if (exists) {
              userDetailsElement = await page.$(selector);
              userDetailsText = await page.evaluate(el => el.textContent.trim(), userDetailsElement);
              console.log('Found user details text:', userDetailsText);
              break;
            }
          } catch (error) {
            console.log(`Error trying selector ${selector}:`, error.message);
          }
        }

        if (userDetailsText) {
          // Extract name and regno using regex
          const userDetailsMatch = userDetailsText.match(/^(.*?)\s*\((\d+)\)$/);
          if (userDetailsMatch && userDetailsMatch.length >= 3) {
            name = userDetailsMatch[1].trim();
            regnoExtracted = userDetailsMatch[2].trim();
            console.log('Successfully extracted:', { name, regnoExtracted });
          } else {
            // Fallback: Use the provided regno and extract any text that might be the name
            regnoExtracted = regno;
            name = userDetailsText.replace(/\(\d+\)/, '').trim() || 'Unknown';
            console.log('Fallback name extraction:', name);
          }
        }
      }

      // Final fallback if we still couldn't get the name
      if (!name || name === 'Unknown') {
        console.log('User details element not found, using provided registration number');
        regnoExtracted = regno;
        name = 'Unknown';
      }

      // Try to extract department info
      try {
        // Check all links with onclick attribute containing showPO
        const departmentInfo = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[onclick^="showPO"]'));
          if (links.length > 0) {
            // Get the first link's text
            const linkText = links[0].textContent.trim();
            console.log('Found department link text:', linkText);
            return linkText;
          }
          return null;
        });
        
        console.log('Department info from page:', departmentInfo);
        
        if (departmentInfo) {
          // Extract department using regex pattern matching
          const deptMatch = departmentInfo.match(/Programme\s*-\s*(.*?)(?:\s*<br>|\s*$)/i);
          if (deptMatch && deptMatch[1]) {
            department = deptMatch[1].trim();
          } else {
            // Alternative pattern matching
            const altMatch = departmentInfo.match(/P\d+::(.*?)(?:\s*<br>|\s*$)/i);
            if (altMatch && altMatch[1]) {
              department = altMatch[1].trim();
            } else {
              // Just use the whole text if pattern matching fails
              department = departmentInfo.replace(/Programme\s*-\s*/i, '').replace(/<br>.*$/i, '').trim();
            }
          }
          console.log('Extracted department:', department);
        } else {
          // Try using CSS selector directly
          const departmentSelectors = [
            'a[onclick^="showPO"]',
            '.programme-info',
            'a[style*="cursor:pointer"][style*="font-weight:bold"]' // More general selector that might match
          ];
          
          for (const selector of departmentSelectors) {
            console.log(`Trying selector for department: ${selector}`);
            try {
              const exists = await page.$(selector) !== null;
              if (exists) {
                const deptText = await page.$eval(selector, el => el.textContent.trim());
                console.log('Found department text:', deptText);
                
                // Try to extract department using different patterns
                if (deptText.includes('Programme - ')) {
                  department = deptText.split('Programme - ')[1].split('<br>')[0].trim();
                } else if (deptText.includes('::')) {
                  department = deptText.split('::')[1].split('<br>')[0].trim();
                } else {
                  department = deptText;
                }
                
                console.log('Extracted department:', department);
                break;
              }
            } catch (error) {
              console.log(`Error trying selector ${selector}:`, error.message);
            }
          }
        }
      } catch (deptError) {
        console.error('Error extracting department:', deptError.message);
        department = 'Unknown';
      }
    } catch (error) {
      console.error('Error fetching user details:', error.message);
      // Use default values if extraction fails
      name = 'Unknown';
      regnoExtracted = regno;
      department = 'Unknown';
    }

    // Final fallback: If department is still empty or undefined
    if (!department) {
      department = 'Computer Science and Engineering'; // Default department as fallback
    }

    console.log('Final user data:', { name, regno: regnoExtracted || regno, department, profilePicture: imagePath });

    const userData = { 
      regno: regnoExtracted || regno, 
      name: name !== 'Unknown' ? name : 'LPU Student', // Use a better default name if unknown
      department, 
      profilePicture: imagePath,
      email: `${regnoExtracted || regno}@lpu.in` // Generate school email as fallback
    };

    // Save user data to MongoDB
    await UserData.findOneAndUpdate({ regno: regnoExtracted || regno }, userData, { upsert: true, new: true });

    console.log('User data saved to MongoDB');

    console.log('Login successful!');
    await browser.close();

    // Generate JWT token
    const token = jwt.sign({ regno: regnoExtracted || regno }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Login successful',
      token,
      user: { 
        name, 
        regno: regnoExtracted || regno,
        department,
        profilePicture: imagePath // Ensure this is the relative path
      },
      userData
    });
  } catch (error) {
    console.error('Error during login process:', error);
    res.status(500).json({ error: 'An internal server error occurred. Please try again later.' });
  }
});

// User data endpoint
app.get('/userdata', authenticateToken, async (req, res) => {
  try {
    const { regno } = req.user;
    const userData = await UserData.findOne({ regno });
    if (!userData) return res.status(404).json({ error: 'User not found' });

    res.json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
