# Design Document: Peer-to-Peer Chat Messaging Application

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technical Decisions](#technical-decisions)
4. [Data Models](#data-models)
5. [Security Considerations](#security-considerations)
6. [Limitations](#current-limitations)

## Overview

This document explains the design choices, architecture, and assumptions made during the development of the P2P Chat Messaging Application.

### Assumptions

- Users have modern browsers with WebSocket support
- Internet connectivity is generally stable
- User privacy is important but end-to-end encryption is a future enhancement
- The application will start with a small user base (suitable for in-memory storage)

## Architecture

### System Architecture

```
┌─────────────────┐
│  React Frontend │
│   (TypeScript)  │
└────────┬────────┘
         │
         │ HTTP/REST
         │ WebSocket
         │
         ▼
┌─────────────────┐
│  Node.js Server │
│   + WebSocket   │
└────────┬────────┘
         │
         │
         ▼
┌─────────────────┐
│  In-Memory DB   │
│  (Users, Msgs)  │
└─────────────────┘
```

### Component Architecture

#### Frontend Components

1. **Authentication Layer**

   - `LoginPage`: User authentication with email/mobile and password
   - `SignupPage`: New user registration
   - `ProtectedRoute`: Route guard for authenticated access

2. **Chat Interface**

   - `ChatsList`: Sidebar with user search and active chats
   - `ChatWindow`: Main message display and input area
   - `Layout`: Application shell and structure

3. **State Management**

   - `AppContext`: Global state using React Context API
   - Stores: current user, active chat, chat list, messages

4. **Services**
   - `api.ts`: REST API client (Axios)
   - `websocket.ts`: WebSocket client for real-time features

#### Backend Components

1. **REST API**

   - Authentication endpoints (signup, login, get user)
   - User search endpoint
   - JWT middleware for protected routes

2. **WebSocket Server**

   - Connection management
   - Message routing
   - Online status tracking
   - Offline message queuing

3. **Data Storage**
   - User data (email, mobile, password hash, profile)
   - Online users (WebSocket connections)
   - Offline message queue

## Technical Decisions

### 1. WebSocket vs Pure P2P

**Decision**: Use WebSocket with a signaling server instead of pure peer-to-peer WebRTC

### 2. In-Memory Storage

**Decision**: Use JavaScript Maps for data storage
changing API

**Migration Path**:

```javascript
// Current
const users = new Map();

// Future (with database)
const users = await db.users.findAll();
```

### 3. JWT Authentication

**Decision**: Use JWT tokens for authentication

\*Implementation\*\*:

- Token expires in 30 days
- Stored in localStorage
- Sent in Authorization header
- Used for both HTTP and WebSocket authentication

### 4. React Context for State Management

**Decision**: Use React Context API instead of Redux/MobX

### 5. Styled Components

**Decision**: Use styled-components for styling

**Rationale**:

- **Scoped Styles**: No CSS conflicts
- **Dynamic Styling**: Props-based theming
- **TypeScript Support**: Type-safe styling
- **Component Co-location**: Styles live with components

**Alternatives Considered**:

- Tailwind CSS: Great but adds build complexity
- CSS Modules: Less dynamic than styled-components
- Material-UI: Too opinionated for custom design

## Data Models

### User Model

```typescript
interface User {
  id: string; // UUID
  name: string; // Full name
  email: string; // Unique email
  mobile: string; // Unique mobile number
  password: string; // Bcrypt hash
  avatarUrl: string; // Avatar image URL
  createdAt: string; // ISO timestamp
}
```

### Message Model

```typescript
interface Message {
  id: string; // Unique message ID
  from: string; // Sender user ID
  to: string; // Recipient user ID
  message: string; // Message content
  timestamp: string; // ISO timestamp
  type: "text" | "system"; // Message type
  read?: boolean; // Read status (future)
}
```

### Chat Model

```typescript
interface Chat {
  id: string; // Same as participant ID
  participant: User; // The other user
  messages: Message[]; // Array of messages
  lastMessage?: string; // Last message text
  updatedAt: Date; // Last activity
  unreadCount: number; // Unread message count
}
```

### WebSocket Message Protocol

```typescript
// Client -> Server
{
  type: 'authenticate' | 'message' | 'typing' | 'signal',
  token?: string,
  to?: string,
  from?: string,
  message?: string,
  // ... other fields
}

// Server -> Client
{
  type: 'authenticated' | 'message' | 'typing' | 'user-status' | 'offline-messages',
  // ... relevant data
}
```

## Security Considerations

### Current Implementation

1. **Password Security**

   - Passwords hashed with bcrypt (10 salt rounds)
   - Never sent or stored in plain text
   - Not included in API responses

2. **Authentication**

   - JWT with 30-day expiration
   - Protected routes require valid token
   - WebSocket connections require authentication

3. **Input Validation**

   - Email format validation (regex)
   - Mobile number format validation
   - Required field validation

4. **CORS**
   - Enabled for development

### Current Limitations

1. **Single Server**

   - All users connected to one server
   - Limited by single server capacity

2. **In-Memory Storage**

   - Cannot distribute data across servers

3. **No Message Persistence**
   - Only offline queue stored temporarily

#### Message Queue

For high-traffic scenarios:

```
Client ──▶ WebSocket ──▶ RabbitMQ ──▶ Message Worker ──▶ Database
                           │
                           └──▶ Notification Worker
```

### Performance Optimizations

1. **Message Batching**: Group multiple messages
2. **Compression**: Use WebSocket compression
3. **CDN**: Serve static assets from CDN
4. **Lazy Loading**: Load chat history on demand
5. **Pagination**: Implement message pagination
6. **Connection Pooling**: Database connection pools

## Monitoring and Observability

### Recommended Tools

1. **Application Monitoring**

   - New Relic / DataDog
   - Track API latency, error rates
   - WebSocket connection metrics

2. **Logging**

   - Winston / Bunyan for structured logs
   - ELK Stack (Elasticsearch, Logstash, Kibana)
   - Centralized log aggregation

3. **Error Tracking**

   - Sentry for error reporting
   - Track frontend and backend errors
   - Alert on critical issues

4. **Infrastructure**
   - Prometheus for metrics
   - Grafana for dashboards
   - Alert manager for notifications

### Key Metrics to Track

- Active connections (concurrent users)
- Message throughput (messages/second)
- Message delivery latency
- API response times
- Error rates
- Authentication success/failure rates
