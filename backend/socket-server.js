import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User, Chat, Message, ChatRequest } from './models.js';

dotenv.config();

// Store user's public keys in memory for quick access
const publicKeys = {};
const connectedUsers = {};

export function setupSocketIO(server) {
  const io = new Server(server, {
    cors: {
      origin: '*', // In production, restrict to your domains
      methods: ['GET', 'POST']
    }
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = user;
      next();
    } catch (error) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', async (socket) => {
    const userId = socket.user.regno;
    
    // Store socket ID with user ID
    connectedUsers[userId] = socket.id;
    
    // Make connectedUsers accessible to routes
    io.connectedUsers = connectedUsers;
    
    console.log(`User connected: ${userId}`);
    
    // Update user status to online
    try {
      await User.findOneAndUpdate(
        { regno: userId },
        { online: true, lastSeen: new Date() },
        { upsert: true }
      );
      
      // Broadcast user online status to relevant chats
      const userChats = await Chat.find({ participants: userId });
      userChats.forEach(chat => {
        chat.participants.forEach(participant => {
          if (participant !== userId && connectedUsers[participant]) {
            io.to(connectedUsers[participant]).emit('user_status', { userId, online: true });
          }
        });
      });
    } catch (error) {
      console.error('Error updating user online status:', error);
    }
    
    // Register user's public key
    socket.on('share_public_key', async (data) => {
      try {
        // Store in memory for quick access
        publicKeys[data.userId] = data.publicKey;
        
        // Also store in database for persistence
        await User.findOneAndUpdate(
          { regno: data.userId },
          { publicKey: data.publicKey },
          { upsert: true }
        );
        
        // Share all available public keys with this user
        socket.emit('public_keys', publicKeys);
      } catch (error) {
        console.error('Error storing public key:', error);
      }
    });
    
    // Send encrypted message
    socket.on('send_message', async (data) => {
      try {
        // Find the chat that contains both sender and recipient
        const chat = await Chat.findOne({ 
          $or: [
            { isGroup: true, _id: data.to },
            { isGroup: false, participants: { $all: [userId, data.to] } }
          ]
        });
        
        if (!chat) {
          console.error('Chat not found');
          return;
        }
        
        // Create and save the encrypted message
        const newMessage = new Message({
          chatId: chat._id,
          sender: userId,
          isEncrypted: true,
          encryptedData: {
            encryptedMessage: data.encryptedMessage,
            encryptedKey: data.encryptedKey,
          }
        });
        
        await newMessage.save();
        
        // Update the chat's last message
        chat.lastMessage = '🔒 Encrypted message';
        chat.lastMessageTime = new Date();
        await chat.save();
        
        // Forward the encrypted message to the recipient
        if (chat.isGroup) {
          // For group chats, send to all participants
          chat.participants.forEach(participant => {
            if (participant !== userId && connectedUsers[participant]) {
              io.to(connectedUsers[participant]).emit('receive_message', {
                encryptedMessage: data.encryptedMessage,
                encryptedKey: data.encryptedKey
              });
            }
          });
        } else {
          // For direct messages
          const recipientSocketId = connectedUsers[data.to];
          if (recipientSocketId) {
            io.to(recipientSocketId).emit('receive_message', {
              encryptedMessage: data.encryptedMessage,
              encryptedKey: data.encryptedKey
            });
          }
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });
    
    // Chat request events
    socket.on('send_chat_request', async (data) => {
      try {
        const { recipient, message } = data;
        
        // Check if recipient exists
        const recipientUser = await User.findOne({ regno: recipient });
        if (!recipientUser) {
          socket.emit('error', { message: 'User not found' });
          return;
        }
        
        // Check if a request or chat already exists
        const existingRequest = await ChatRequest.findOne({
          $or: [
            { sender: userId, recipient },
            { sender: recipient, recipient: userId }
          ]
        });
        
        const existingChat = await Chat.findOne({
          isGroup: false,
          participants: { $all: [userId, recipient], $size: 2 }
        });
        
        if (existingRequest || existingChat) {
          socket.emit('error', { message: 'A chat or request already exists with this user' });
          return;
        }
        
        // Create a new chat request
        const chatRequest = new ChatRequest({
          sender: userId,
          recipient,
          message
        });
        
        await chatRequest.save();
        
        // Get sender details
        const sender = await User.findOne({ regno: userId });
        
        // Emit event to recipient if online
        const recipientSocketId = connectedUsers[recipient];
        if (recipientSocketId) {
          // Make sure to include all necessary sender info
          io.to(recipientSocketId).emit('chat_request', {
            id: chatRequest._id,
            sender: userId,
            senderName: sender ? sender.name : `User ${userId}`,
            senderAvatar: sender ? sender.profilePicture : null, // Include profilePicture
            message,
            createdAt: chatRequest.createdAt
          });
        }
        
        // Confirm to sender
        socket.emit('chat_request_sent', { success: true });
      } catch (error) {
        console.error('Error sending chat request:', error);
        socket.emit('error', { message: 'Failed to send chat request' });
      }
    });
    
    // Mark messages as read
    socket.on('mark_messages_read', async (data) => {
      try {
        // Update messages in the database
        await Message.updateMany(
          { 
            chatId: data.chatId, 
            sender: { $ne: userId }
          },
          { 
            $addToSet: { read: userId } 
          }
        );
        
        // Notify other users that messages have been read
        const chat = await Chat.findById(data.chatId);
        if (chat) {
          chat.participants.forEach(participant => {
            if (participant !== userId && connectedUsers[participant]) {
              io.to(connectedUsers[participant]).emit('messages_read', {
                chatId: data.chatId,
                userId: userId
              });
            }
          });
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });
    
    // Disconnect handler
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${userId}`);
      
      // Remove from connected users
      delete connectedUsers[userId];
      
      try {
        // Update user status to offline
        await User.findOneAndUpdate(
          { regno: userId },
          { online: false, lastSeen: new Date() }
        );
        
        // Broadcast user offline status to relevant chats
        const userChats = await Chat.find({ participants: userId });
        userChats.forEach(chat => {
          chat.participants.forEach(participant => {
            if (participant !== userId && connectedUsers[participant]) {
              io.to(connectedUsers[participant]).emit('user_status', { userId, online: false });
            }
          });
        });
      } catch (error) {
        console.error('Error updating user offline status:', error);
      }
    });
  });

  return io;
}
