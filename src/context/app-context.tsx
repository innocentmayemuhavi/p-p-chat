import { createContext, useState, useEffect } from "react";
import type { ContextFace, UserFace, Chat } from "../models";

const appContext = createContext({
  user: null,
  setUser: () => {},
  activeChat: null,
  setActiveChat: () => {},
  chats: new Map(),
  setChats: () => {},
} as ContextFace);

// Helper to serialize Map to JSON
const serializeChats = (chats: Map<string, Chat>) => {
  const obj: any = {};
  chats.forEach((chat, key) => {
    obj[key] = {
      ...chat,
      // Convert Date objects to strings for storage
      updatedAt:
        chat.updatedAt instanceof Date
          ? chat.updatedAt.toISOString()
          : chat.updatedAt,
    };
  });
  return JSON.stringify(obj);
};

// Helper to deserialize JSON to Map
const deserializeChats = (json: string): Map<string, Chat> => {
  try {
    const obj = JSON.parse(json);
    const map = new Map<string, Chat>();
    Object.keys(obj).forEach((key) => {
      const chat = obj[key];
      // Convert date strings back to Date objects
      if (chat.updatedAt) {
        chat.updatedAt = new Date(chat.updatedAt);
      }
      map.set(key, chat);
    });
    return map;
  } catch (error) {
    console.error("Error deserializing chats:", error);
    return new Map();
  }
};

// Get storage key for user-specific chats
const getChatsStorageKey = (userId: string | null) => {
  return userId ? `chats_${userId}` : "chats";
};

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserFace | null>(() => {
    // Load user from localStorage on initial mount
    const savedUser = localStorage.getItem("currentUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activeChat, setActiveChat] = useState<string | null>(() => {
    return localStorage.getItem("activeChat") || null;
  });

  const [chats, setChats] = useState<Map<string, Chat>>(() => {
    // Load chats from localStorage on initial mount
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      const storageKey = getChatsStorageKey(userData.id);
      const savedChats = localStorage.getItem(storageKey);
      if (savedChats) {
        console.log("Loading chats from localStorage for user:", userData.id);
        const loadedChats = deserializeChats(savedChats);
        console.log("Loaded chats count:", loadedChats.size);
        return loadedChats;
      }
    }
    return new Map();
  });

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));

      // Load user-specific chats when user changes (e.g., after login)
      const storageKey = getChatsStorageKey(user.id);
      const savedChats = localStorage.getItem(storageKey);
      if (savedChats) {
        console.log("Loading chats after user set for:", user.id);
        const loadedChats = deserializeChats(savedChats);
        console.log("Loaded chats count:", loadedChats.size);
        setChats(loadedChats);
      }
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [user]);

  // Save activeChat to localStorage whenever it changes
  useEffect(() => {
    if (activeChat) {
      localStorage.setItem("activeChat", activeChat);
    } else {
      localStorage.removeItem("activeChat");
    }
  }, [activeChat]);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (user && chats.size > 0) {
      const storageKey = getChatsStorageKey(user.id);
      console.log(
        "Saving chats to localStorage for user:",
        user.id,
        "Count:",
        chats.size
      );
      localStorage.setItem(storageKey, serializeChats(chats));
    }
  }, [chats, user]);

  return (
    <appContext.Provider
      value={{ user, setUser, activeChat, setActiveChat, chats, setChats }}
    >
      {children}
    </appContext.Provider>
  );
};

export { appContext, AppProvider };
