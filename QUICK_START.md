# Quick Start Guide

## 🚀 Get Started in 2 Easy Steps!

### Step 1: Install Dependencies

**✨ Auto-Install**: Both frontend and backend dependencies install automatically!

Open PowerShell and run:

```powershell
npm install
# or
yarn install
```

This single command installs dependencies for both frontend and server! 🎉

### Step 2: Start the Application

**✨ Auto-Start**: Both frontend and backend servers start together!

```powershell
npm run dev
# or
yarn dev
```

This single command starts:

- **Frontend** on `http://localhost:5173` 🎨
- **Backend** on `http://localhost:3001` 🚀

Both servers run concurrently in the same terminal!

## 📝 Quick Test

1. **Create First User**:

   - Click "Sign up"
   - Name: Alice
   - Email: alice@test.com
   - Mobile: +1234567890
   - Password: test123

2. **Create Second User**:

   - Open another browser/incognito window
   - Go to `http://localhost:5173`
   - Sign up with different details:
     - Name: Bob
     - Email: bob@test.com
     - Mobile: +9876543210
     - Password: test123

3. **Start Chatting**:

   - As Alice: Search for "bob@test.com"
   - Click on Bob's name
   - Send a message
   - Watch it appear instantly in Bob's window!

4. **Test Offline Messages**:
   - Close Bob's browser
   - As Alice: Send a few messages
   - Open Bob's browser and login
   - Bob receives all offline messages!

## 🎯 Features to Try

- ✅ Real-time messaging
- ✅ Online/offline status (green badge)
- ✅ Typing indicators
- ✅ Message timestamps
- ✅ User search
- ✅ Offline message delivery

## 🧪 Run Tests

**✨ Testing Configured**: Jest tests for both frontend and backend!

```powershell
# Run all tests (FE + BE)
npm test
# or
yarn test

# Run tests in watch mode
npm run test:watch
# or
yarn test:watch
```

See [JEST_GUIDE.md](JEST_GUIDE.md) for detailed testing documentation.

## � Configuration Notes

- **Frontend Port**: Runs on `http://localhost:5173` by default (Vite dev server)
- **Backend Port**: Runs on `http://localhost:3001` by default
- **Auto-Install**: Configured to install both FE and server dependencies automatically
- **Auto-Start**: Configured to start both servers with a single command
- **Tests**: Jest configured for both frontend (React Testing Library) and backend

## �🐛 Troubleshooting

### Port Already in Use

If port 3001 or 5173 is busy:

**Backend**:
Edit `server/.env`:

```
PORT=3002
```

**Frontend**:
Edit `.env`:

```
VITE_API_URL=http://localhost:3002
VITE_WS_URL=ws://localhost:3002
```

### Dependencies Not Installing

```powershell
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

Your P2P Chat Application is now running. Enjoy exploring all the features!

For more details, see the main [README.md](README.md)
