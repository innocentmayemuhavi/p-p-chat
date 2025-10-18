# Testing Guide

## 🧪 Complete Testing Checklist

This guide helps you systematically test all features of the P2P Chat Application.

---

## Prerequisites

Before testing, ensure:

- ✅ Backend server is running on `http://localhost:3001`
- ✅ Frontend is running on `http://localhost:5173`
- ✅ You have two browser windows ready (or use incognito mode)

---

## Test Scenario 1: User Authentication

### Signup Test

**Steps**:

1. Open `http://localhost:5173`
2. Click "Sign up" link
3. Fill in the form:
   - Full Name: `Alice Johnson`
   - Email: `alice@test.com`
   - Mobile: `+1234567890`
   - Password: `password123`
   - Confirm Password: `password123`
4. Click "Sign Up"

**Expected Results**:

- ✅ Success toast notification appears
- ✅ Redirected to chat page
- ✅ User's name appears in sidebar
- ✅ User's avatar displays

**Edge Cases to Test**:

- ❌ Try signing up with same email (should fail)
- ❌ Try signing up with same mobile (should fail)
- ❌ Try mismatched passwords (should fail)
- ❌ Try invalid email format (should fail)
- ❌ Try short password < 6 chars (should fail)

### Login Test

**Steps**:

1. Logout or open new incognito window
2. Go to `http://localhost:5173/login`
3. Try logging in with email:
   - Email/Mobile: `alice@test.com`
   - Password: `password123`
4. Click "Sign In"

**Expected Results**:

- ✅ Success toast appears
- ✅ Redirected to chat page
- ✅ User data loaded correctly

**Test with Mobile**: 5. Logout and login again with mobile: `+1234567890`

**Expected Results**:

- ✅ Login succeeds with mobile number
- ✅ Same user account accessed

**Edge Cases**:

- ❌ Wrong password (should fail)
- ❌ Non-existent email (should fail)
- ❌ Empty fields (should show error)

---

## Test Scenario 2: User Search & Discovery

### Search by Email

**Setup**: Create a second user:

- Name: `Bob Smith`
- Email: `bob@test.com`
- Mobile: `+9876543210`
- Password: `password123`

**Steps** (as Alice):

1. In the search bar, type: `bob@test.com`
2. Wait for search results

**Expected Results**:

- ✅ Bob appears in search results
- ✅ Bob's avatar displays
- ✅ Online badge shows (green = online, gray = offline)
- ✅ Click on Bob opens chat

### Search by Mobile

**Steps** (as Alice):

1. Clear search
2. Type: `+9876543210`

**Expected Results**:

- ✅ Bob appears in results
- ✅ Can click to open chat

**Edge Cases**:

- ❌ Search for non-existent user (no results)
- ❌ Search with less than 3 characters (no search)
- ❌ Search for your own email (shouldn't appear)

---

## Test Scenario 3: Real-Time Messaging

### Basic Messaging

**Setup**:

- Window 1: Alice logged in
- Window 2: Bob logged in

**Steps** (as Alice):

1. Search for Bob and open chat
2. Type message: `Hello Bob!`
3. Click "Send" or press Enter

**Expected Results**:

- ✅ Message appears immediately in Alice's window
- ✅ Message appears immediately in Bob's window (Window 2)
- ✅ Timestamp shows correct time
- ✅ Message bubble is styled correctly (Alice's = purple, Bob's = white)

**Steps** (as Bob): 4. Reply: `Hi Alice! How are you?`

**Expected Results**:

- ✅ Message appears in both windows
- ✅ Correct styling (Bob's messages purple in his view, white in Alice's)

### Date Separators

**Steps**:

1. Send several messages
2. Check date separator

**Expected Results**:

- ✅ "Today" separator appears
- ✅ Messages grouped by date

### Typing Indicators

**Steps** (as Alice):

1. Start typing (don't send)
2. Check Bob's window

**Expected Results**:

- ✅ "Alice is typing..." appears in Bob's window
- ✅ Indicator disappears after 3 seconds
- ✅ Indicator disappears when message sent

**Steps** (as Bob): 3. Type back

**Expected Results**:

- ✅ "Bob is typing..." appears for Alice

---

## Test Scenario 4: Online/Offline Status

### Online Status

**Steps**:

1. Both Alice and Bob logged in
2. Check status badge in chat header
3. Check status badge in sidebar

**Expected Results**:

- ✅ Green badge shows for online users
- ✅ Status text shows "Online"

### Offline Status

**Steps**:

1. Close Bob's browser/tab
2. Wait 2-3 seconds
3. Check Alice's view

**Expected Results**:

- ✅ Bob's badge turns gray
- ✅ Status text shows "Offline"

### Reconnection

**Steps**:

1. Reopen Bob's browser
2. Login as Bob
3. Check Alice's view

**Expected Results**:

- ✅ Bob's badge turns green again
- ✅ Status updates in real-time

---

## Test Scenario 5: Offline Message Queue

### Send to Offline User

**Setup**:

- Alice: Online
- Bob: Offline (browser closed)

**Steps** (as Alice):

1. Select Bob's chat
2. Send message: `Message 1 - offline`
3. Send message: `Message 2 - offline`
4. Send message: `Message 3 - offline`

**Expected Results**:

- ✅ Messages appear in Alice's window
- ✅ Messages marked as sent
- ✅ No error appears

### Receive Offline Messages

**Steps**:

1. Open Bob's browser
2. Login as Bob
3. Go to chat page

**Expected Results**:

- ✅ Toast notification: "You have 3 offline message(s)"
- ✅ All 3 messages appear in chat
- ✅ Correct timestamps preserved
- ✅ Messages in correct order

### Mixed Online/Offline

**Steps**:

1. Start with both online
2. Alice sends: `Message before offline`
3. Bob closes browser
4. Alice sends: `Offline message 1`
5. Alice sends: `Offline message 2`
6. Bob reopens and logs in

**Expected Results**:

- ✅ All messages delivered in order
- ✅ No duplicates
- ✅ Timestamps correct

---

## Test Scenario 6: Multiple Chats

### Chat List Management

**Setup**: Create a third user:

- Name: `Carol Davis`
- Email: `carol@test.com`
- Mobile: `+5555555555`
- Password: `password123`

**Steps** (as Alice):

1. Search for Bob and send a message
2. Search for Carol and send a message
3. Check sidebar

**Expected Results**:

- ✅ Both chats appear in sidebar
- ✅ Last message preview shows
- ✅ Correct timestamps

### Switching Chats

**Steps**:

1. Click Bob's chat
2. Send message to Bob
3. Click Carol's chat
4. Send message to Carol
5. Switch back to Bob

**Expected Results**:

- ✅ Messages persist correctly
- ✅ Active chat highlighted
- ✅ Scroll position maintained
- ✅ No message mix-up

### Unread Counter

**Steps** (as Alice):

1. Be in Bob's chat
2. Have Carol send messages (from another window)
3. Check Carol's chat in sidebar

**Expected Results**:

- ✅ Unread badge shows count
- ✅ Badge disappears when chat opened
- ✅ Count updates in real-time

---

## Test Scenario 7: UI/UX Elements

### Responsive Design

**Steps**:

1. Resize browser window
2. Test on different screen sizes

**Expected Results**:

- ✅ Layout adapts properly
- ✅ Chat remains functional
- ✅ No overlapping elements

### Hover Effects

**Steps**:

1. Hover over chat items
2. Hover over buttons
3. Hover over inputs

**Expected Results**:

- ✅ Background changes on hover
- ✅ Smooth transitions
- ✅ Visual feedback clear

### Empty States

**Steps**:

1. Login with new user (no chats)
2. Check chat window

**Expected Results**:

- ✅ "Select a chat..." message shows
- ✅ Search prompt appears
- ✅ No errors in console

### Toast Notifications

**Check for notifications on**:

- ✅ Signup success
- ✅ Login success
- ✅ Connection established
- ✅ Offline messages received
- ✅ Search errors
- ✅ Network errors

---

## Test Scenario 8: Security & Edge Cases

### Session Persistence

**Steps**:

1. Login as Alice
2. Refresh page

**Expected Results**:

- ✅ Stays logged in
- ✅ Chat history preserved
- ✅ No re-login required

### Logout (Manual Test)

**Steps**:

1. Clear localStorage in DevTools
2. Refresh page

**Expected Results**:

- ✅ Redirected to login
- ✅ Can't access chat page

### Protected Routes

**Steps**:

1. Without logging in, go to: `http://localhost:5173/chat`

**Expected Results**:

- ✅ Redirected to login page
- ✅ Can't access chat without auth

### Concurrent Messages

**Steps**:

1. As Alice and Bob, send messages rapidly
2. Both users typing at same time

**Expected Results**:

- ✅ All messages delivered
- ✅ Correct order maintained
- ✅ No message loss

---

## Test Scenario 9: Performance

### Message Load

**Steps**:

1. Send 50+ messages rapidly
2. Scroll through chat

**Expected Results**:

- ✅ Smooth scrolling
- ✅ No lag
- ✅ Auto-scroll works

### Multiple Users

**Steps**:

1. Open 4-5 browser windows
2. Login different users
3. Send messages between them

**Expected Results**:

- ✅ All connections stable
- ✅ Messages delivered correctly
- ✅ Online status accurate

---

## Test Scenario 10: Error Handling

### Network Disconnect

**Steps**:

1. Disconnect internet
2. Try sending message
3. Reconnect internet

**Expected Results**:

- ✅ Error shown to user
- ✅ Reconnects automatically
- ✅ Pending messages sent

### Server Restart

**Steps**:

1. Stop backend server
2. Try sending message
3. Restart server

**Expected Results**:

- ✅ Error notification
- ✅ WebSocket reconnects
- ✅ Can resume chatting

---

## Browser Compatibility

Test on:

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (if available)

---

## Console Checks

Open DevTools and verify:

- ✅ No console errors
- ✅ No React warnings
- ✅ WebSocket connection established
- ✅ Network requests successful

---

## Final Checklist

Before completing testing:

- [ ] All 10 test scenarios passed
- [ ] No errors in browser console
- [ ] No errors in server console
- [ ] UI looks clean and professional
- [ ] All toast notifications work
- [ ] Online/offline badges accurate
- [ ] Messages deliver instantly
- [ ] Offline messages queue works
- [ ] Typing indicators appear
- [ ] Date separators show correctly
- [ ] Multiple users can chat
- [ ] Search works by email and mobile
- [ ] Authentication secure
- [ ] Session persistence works

---

## 🎯 Pass Criteria

**Minimum requirements to pass**:

- All core features work
- No critical bugs
- UI is clean and usable
- Messages deliver in real-time
- Offline messages queue correctly
- Online status accurate

**Excellent submission**:

- All tests pass
- No console errors
- Smooth user experience
- Clean, professional UI
- Proper error handling
- Good performance

---

## 📝 Bug Reporting Template

If you find issues, document them:

```
**Bug Title**: [Short description]

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected**: [What should happen]

**Actual**: [What actually happened]

**Severity**: [Critical / Major / Minor]

**Screenshot**: [If applicable]
```

---

## ✅ Testing Complete

Once all scenarios pass, the application is ready for demo and submission!

**Good luck with testing!** 🚀
