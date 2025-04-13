import mongoose from 'mongoose';

// User schema
const userSchema = new mongoose.Schema({
  regno: String,
  name: String,
  email: String,
  department: String,
  profilePicture: String,
  password: String,
  publicKey: String,
  online: { type: Boolean, default: false },
  lastSeen: Date
});

// Message schema
const messageSchema = new mongoose.Schema({
  chatId: String,
  sender: String,
  text: String,
  isEncrypted: { type: Boolean, default: true },
  encryptedData: Object,
  read: [String], // Array of user IDs who have read this message
  createdAt: { type: Date, default: Date.now }
});

// Chat schema
const chatSchema = new mongoose.Schema({
  name: String,
  isGroup: { type: Boolean, default: false },
  participants: [String],
  createdAt: { type: Date, default: Date.now },
  lastMessage: String,
  lastMessageTime: Date,
  type: { type: String, default: 'personal' }, // personal, academic, club
  status: { type: String, default: 'active' } // active, pending, blocked
});

// Chat request schema
const chatRequestSchema = new mongoose.Schema({
  sender: String,
  recipient: String,
  message: String,
  status: { type: String, default: 'pending' }, // pending, accepted, rejected
  createdAt: { type: Date, default: Date.now }
});

// Create models
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
const Chat = mongoose.models.Chat || mongoose.model('Chat', chatSchema);
const ChatRequest = mongoose.models.ChatRequest || mongoose.model('ChatRequest', chatRequestSchema);

export { User, Message, Chat, ChatRequest };
