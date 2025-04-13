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
import bcrypt from 'bcrypt';
import http from 'http';
import { setupSocketIO } from './socket-server.js';
import { User, Chat, Message, ChatRequest } from './models.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// Create HTTP server for Socket.IO
const server = http.createServer(app);

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

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
    const existingUser = await User.findOne({ regno });
    if (existingUser && existingUser.password) {
      const passwordMatch = await bcrypt.compare(password, existingUser.password);
      if (passwordMatch) {
        const token = jwt.sign({ regno }, JWT_SECRET, { expiresIn: '1h' });
        return res.json({
          message: 'Login successful',
          token,
          user: { 
            name: existingUser.name, 
            regno: existingUser.regno,
            department: existingUser.department,
            profilePicture: existingUser.profilePicture
          },
          userData: existingUser
        });
      }
    }

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://ums.lpu.in/lpuums/LoginNew.aspx', { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[name="txtU"]', { timeout: 5000 });
    await page.type('input[name="txtU"]', regno);
    await page.evaluate(() => {
      const input = document.querySelector('input[name="txtU"]');
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(1000);
    await page.waitForSelector('input[name="TxtpwdAutoId_8767"]', { timeout: 5000 });
    await page.type('input[name="TxtpwdAutoId_8767"]', password);
    await page.click('#iBtnLogins150203125');
    await page.waitForTimeout(2000);

    const errorMessage = await page.$eval('#lblMsg', (el) => el.textContent.trim()).catch(() => null);
    if (errorMessage && errorMessage.includes('Invalid Username or Password')) {
      await browser.close();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (existingUser) {
      const hashedPassword = await bcrypt.hash(password, 10);
      existingUser.password = hashedPassword;
      await existingUser.save();
      await browser.close();
      const token = jwt.sign({ regno }, JWT_SECRET, { expiresIn: '1h' });
      return res.json({
        message: 'Login successful',
        token,
        user: { 
          name: existingUser.name, 
          regno: existingUser.regno,
          department: existingUser.department,
          profilePicture: existingUser.profilePicture
        },
        userData: existingUser
      });
    }

    await page.goto('https://ums.lpu.in/lpuums/StudentDashboard.aspx', { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    let imagePath = null;
    try {
      const selectors = ['#p_picture', '.profile_outer img', '#ctl00_cphHeading_ImageStudent', 'img[src*="DisplayImageforprofileupdation"]'];
      let base64Image = null;
      await page.waitForTimeout(3000);
      for (const selector of selectors) {
        const exists = await page.$(selector) !== null;
        if (exists) {
          const srcType = await page.$eval(selector, img => img.src.startsWith('data:image') ? 'base64' : 'url');
          if (srcType === 'base64') {
            base64Image = await page.$eval(selector, img => img.src.split(',')[1]);
            if (base64Image) break;
          }
        }
      }
      const uploadsDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
      }
      imagePath = path.join(uploadsDir, `${regno}.jpg`);
      if (base64Image) {
        const imageBuffer = Buffer.from(base64Image, 'base64');
        fs.writeFileSync(imagePath, imageBuffer);
        imagePath = `/uploads/${regno}.jpg`;
      }
    } catch (error) {
      console.error('Error processing profile photo:', error.message);
    }

    let name = '';
    let regnoExtracted = '';
    let department = '';
    try {
      const hasPNameElement = await page.$('#p_name') !== null;
      if (hasPNameElement) {
        name = await page.$eval('#p_name', el => el.textContent.trim());
        const regnoElement = await page.$('.profile_name .text-muted, .student-info .text-muted');
        if (regnoElement) {
          const regnoText = await page.evaluate(el => el.textContent.trim(), regnoElement);
          const regMatch = regnoText.match(/(\d+)/);
          if (regMatch && regMatch[1]) {
            regnoExtracted = regMatch[1];
          }
        }
      }
      if (!name) {
        const hasProfileNameDiv = await page.$('.profile_name') !== null;
        if (hasProfileNameDiv) {
          const userDetailsText = await page.$eval('.profile_name span.aspLabel', el => el.textContent.trim());
          const userDetailsMatch = userDetailsText.match(/^(.*?)\s*\((\d+)\)$/);
          if (userDetailsMatch && userDetailsMatch.length >= 3) {
            name = userDetailsMatch[1].trim();
            regnoExtracted = userDetailsMatch[2].trim();
          }
        }
      }
      if (!name || name === 'Unknown') {
        const userDetailsSelectors = [
          '#ctl00_cphHeading_Logoutout1_lblId',
          '.profile_name span',
          'span.aspLabel',
          '.profile_name span[id*="lblId"]',
          'span[id$="lblId"]'
        ];
        let userDetailsElement = null;
        let userDetailsText = '';
        for (const selector of userDetailsSelectors) {
          const exists = await page.$(selector) !== null;
          if (exists) {
            userDetailsElement = await page.$(selector);
            userDetailsText = await page.evaluate(el => el.textContent.trim(), userDetailsElement);
            break;
          }
        }
        if (userDetailsText) {
          const userDetailsMatch = userDetailsText.match(/^(.*?)\s*\((\d+)\)$/);
          if (userDetailsMatch && userDetailsMatch.length >= 3) {
            name = userDetailsMatch[1].trim();
            regnoExtracted = userDetailsMatch[2].trim();
          } else {
            regnoExtracted = regno;
            name = userDetailsText.replace(/\(\d+\)/, '').trim() || 'Unknown';
          }
        }
      }
      if (!name || name === 'Unknown') {
        regnoExtracted = regno;
        name = 'Unknown';
      }
      try {
        const departmentInfo = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[onclick^="showPO"]'));
          if (links.length > 0) {
            const linkText = links[0].textContent.trim();
            return linkText;
          }
          return null;
        });
        if (departmentInfo) {
          const deptMatch = departmentInfo.match(/Programme\s*-\s*(.*?)(?:\s*<br>|\s*$)/i);
          if (deptMatch && deptMatch[1]) {
            department = deptMatch[1].trim();
          } else {
            const altMatch = departmentInfo.match(/P\d+::(.*?)(?:\s*<br>|\s*$)/i);
            if (altMatch && altMatch[1]) {
              department = altMatch[1].trim();
            } else {
              department = departmentInfo.replace(/Programme\s*-\s*/i, '').replace(/<br>.*$/i, '').trim();
            }
          }
        } else {
          const departmentSelectors = [
            'a[onclick^="showPO"]',
            '.programme-info',
            'a[style*="cursor:pointer"][style*="font-weight:bold"]'
          ];
          for (const selector of departmentSelectors) {
            const exists = await page.$(selector) !== null;
            if (exists) {
              const deptText = await page.$eval(selector, el => el.textContent.trim());
              if (deptText.includes('Programme - ')) {
                department = deptText.split('Programme - ')[1].split('<br>')[0].trim();
              } else if (deptText.includes('::')) {
                department = deptText.split('::')[1].split('<br>')[0].trim();
              } else {
                department = deptText;
              }
              break;
            }
          }
        }
      } catch (deptError) {
        console.error('Error extracting department:', deptError.message);
        department = 'Unknown';
      }
    } catch (error) {
      console.error('Error fetching user details:', error.message);
      name = 'Unknown';
      regnoExtracted = regno;
      department = 'Unknown';
    }
    if (!department) {
      department = 'Computer Science and Engineering';
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = { 
      regno: regnoExtracted || regno, 
      name: name !== 'Unknown' ? name : 'LPU Student',
      department, 
      profilePicture: imagePath,
      email: `${regnoExtracted || regno}@lpu.in`,
      password: hashedPassword
    };

    await User.findOneAndUpdate({ regno: regnoExtracted || regno }, userData, { upsert: true, new: true });

    await browser.close();

    const token = jwt.sign({ regno: regnoExtracted || regno }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Login successful',
      token,
      user: { 
        name, 
        regno: regnoExtracted || regno,
        department,
        profilePicture: imagePath
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
    const userData = await User.findOne({ regno });
    if (!userData) return res.status(404).json({ error: 'User not found' });

    res.json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Chat API Routes
app.get('/api/chats/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const chats = await Chat.find({ participants: userId });
    
    const formattedChats = await Promise.all(chats.map(async (chat) => {
      let name = chat.name;
      let status = "offline";
      let avatar = null;
      
      if (!chat.isGroup) {
        const otherParticipantId = chat.participants.find(p => p !== userId);
        if (otherParticipantId) {
          const otherUser = await User.findOne({ regno: otherParticipantId });
          if (otherUser) {
            name = otherUser.name;
            avatar = otherUser.profilePicture;
          }
        }
      }
      
      const unreadCount = await Message.countDocuments({
        chatId: chat._id,
        sender: { $ne: userId },
        read: { $nin: [userId] }
      });
      
      return {
        id: chat._id,
        name,
        avatar,
        isGroup: chat.isGroup,
        status,
        lastMessage: chat.lastMessage || "No messages yet",
        time: chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
        unread: unreadCount,
        type: chat.type,
        participants: chat.participants,
        online: 0,
        members: chat.participants.length
      };
    }));
    
    res.json(formattedChats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

app.get('/api/messages/:chatId', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(req.user.regno)) {
      return res.status(403).json({ error: 'Not authorized to access this chat' });
    }
    
    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
    
    await Message.updateMany(
      { chatId, sender: { $ne: req.user.regno } },
      { $addToSet: { read: req.user.regno } }
    );
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post('/api/chats', authenticateToken, async (req, res) => {
  try {
    const { participants, name, isGroup, type } = req.body;
    
    if (!participants.includes(req.user.regno)) {
      participants.push(req.user.regno);
    }
    
    if (!isGroup && participants.length === 2) {
      const existingChat = await Chat.findOne({
        isGroup: false,
        participants: { $all: participants, $size: 2 }
      });
      
      if (existingChat) {
        return res.json({ id: existingChat._id });
      }
    }
    
    const chat = new Chat({
      name: isGroup ? name : null,
      isGroup,
      participants,
      type: type || 'personal'
    });
    
    await chat.save();
    
    res.status(201).json({ id: chat._id });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

app.post('/api/messages', authenticateToken, async (req, res) => {
  try {
    const { chatId, text, encryptedData } = req.body;
    
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(req.user.regno)) {
      return res.status(403).json({ error: 'Not authorized to send messages to this chat' });
    }
    
    const message = new Message({
      chatId,
      sender: req.user.regno,
      text,
      isEncrypted: !!encryptedData,
      encryptedData
    });
    
    await message.save();
    
    chat.lastMessage = text || '🔒 Encrypted message';
    chat.lastMessageTime = new Date();
    await chat.save();
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Chat request API routes
app.post('/api/chat-requests', authenticateToken, async (req, res) => {
  try {
    const { recipient, message } = req.body;
    const sender = req.user.regno;
    
    // Check if recipient exists
    const recipientUser = await User.findOne({ regno: recipient });
    if (!recipientUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if a request already exists
    const existingRequest = await ChatRequest.findOne({
      $or: [
        { sender, recipient },
        { sender: recipient, recipient }
      ]
    });
    
    if (existingRequest) {
      return res.status(400).json({ error: 'A chat request already exists between these users' });
    }
    
    // Check if a chat already exists between these users
    const existingChat = await Chat.findOne({
      isGroup: false,
      participants: { $all: [sender, recipient], $size: 2 }
    });
    
    if (existingChat) {
      return res.status(400).json({ error: 'A chat already exists between these users' });
    }
    
    // Create a new chat request
    const chatRequest = new ChatRequest({
      sender,
      recipient,
      message
    });
    
    await chatRequest.save();
    
    // Emit socket event to recipient if online
    const io = req.app.get('io');
    const recipientSocketId = io?.connectedUsers?.[recipient];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('chat_request', {
        id: chatRequest._id,
        sender,
        senderName: req.user.name,
        message,
        createdAt: chatRequest.createdAt
      });
    }
    
    res.status(201).json({ id: chatRequest._id });
  } catch (error) {
    console.error('Error creating chat request:', error);
    res.status(500).json({ error: 'Failed to create chat request' });
  }
});

app.get('/api/chat-requests', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.regno;
    
    // Get all pending requests for this user
    const chatRequests = await ChatRequest.find({ 
      recipient: userId,
      status: 'pending'
    }).sort({ createdAt: -1 });
    
    // Format response with sender details
    const formattedRequests = await Promise.all(chatRequests.map(async (request) => {
      // Use findOne instead of find to get a single user document
      const sender = await User.findOne({ regno: request.sender });
      
      return {
        id: request._id,
        sender: request.sender,
        senderName: sender ? sender.name : `User ${request.sender}`,
        senderAvatar: sender ? sender.profilePicture : null,
        message: request.message,
        createdAt: request.createdAt
      };
    }));
    
    console.log("Formatted requests:", formattedRequests); // Debug log
    res.json(formattedRequests);
  } catch (error) {
    console.error('Error fetching chat requests:', error);
    res.status(500).json({ error: 'Failed to fetch chat requests' });
  }
});

app.post('/api/chat-requests/:id/respond', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const userId = req.user.regno;
    
    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }
    
    // Find the chat request
    const chatRequest = await ChatRequest.findOne({ 
      _id: id,
      recipient: userId,
      status: 'pending'
    });
    
    if (!chatRequest) {
      return res.status(404).json({ error: 'Chat request not found' });
    }
    
    // Update request status
    chatRequest.status = action === 'accept' ? 'accepted' : 'rejected';
    await chatRequest.save();
    
    // If accepted, create a new chat
    let chatId = null;
    if (action === 'accept') {
      const chat = new Chat({
        isGroup: false,
        participants: [chatRequest.sender, userId],
        type: 'personal',
        status: 'active'
      });
      
      await chat.save();
      chatId = chat._id;
      
      // Emit socket event to sender if online
      const io = req.app.get('io');
      const senderSocketId = io?.connectedUsers?.[chatRequest.sender];
      if (senderSocketId) {
        io.to(senderSocketId).emit('chat_request_accepted', {
          requestId: chatRequest._id,
          chatId: chat._id
        });
      }
    }
    
    res.json({ success: true, chatId });
  } catch (error) {
    console.error('Error responding to chat request:', error);
    res.status(500).json({ error: 'Failed to respond to chat request' });
  }
});

// Setup Socket.IO after all routes
const io = setupSocketIO(server);
app.set('io', io); // Make io available for routes

// Start server using the HTTP server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
