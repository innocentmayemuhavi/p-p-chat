import styled from "styled-components";
import { useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout";
import ChatsList from "../../components/chats-list";
import ChatWindow from "../../components/chat-window";
import { appContext } from "../../context/app-context";
import { authAPI, userAPI } from "../../services/api";
import { wsService } from "../../services/websocket";
import toast from "react-hot-toast";
import { ROUTES } from "../../shared/constants";
import type { Chat } from "../../models";

const StyledPage = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100vh;
`;

const ChatPage = () => {
  const { user, setUser, chats, setChats, activeChat } = useContext(appContext);
  const navigate = useNavigate();
  const activeChatRef = useRef(activeChat);

  // Keep ref in sync with activeChat
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    // Check if already initialized to prevent showing toast multiple times
    if (!user) {
      initializeApp();
    }
  }, []);

  const initializeApp = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate(ROUTES.LOGIN);
        return;
      }

      // Get current user
      const response = await authAPI.getCurrentUser();
      setUser(response.user);

      // Connect to WebSocket
      const peerId = `peer-${response.user.id}-${Date.now()}`;
      await wsService.connect(token, peerId);

      // Setup WebSocket handlers
      setupWebSocketHandlers();

      // Only show toast once when successfully connected
      const hasShownToast = sessionStorage.getItem("connectionToastShown");
      if (!hasShownToast) {
        toast.success("Connected successfully");
        sessionStorage.setItem("connectionToastShown", "true");
      }
    } catch (error) {
      console.error("Initialization error:", error);
      toast.error("Failed to connect");
      localStorage.removeItem("token");
      navigate(ROUTES.LOGIN);
    }
  };

  const setupWebSocketHandlers = () => {
    // Handle offline messages
    wsService.on("offline-messages", (data: any) => {
      if (data.messages && data.messages.length > 0) {
        data.messages.forEach((msg: any) => {
          addMessageToChat(msg.from, msg);
        });
        toast.success(`You have ${data.messages.length} offline message(s)`);
      }
    });

    // Handle incoming messages globally (creates chat if needed)
    // Skip if message is for active chat - let ChatWindow handle it to avoid duplicates
    wsService.on("message", (data: any) => {
      console.log("Global message handler - received message from:", data.from);
      // Only add message if not from the currently active chat
      if (activeChatRef.current !== data.from) {
        addMessageToChat(data.from, data);
      } else {
        console.log("Skipping global handler - message is for active chat");
      }
    });

    // Handle user status updates
    wsService.on("user-status", (data: any) => {
      setChats((prevChats) => {
        const newChats = new Map(prevChats);
        const chat = newChats.get(data.userId);
        if (chat) {
          chat.participant.isOnline = data.isOnline;
          newChats.set(data.userId, { ...chat });
        }
        return newChats;
      });
    });
  };

  const addMessageToChat = async (userId: string, message: any) => {
    // Check if chat exists, if not fetch user details and create it
    if (!chats.has(userId)) {
      try {
        console.log("Creating new chat for user:", userId);
        const response = await userAPI.getUserById(userId);
        const newUser = response.user;

        const newChat: Chat = {
          id: newUser.id,
          participant: newUser,
          messages: [],
          lastMessage: undefined,
          updatedAt: new Date(),
          unreadCount: 0,
        };

        setChats((prevChats) => {
          const newChats = new Map(prevChats);
          newChats.set(userId, newChat);
          return newChats;
        });

        console.log("New chat created for:", newUser.name);
      } catch (error) {
        console.error("Error creating chat for user:", userId, error);
        toast.error("Failed to load chat");
        return;
      }
    }

    setChats((prevChats) => {
      const newChats = new Map(prevChats);
      let chat = newChats.get(userId);

      if (!chat) {
        // This shouldn't happen but just in case
        return newChats;
      }

      // Check if message already exists to prevent duplicates
      const messageExists = chat.messages.some((msg) => msg.id === message.id);
      if (!messageExists) {
        chat.messages.push({
          id: message.id,
          from: message.from,
          to: message.to,
          message: message.message,
          timestamp: message.timestamp,
          type: "text",
        });

        chat.lastMessage = message.message;
        chat.updatedAt = new Date();

        // Increment unread if not in active chat
        if (activeChat !== userId) {
          chat.unreadCount += 1;
        }

        newChats.set(userId, { ...chat });
      }

      return newChats;
    });
  };

  // Handle when user selects a search result
  useEffect(() => {
    if (activeChat && user) {
      // Check if chat already exists
      if (!chats.has(activeChat)) {
        // This is a new chat from search - need to create it
        // The participant info will come from the search result
        // We'll handle this in the ChatsList component
      } else {
        // Mark messages as read
        setChats((prevChats) => {
          const newChats = new Map(prevChats);
          const chat = newChats.get(activeChat);
          if (chat) {
            chat.unreadCount = 0;
            newChats.set(activeChat, { ...chat });
          }
          return newChats;
        });
      }
    }
  }, [activeChat]);

  // Create chat when selecting from search
  useEffect(() => {
    if (activeChat && user && !chats.has(activeChat)) {
      // We need to get user info - this will be handled by updating context
      // when user is selected from search in ChatsList component
    }
  }, [activeChat, chats, user]);

  return (
    <Layout>
      <StyledPage>
        <ChatsList />
        <ChatWindow />
      </StyledPage>
    </Layout>
  );
};

export default ChatPage;
