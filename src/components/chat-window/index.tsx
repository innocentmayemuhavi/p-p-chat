import styled from "styled-components";
import { useContext, useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";
import { appContext } from "../../context/app-context";
import { COLORS } from "../../shared/constants";
import { wsService } from "../../services/websocket";
import type { Message } from "../../models";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background: ${COLORS.BACKGROUND};
  position: relative;
  overflow: hidden;
`;

const ChatContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  transition: margin-right 0.3s ease;

  @media (min-width: 1024px) {
    &.drawer-open {
      margin-right: 320px;
    }
  }
`;

const ChatHeader = styled.div`
  background: ${COLORS.WHITE};
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid ${COLORS.BORDER};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: ${COLORS.BACKGROUND};
  }
`;

const Avatar = styled.img`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
`;

const HeaderInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 600;
  font-size: 1.05rem;
  color: ${COLORS.TEXT_PRIMARY};
  margin-bottom: 0.125rem;
`;

const OnlineStatus = styled.div<{ isOnline: boolean }>`
  font-size: 0.8rem;
  color: ${(props) =>
    props.isOnline ? "var(--online-green)" : COLORS.TEXT_SECONDARY};
  display: flex;
  align-items: center;
  gap: 0.375rem;

  &::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${(props) =>
      props.isOnline ? COLORS.ONLINE_GREEN : COLORS.TEXT_SECONDARY};
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: var(--main-bg);
`;

const MessageBubble = styled.div<{ isSent: boolean }>`
  max-width: 60%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  word-wrap: break-word;
  align-self: ${(props) => (props.isSent ? "flex-end" : "flex-start")};
  background: ${(props) =>
    props.isSent ? "var(--sender-card-bg)" : "var(--white)"};
  color: ${(props) =>
    props.isSent ? "var(--white)" : "var(--sender-card-bg)"};
  box-shadow: 0 1px 2px var(--shadow-light);
  justify-self: ${(props) => (props.isSent ? "flex-end" : "flex-start")};
`;

const MessageText = styled.div`
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
  line-height: 1.4;
`;

const MessageTime = styled.div<{ isSent: boolean }>`
  font-size: 0.7rem;
  color: ${(props) =>
    props.isSent ? "var(--white-transparent)" : COLORS.TEXT_SECONDARY};
  text-align: right;
`;

const InputContainer = styled.div`
  background: ${COLORS.WHITE};
  padding: 5px;
  position: sticky;
  bottom: 20px;
  left: 0;
  right: 0;
  max-width: 90%;
  justify-self: center;
  min-width: 600px;
  margin: 0 auto;
  border-radius: 12px;

  &:focus-within {
    border: 1px solid ${COLORS.BORDER};
  }
`;

const InputForm = styled.form`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  outline: none;
  border: none;
  border-radius: 24px;
  font-size: 0.95rem;
  background: ${COLORS.WHITE};
  color: ${COLORS.TEXT_PRIMARY};

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: ${COLORS.TEXT_SECONDARY};
  }
`;

const SendButton = styled.button`
  padding: 0.75rem;
  background: transparent;
  color: ${COLORS.SENDER_BG};
  border: none;
  border-radius: 50%;
  font-family: "Quicksand", sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;

  svg {
    fill: ${COLORS.SENDER_BG};
    width: 24px;
    height: 24px;
    transition: all 0.2s;
  }

  &:hover {
    svg {
      fill: ${COLORS.PRIMARY_LIGHT};
      transform: translateX(2px);
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;

    svg {
      transform: none;
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${COLORS.MAIN_BG};
  font-size: 1.05rem;
  gap: 0.5rem;
`;

const TypingIndicator = styled.div`
  padding: 0.5rem 1rem;
  color: ${COLORS.TEXT_SECONDARY};
  font-size: 0.85rem;
  font-style: italic;
`;

const DateSeparator = styled.div`
  text-align: center;
  font-size: 0.75rem;
  color: ${COLORS.TEXT_SECONDARY};
  padding: 0.5rem 0;
  margin: 0.5rem 0;
`;

const DrawerBackdrop = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 99;
  opacity: ${(props) => (props.isOpen ? "1" : "0")};
  visibility: ${(props) => (props.isOpen ? "visible" : "hidden")};
  transition: opacity 0.3s ease,
    visibility 0s ${(props) => (props.isOpen ? "0s" : "0.3s")};

  @media (min-width: 1024px) {
    display: none;
  }
`;

const ProfileDrawer = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 0;
  right: ${(props) => (props.isOpen ? "0" : "-320px")};
  width: 320px;
  height: 100%;
  background: ${COLORS.WHITE};
  border-left: 1px solid ${COLORS.BORDER};
  transition: right 0.3s ease,
    visibility 0s ${(props) => (props.isOpen ? "0s" : "0.3s")};
  visibility: ${(props) => (props.isOpen ? "visible" : "hidden")};
  z-index: 100;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  border-left: 1px solid ${COLORS.BORDER};
`;

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.15s;

  svg {
    fill: ${COLORS.TEXT_SECONDARY};
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: ${COLORS.BACKGROUND};
  }
`;

const DrawerContent = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const LargeAvatar = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid ${COLORS.BORDER};
`;

const ProfileName = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: ${COLORS.TEXT_PRIMARY};
  margin: 0;
  text-align: center;
`;

const ProfileStatus = styled.div<{ isOnline: boolean }>`
  font-size: 0.9rem;
  color: ${(props) =>
    props.isOnline ? "var(--online-green)" : COLORS.TEXT_SECONDARY};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: "";
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${(props) =>
      props.isOnline ? "var(--online-green)" : COLORS.TEXT_SECONDARY};
  }
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  justify-content: center;
  text-align: center;
`;

const InfoValue = styled.div`
  font-size: 0.95rem;
  color: ${COLORS.TEXT_PRIMARY};
  word-break: break-all;
`;

const Divider = styled.div`
  height: 1px;
  background: ${COLORS.BORDER};
  margin: 0.5rem 0;
`;

const ChatWindow = () => {
  const { user, activeChat, chats, setChats } = useContext(appContext);
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeUser = activeChat ? chats.get(activeChat)?.participant : null;
  console.info("Rendering ChatWindow for activeChat:", activeUser);
  const messages = activeChat ? chats.get(activeChat)?.messages || [] : [];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (activeChat && user) {
      const handleNewMessage = (data: any) => {
        if (data.from === activeChat) {
          addMessage({
            id: data.id,
            from: data.from,
            to: user.id,
            message: data.message,
            timestamp: data.timestamp,
            type: "text",
          });
        }
      };

      const handleTyping = (data: any) => {
        if (data.from === activeChat) {
          setIsTyping(data.isTyping);
          if (data.isTyping) {
            setTimeout(() => setIsTyping(false), 3000);
          }
        }
      };

      wsService.on("message", handleNewMessage);
      wsService.on("typing", handleTyping);

      return () => {
        wsService.off("message", handleNewMessage);
        wsService.off("typing", handleTyping);
      };
    }
  }, [activeChat, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addMessage = (message: Message) => {
    if (activeChat) {
      setChats((prevChats) => {
        const newChats = new Map(prevChats);
        const chat = newChats.get(activeChat);
        if (chat) {
          // Check if message already exists to prevent duplicates
          const messageExists = chat.messages.some(
            (msg) => msg.id === message.id
          );
          if (!messageExists) {
            chat.messages.push(message);
            chat.lastMessage = message.message;
            chat.updatedAt = new Date();
            newChats.set(activeChat, { ...chat });
          }
        }
        return newChats;
      });
    }
  };

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() || !activeChat || !user) return;

    const messageId = `${user.id}-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const newMessage: Message = {
      id: messageId,
      from: user.id,
      to: activeChat,
      message: messageInput.trim(),
      timestamp: new Date().toISOString(),
      type: "text",
    };

    // Add to local state immediately
    addMessage(newMessage);

    // Send via WebSocket
    wsService.sendMessage(activeChat, user.id, messageInput.trim(), messageId);

    setMessageInput("");
  };

  const handleTyping = (value: string) => {
    setMessageInput(value);

    if (activeChat && user) {
      wsService.sendTyping(activeChat, user.id, true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        wsService.sendTyping(activeChat, user.id, false);
      }, 1000);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const renderMessagesWithDates = () => {
    let lastDate = "";
    return messages.map((message) => {
      const messageDate = formatDate(message.timestamp);
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;

      return (
        <div key={message.id}>
          {showDate && <DateSeparator>{messageDate}</DateSeparator>}
          <MessageBubble isSent={message.from === user?.id}>
            <MessageText>{message.message}</MessageText>
            <MessageTime isSent={message.from === user?.id}>
              {formatTime(message.timestamp)}
            </MessageTime>
          </MessageBubble>
        </div>
      );
    });
  };

  if (!activeChat || !activeUser) {
    return (
      <Container>
        <EmptyState>
          <div>Select a chat to start messaging</div>
          <div style={{ fontSize: "0.85rem" }}>
            or search for users to start a new conversation
          </div>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <ChatContent className={isDrawerOpen ? "drawer-open" : ""}>
        <ChatHeader onClick={() => setIsDrawerOpen(true)}>
          <Avatar src={activeUser.avatarUrl} alt={activeUser.name} />
          <HeaderInfo>
            <UserName>{activeUser.name}</UserName>
            <OnlineStatus isOnline={activeUser.isOnline}>
              {activeUser.isOnline ? "Online" : "Offline"}
            </OnlineStatus>
          </HeaderInfo>
        </ChatHeader>

        <MessagesContainer>
          {renderMessagesWithDates()}
          {isTyping && (
            <TypingIndicator>{activeUser.name} is typing...</TypingIndicator>
          )}
          <div ref={messagesEndRef} />
        </MessagesContainer>

        <InputContainer>
          <InputForm onSubmit={handleSendMessage}>
            <Input
              type="text"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => handleTyping(e.target.value)}
            />
            <SendButton type="submit" disabled={!messageInput.trim()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path d="M1.513 1.96a1.374 1.374 0 0 1 1.499-.21l19.335 9.215a1.147 1.147 0 0 1 0 2.07L3.012 22.25a1.374 1.374 0 0 1-1.947-1.46L2.49 12 1.065 3.21a1.375 1.375 0 0 1 .448-1.25Zm2.375 10.79-1.304 8.042L21.031 12 2.584 3.208l1.304 8.042h7.362a.75.75 0 0 1 0 1.5Z"></path>
              </svg>
            </SendButton>
          </InputForm>
        </InputContainer>
      </ChatContent>

      <DrawerBackdrop
        isOpen={isDrawerOpen}
        onClick={() => setIsDrawerOpen(false)}
      />

      <ProfileDrawer isOpen={isDrawerOpen}>
        <DrawerHeader>
          <CloseButton onClick={() => setIsDrawerOpen(false)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
            >
              <path d="M5.72 5.72a.75.75 0 0 1 1.06 0L12 10.94l5.22-5.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L13.06 12l5.22 5.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L12 13.06l-5.22 5.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L10.94 12 5.72 6.78a.75.75 0 0 1 0-1.06Z"></path>
            </svg>
          </CloseButton>
        </DrawerHeader>

        <DrawerContent>
          <ProfileSection>
            <LargeAvatar src={activeUser.avatarUrl} alt={activeUser.name} />
            <ProfileName>{activeUser.name}</ProfileName>
            <InfoSection>
              <InfoItem>
                <InfoValue>{activeUser.email}</InfoValue>
              </InfoItem>

              <InfoItem>
                <InfoValue>{activeUser.mobileNumber || "Not provided"}</InfoValue>
              </InfoItem>
            </InfoSection>
            <ProfileStatus isOnline={activeUser.isOnline}>
              {activeUser.isOnline ? "Online" : "Offline"}
            </ProfileStatus>
          </ProfileSection>

          <Divider />
        </DrawerContent>
      </ProfileDrawer>
    </Container>
  );
};

export default ChatWindow;
