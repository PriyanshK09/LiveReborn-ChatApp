import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User, Chat, Message, ChatRequest } from './models.js';

dotenv.config();

// Replace publicKeys with a single site-wide encryption key
const SITE_ENCRYPTION_KEY = "LPU_LIVE_SECURE_MESSAGING_KEY_2024";
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
      console.log(`Broadcasting online status for user ${userId} to ${userChats.length} chats`);
      
      userChats.forEach(chat => {
        chat.participants.forEach(participantId => {
          if (participantId !== userId && connectedUsers[participantId]) {
            io.to(connectedUsers[participantId]).emit('user_status', { 
              userId, 
              online: true 
            });
          }
        });
      });
    } catch (error) {
      console.error('Error updating user online status:', error);
    }
    
    // Remove the share_public_key handler as it's no longer needed
    
    // Update the send_message handler to use symmetric encryption
    socket.on('send_message', async (data) => {
      try {
        // First, determine if we received a chat ID or a user registration number
        let chatId = null;
        let chat = null;
        
        // Check if data.to is a valid MongoDB ObjectID
        if (mongoose.Types.ObjectId.isValid(data.to)) {
          chatId = new mongoose.Types.ObjectId(data.to);
          // Try to find the chat by ID
          chat = await Chat.findById(chatId);
        } 
        
        // If no valid chat was found and data.to isn't an ObjectID, it might be a user ID
        if (!chat) {
          // Look for a direct chat between the current user and the recipient
          chat = await Chat.findOne({
            isGroup: false,
            participants: { $all: [userId, data.to], $size: 2 }
          });
          
          if (chat) {
            chatId = chat._id;
          } else {
            console.error('No chat found between', userId, 'and', data.to);
            return;
          }
        }
        
        if (!chat) {
          console.error('Chat not found for ID or recipient:', data.to);
          return;
        }
        
        // Find the sender's user object to get their name
        const senderUser = await User.findOne({ regno: userId });
        const senderName = senderUser?.name || `User ${userId}`;
        
        // Extract plain text if provided
        const plainText = data.plainText || null;
        
        // Create and save the message with both encrypted and plain text
        const newMessage = new Message({
          chatId: chat._id,
          sender: userId,
          senderName: senderName, // Store sender name in the message
          text: plainText, // Save plain text version 
          isEncrypted: true,
          encryptedData: {
            encryptedMessage: data.encryptedMessage,
          }
        });
        
        await newMessage.save();
        
        // Update the chat's last message
        const displayMessage = `${senderName}: ${plainText || '🔒 Encrypted message'}`;
        chat.lastMessage = displayMessage.length > 50 ? displayMessage.substring(0, 47) + '...' : displayMessage;
        chat.lastMessageTime = new Date();
        await chat.save();
        
        // Forward the encrypted message to the recipient(s)
        if (chat.isGroup) {
          // For group chats, send to all participants
          chat.participants.forEach(participant => {
            if (participant !== userId && connectedUsers[participant]) {
              io.to(connectedUsers[participant]).emit('receive_message', {
                encryptedMessage: data.encryptedMessage,
                senderName: senderName
              });
            }
          });
        } else {
          // For direct messages
          const recipient = chat.participants.find(p => p !== userId);
          const recipientSocketId = connectedUsers[recipient];
          if (recipientSocketId) {
            io.to(recipientSocketId).emit('receive_message', {
              encryptedMessage: data.encryptedMessage,
              senderName: senderName
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

        // Fetch sender details
        const senderUser = await User.findOne({ regno: userId });

        // Extract first name and full name
        const senderName = senderUser?.name || `User ${userId}`;
        const senderFirstName = senderUser?.name?.split(' ')[0] || `User`;
        const senderAvatar = senderUser?.profilePicture || `/uploads/${userId}.jpg`;

        // Generate sender display name
        const senderDisplayName = `${senderFirstName} (${userId})`;

        // Emit event to recipient if online
        const recipientSocketId = connectedUsers[recipient];
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('chat_request', {
            id: chatRequest._id,
            sender: userId,
            senderName,
            senderFirstName,
            senderDisplayName,
            senderAvatar,
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
        console.log(`Broadcasting offline status for user ${userId} to ${userChats.length} chats`);
        
        userChats.forEach(chat => {
          chat.participants.forEach(participantId => {
            if (participantId !== userId && connectedUsers[participantId]) {
              io.to(connectedUsers[participantId]).emit('user_status', { 
                userId, 
                online: false 
              });
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
