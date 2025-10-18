# Peer-to-Peer Chat Messaging Application

A modern, real-time peer-to-peer chat application built with React, TypeScript, Node.js, and WebSockets. This application allows users to communicate directly with each other, with offline message queuing and real-time online status indicators.

## 🚀 Features

- **User Authentication**: Secure signup and login with email and mobile number
- **Direct Peer-to-Peer Messaging**: Real-time messaging between users
- **Offline Message Queue**: Messages are stored and delivered when the recipient comes online
- **Online Status Indicators**: Green badge shows when users are online
- **User Search**: Find other users by email or mobile number
- **Typing Indicators**: See when the other person is typing
- **Modern UI**: Clean, intuitive interface built with Styled Components and Quicksand font
- **Persistent Sessions**: JWT-based authentication with 30-day validity

## 📋 Technical Stack

### Frontend

- **React 19** with TypeScript
- **React Router** for navigation
- **Styled Components** for styling
- **WebSocket Client** for real-time communication
- **Axios** for HTTP requests
- **React Hot Toast** for notifications

### Backend

- **Node.js** with Express
- **WebSocket (ws)** for real-time messaging
- **JWT** for authentication
- **bcryptjs** for password hashing
- **In-memory storage** (can be replaced with a database)

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Step 1: Install Dependencies

**✨ Auto-Install Configured**: Both frontend and backend dependencies install automatically!

```powershell
# From project root - installs both FE and server dependencies
npm install
# or
yarn install
```

This single command will:

- Install all frontend dependencies
- Automatically install server dependencies (via postinstall hook)

### Step 2: Configuration

The application comes with default configuration files:

**Backend (.env in server folder)**:

```
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

**Frontend (.env in project root)**:

```
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

⚠️ **Important**: Change the `JWT_SECRET` in production!

### Step 3: Run the Application

**✨ Auto-Start Configured**: Both frontend and backend start together!

```powershell
npm run dev
# or
yarn dev
```

This single command will:

- Start the backend server on `http://localhost:3001`
- Start the frontend dev server on `http://localhost:5173`

Both servers run concurrently in the same terminal!

## 📖 Usage Guide

### 1. Create an Account

- Navigate to the signup page
- Enter your full name, email, mobile number, and password
- Click "Sign Up"

### 2. Login

- Enter your email or mobile number
- Enter your password
- Click "Sign In"

### 3. Start Chatting

- Use the search bar to find users by their email or mobile number
- Click on a user to start a conversation
- Type your message and hit Send
- Messages are delivered in real-time if the user is online
- If the user is offline, messages are queued and delivered when they come online

### 4. Features in the Chat Interface

- **Green badge**: User is online
- **Gray badge**: User is offline
- **Typing indicator**: Shows when the other person is typing
- **Message timestamps**: Each message shows the time it was sent
- **Date separators**: Messages are grouped by date (Today, Yesterday, etc.)

## 🏗️ Architecture

### Frontend Architecture

```
src/
├── components/
│   ├── cards/           # Reusable card components
│   ├── chat-window/     # Main chat interface
│   ├── chats-list/      # Sidebar with user search and chat list
│   └── layout/          # App layout wrapper
├── context/
│   └── app-context.tsx  # Global state management
├── models/
│   └── index.ts         # TypeScript interfaces
├── pages/
│   ├── auth/
│   │   ├── login/       # Login page
│   │   └── signup/      # Signup page
│   ├── chat/            # Main chat page
│   └── not-found/       # 404 page
├── services/
│   ├── api.ts           # REST API client
│   └── websocket.ts     # WebSocket client
└── shared/
    ├── constants/       # App constants and configuration
    └── utils/           # Utility functions
```

### Backend Architecture

```
server/
├── index.js             # Main server file
├── package.json         # Server dependencies
├── nodemon.json         # Nodemon configuration
├── jest.config.js       # Jest test configuration
├── users-data.json      # User data storage
└── __tests__/           # Server tests
```

The backend server (`server/index.js`) provides:

1. **REST API Endpoints**:

   - `POST /api/auth/signup` - User registration
   - `POST /api/auth/login` - User login
   - `GET /api/auth/me` - Get current user
   - `GET /api/users/search` - Search users

2. **WebSocket Server**:
   - Authentication with JWT
   - Real-time message delivery
   - Online status tracking
   - Typing indicators
   - Offline message queuing

### Data Flow

1. **Authentication**:

   - User signs up/logs in via REST API
   - Server returns JWT token
   - Token stored in localStorage
   - Token used for subsequent API calls and WebSocket authentication

2. **Real-time Messaging**:

   - Client connects to WebSocket server with JWT token
   - Server tracks online users
   - Messages sent via WebSocket
   - If recipient is online: message delivered immediately
   - If recipient is offline: message stored in queue
   - When user comes online: queued messages are delivered

3. **Online Status**:
   - WebSocket connection = user is online
   - Server broadcasts status changes to all connected users
   - Green badge displayed for online users

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: 30-day expiration
- **Input Validation**: Email and mobile number format validation
- **Protected Routes**: Authentication required for chat features
- **Token-based WebSocket**: WebSocket connections require valid JWT

## 🎨 UI/UX Features

- **Quicksand Font**: Modern, clean typography
- **Responsive Design**: Works on desktop and tablet
- **Color Scheme**:
  - Primary: Purple (#7C3AED)
  - Online Green: #10B981
  - Clean whites and grays
- **Smooth Animations**: Hover effects and transitions
- **Message Bubbles**: Different styles for sent/received messages
- **Auto-scroll**: Chat scrolls to latest message
- **Toast Notifications**: User-friendly feedback for all actions

## 📦 Dependencies

### Frontend Dependencies

- react, react-dom: ^19.1.1
- react-router-dom: ^7.9.4
- styled-components: ^6.1.19
- axios: ^1.6.0
- react-hot-toast: ^2.4.1

### Backend Dependencies

- express: ^4.18.2
- ws: ^8.14.2
- jsonwebtoken: ^9.0.2
- bcryptjs: ^2.4.3
- cors: ^2.8.5
- dotenv: ^16.3.1

## 🔧 Development

### Run in Development Mode

**Both servers** (with auto-reload):

```powershell
npm run dev
# or
yarn dev
```

Frontend runs on `http://localhost:5173` with hot-reload  
Backend runs on `http://localhost:3001` with nodemon auto-reload

### Run Tests

**✨ Testing Configured**: Jest tests for both frontend (React Testing Library) and backend!

```powershell
# Run all tests (FE + BE)
npm test
# or
yarn test

# Run tests in watch mode
npm run test:watch
# or
yarn test:watch

# Run frontend tests only
npm run test:client
# or
yarn test:client

# Run backend tests only
npm run test:server
# or
yarn test:server
```

See [JEST_GUIDE.md](JEST_GUIDE.md) for detailed testing documentation.

### Build for Production

```powershell
npm run build
```

### Lint Code

```powershell
npm run lint
```

## 🚀 Deployment Considerations

### For Production Deployment:

1. **Environment Variables**:

   - Change `JWT_SECRET` to a strong random string
   - Update `VITE_API_URL` and `VITE_WS_URL` to production URLs

2. **Database**:

   - Replace in-memory storage with PostgreSQL, MongoDB, or similar
   - Implement proper data persistence

3. **Security**:

   - Enable HTTPS/WSS
   - Add rate limiting
   - Implement CSRF protection
   - Add input sanitization

4. **Scalability**:
   - Use Redis for WebSocket session management
   - Implement load balancing
   - Use a message queue (RabbitMQ, Kafka) for message processing

## 📝 Design Decisions

### Why WebSocket Instead of Pure P2P?

- **Signaling Server**: WebSocket server acts as a signaling server for connection establishment
- **Reliability**: More reliable than pure P2P (NAT traversal issues)
- **Offline Messages**: Centralized server enables offline message queuing
- **Scalability**: Easier to scale and monitor

### JWT vs Sessions

- **Stateless**: JWT enables stateless authentication
- **Scalability**: Easier to scale horizontally
- **Mobile-friendly**: Better for mobile apps
- **Long-lived**: 30-day expiration reduces login friction


