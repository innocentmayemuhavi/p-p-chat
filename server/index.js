import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

// File path for persistent storage
const STORAGE_FILE = path.join(__dirname, "users-data.json");

// In-memory storage (replace with database in production)
const users = new Map(); // userId -> user object
const usersByEmail = new Map(); // email -> userId
const usersByMobile = new Map(); // mobile -> userId
const onlineUsers = new Map(); // userId -> { ws, peerId }
const offlineMessages = new Map(); // userId -> array of messages

// Load users from file on startup
const loadUsersFromFile = () => {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, "utf8");
      const parsed = JSON.parse(data);

      // Restore users Map
      if (parsed.users) {
        Object.entries(parsed.users).forEach(([userId, user]) => {
          users.set(userId, user);
        });
      }

      // Restore email index
      if (parsed.usersByEmail) {
        Object.entries(parsed.usersByEmail).forEach(([email, userId]) => {
          usersByEmail.set(email, userId);
        });
      }

      // Restore mobile index
      if (parsed.usersByMobile) {
        Object.entries(parsed.usersByMobile).forEach(([mobile, userId]) => {
          usersByMobile.set(mobile, userId);
        });
      }

      console.log("=== LOADED USERS FROM FILE ===");
      console.log("Total users loaded:", users.size);
      console.log(
        "Users:",
        Array.from(users.values()).map((u) => ({
          name: u.name,
          email: u.email,
        }))
      );
      console.log("==============================");
    }
  } catch (error) {
    console.error("Error loading users from file:", error);
  }
};

// Save users to file
const saveUsersToFile = () => {
  try {
    const data = {
      users: Object.fromEntries(users),
      usersByEmail: Object.fromEntries(usersByEmail),
      usersByMobile: Object.fromEntries(usersByMobile),
    };
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
    console.log("Users saved to file. Total:", users.size);
  } catch (error) {
    console.error("Error saving users to file:", error);
  }
};

// Load users on startup
loadUsersFromFile();

// Log storage status on startup
console.log("=== SERVER STARTUP ===");
console.log("Users in database:", users.size);
console.log("Using file-based persistence:", STORAGE_FILE);
console.log("======================");

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};

// REST API Endpoints

// Signup
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, mobile, name, password } = req.body;

    // Validation
    if (!email || !mobile || !name || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Mobile validation (basic - adjust for your needs)
    const mobileRegex = /^\+?[\d\s\-()]+$/;
    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({ error: "Invalid mobile number format" });
    }

    // Check if user already exists
    if (usersByEmail.has(email)) {
      return res.status(400).json({ error: "Email already registered" });
    }

    if (usersByMobile.has(mobile)) {
      return res
        .status(400)
        .json({ error: "Mobile number already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    const user = {
      id: userId,
      email,
      mobileNumber: mobile, // Changed from 'mobile' to 'mobileNumber' for consistency
      name,
      password: hashedPassword,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name
      )}&background=random`,
      createdAt: new Date().toISOString(),
    };

    users.set(userId, user);
    usersByEmail.set(email, userId);
    usersByMobile.set(mobile, userId);

    console.log("=== NEW USER REGISTERED ===");
    console.log("User ID:", userId);
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Total users now:", users.size);
    console.log("===========================");

    // Save users to file
    saveUsersToFile();

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;

    if (!emailOrMobile || !password) {
      return res
        .status(400)
        .json({ error: "Email/mobile and password are required" });
    }

    // Find user by email or mobile
    let userId =
      usersByEmail.get(emailOrMobile) || usersByMobile.get(emailOrMobile);

    if (!userId) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users.get(userId);

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Search users
app.get("/api/users/search", authenticateToken, (req, res) => {
  try {
    const { query } = req.query;

    console.log("=== SEARCH REQUEST ===");
    console.log("Query:", query);
    console.log("Total users in database:", users.size);

    // Debug: Show first user structure
    if (users.size > 0) {
      const firstUser = Array.from(users.values())[0];
      console.log(
        "Sample user fields:",
        Object.keys(firstUser).filter((k) => k !== "password")
      );
    }

    if (!query) {
      return res.status(400).json({ error: "Search query required" });
    }

    const searchQuery = query.toLowerCase().trim();
    const results = [];
    const seenUsers = new Set();

    // Search through all users for matches
    users.forEach((user) => {
      // Don't include the current user in results
      if (user.id === req.user.userId) {
        return;
      }

      // Check if query matches name, email, or mobile number
      const nameMatch =
        user.name && user.name.toLowerCase().includes(searchQuery);
      const emailMatch =
        user.email && user.email.toLowerCase().includes(searchQuery);
      // Support both 'mobile' and 'mobileNumber' fields for backward compatibility
      const mobileField = user.mobileNumber || user.mobile;
      const mobileMatch = mobileField && mobileField.includes(searchQuery);

      if (nameMatch || emailMatch || mobileMatch) {
        if (!seenUsers.has(user.id)) {
          seenUsers.add(user.id);
          const { password: _, ...userWithoutPassword } = user;
          results.push({
            ...userWithoutPassword,
            isOnline: onlineUsers.has(user.id),
          });
        }
      }
    });

    // Sort results: online users first, then by name
    results.sort((a, b) => {
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      return a.name.localeCompare(b.name);
    });

    // Limit results to 10 for better performance
    const finalResults = results.slice(0, 10);

    console.log("Search results count:", finalResults.length);
    console.log(
      "Results:",
      finalResults.map((u) => ({ name: u.name, email: u.email }))
    );

    res.json({ users: finalResults });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get current user
app.get("/api/auth/me", authenticateToken, (req, res) => {
  try {
    const user = users.get(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      user: {
        ...userWithoutPassword,
        isOnline: true,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user by ID
app.get("/api/users/:userId", authenticateToken, (req, res) => {
  try {
    const { userId } = req.params;
    const user = users.get(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      user: {
        ...userWithoutPassword,
        isOnline: onlineUsers.has(userId),
      },
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// WebSocket connection handling
wss.on("connection", (ws) => {
  let currentUserId = null;

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case "authenticate":
          handleAuthenticate(ws, data);
          break;
        case "signal":
          handleSignal(data);
          break;
        case "message":
          handleMessage(data);
          break;
        case "typing":
          handleTyping(data);
          break;
        default:
          console.log("Unknown message type:", data.type);
      }
    } catch (error) {
      console.error("WebSocket message error:", error);
    }
  });

  ws.on("close", () => {
    if (currentUserId) {
      onlineUsers.delete(currentUserId);
      // Notify all connected users about status change
      broadcastUserStatus(currentUserId, false);
    }
  });

  function handleAuthenticate(ws, data) {
    try {
      const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
      currentUserId = decoded.userId;

      onlineUsers.set(currentUserId, { ws, peerId: data.peerId });

      // Send pending offline messages
      const pendingMessages = offlineMessages.get(currentUserId) || [];
      if (pendingMessages.length > 0) {
        ws.send(
          JSON.stringify({
            type: "offline-messages",
            messages: pendingMessages,
          })
        );
        offlineMessages.delete(currentUserId);
      }

      // Broadcast online status
      broadcastUserStatus(currentUserId, true);

      ws.send(
        JSON.stringify({
          type: "authenticated",
          userId: currentUserId,
        })
      );
    } catch (error) {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Authentication failed",
        })
      );
    }
  }

  function handleSignal(data) {
    const targetUser = onlineUsers.get(data.to);
    if (targetUser) {
      targetUser.ws.send(
        JSON.stringify({
          type: "signal",
          from: data.from,
          signal: data.signal,
          peerId: data.peerId,
        })
      );
    }
  }

  function handleMessage(data) {
    const targetUser = onlineUsers.get(data.to);

    if (targetUser) {
      // User is online, send directly
      targetUser.ws.send(
        JSON.stringify({
          type: "message",
          from: data.from,
          message: data.message,
          timestamp: data.timestamp,
          id: data.id,
        })
      );
    } else {
      // User is offline, store message
      if (!offlineMessages.has(data.to)) {
        offlineMessages.set(data.to, []);
      }
      offlineMessages.get(data.to).push({
        from: data.from,
        message: data.message,
        timestamp: data.timestamp,
        id: data.id,
      });
    }
  }

  function handleTyping(data) {
    const targetUser = onlineUsers.get(data.to);
    if (targetUser) {
      targetUser.ws.send(
        JSON.stringify({
          type: "typing",
          from: data.from,
          isTyping: data.isTyping,
        })
      );
    }
  }

  function broadcastUserStatus(userId, isOnline) {
    const statusMessage = JSON.stringify({
      type: "user-status",
      userId,
      isOnline,
    });

    onlineUsers.forEach((userData, onlineUserId) => {
      if (onlineUserId !== userId) {
        try {
          userData.ws.send(statusMessage);
        } catch (error) {
          console.error("Error broadcasting status:", error);
        }
      }
    });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready`);
});
