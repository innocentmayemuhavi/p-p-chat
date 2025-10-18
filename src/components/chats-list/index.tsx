import styled from "styled-components";
import { useContext, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { appContext } from "../../context/app-context";
import { COLORS, ROUTES, API_URL } from "../../shared/constants";
import { userAPI } from "../../services/api";
import { wsService } from "../../services/websocket";
import toast from "react-hot-toast";
import type { UserFace, Chat } from "../../models";

const StyledChatsList = styled.div`
  display: flex;
  flex-direction: column;
  width: 320px;
  background-color: ${COLORS.WHITE};
  border-right: 1px solid ${COLORS.BORDER};
  height: 100vh;
  font-family: "Quicksand", sans-serif;
`;

const Header = styled.div`
  padding: 10px 15px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  align-items: center;
  position: relative;
  justify-content: space-between;
  flex-direction: row;

  img {
    height: 60px;
    // width: 100px;
  }
`;

const ProfileButton = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  // padding: 0.5rem;
  border-radius: 8px;
  transition: background 0.15s;
  flex: 1;

  &:hover {
    background: ${COLORS.BACKGROUND};
  }
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const HeaderAvatar = styled.img`
  width: 20px;
  height: 50px;
  border-radius: 50%;

  img {
    height: 40px;
    width: 40px;
    bo
  }
`;

const UserName = styled.div`
  font-weight: 600;
  font-size: 1rem;
  color: ${COLORS.TEXT_PRIMARY};
`;

const ProfileDropdown = styled.div<{ show: boolean }>`
  display: ${(props) => (props.show ? "block" : "none")};
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${COLORS.WHITE};
  border: 1px solid ${COLORS.BORDER};
  border-radius: 8px;
  margin-top: 0.5rem;
  box-shadow: 0 4px 6px var(--shadow-strong);
  z-index: 100;
`;

const DropdownItem = styled.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.15s;
  color: ${COLORS.TEXT_PRIMARY};
  font-size: 0.9rem;

  &:hover {
    background: ${COLORS.BACKGROUND};
  }

  &:first-child {
    border-radius: 8px 8px 0 0;
  }

  &:last-child {
    border-radius: 0 0 8px 8px;
  }
`;

const LogoutButton = styled(DropdownItem)`
  color: var(--danger);
  font-weight: 600;

  &:hover {
    background: var(--danger-light);
  }
`;

const SearchContainer = styled.div`
  position: relative;
  border-radius: 22px;
  background: ${COLORS.BACKGROUND};
  padding: 5px 10px;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    fill: ${COLORS.TEXT_SECONDARY};
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
`;

const SearchInput = styled.input`
  background: ${COLORS.BACKGROUND};
  border-radius: 22px;
  outline: none;
  width: 100%;
  padding: 0.625rem 0.5rem;
  font-size: 0.875rem;
  border: none;
  color: ${COLORS.TEXT_PRIMARY};

  &::placeholder {
    color: ${COLORS.TEXT_SECONDARY};
  }
`;

const SearchResults = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${COLORS.WHITE};
  border: 1px solid ${COLORS.BORDER};
  border-radius: 8px;
  margin-top: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 6px var(--shadow-strong);
`;

const SearchResultItem = styled.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: background 0.15s;

  &:hover {
    background: ${COLORS.BACKGROUND};
  }
`;

const OnlineBadge = styled.div<{ isOnline: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${(props) =>
    props.isOnline ? COLORS.ONLINE_GREEN : COLORS.TEXT_SECONDARY};
  border: 2px solid ${COLORS.WHITE};
  position: absolute;
  top: 0;
  right: 0;
`;

const AvatarWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const ChatsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ChatItem = styled.div<{ active: boolean }>`
  padding: 1rem 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: ${(props) => (props.active ? COLORS.MAIN_BG : "transparent")};

  transition: all 0.15s;

  &:hover {
    background: ${COLORS.BACKGROUND};
  }
`;

const ChatInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ChatName = styled.div`
  font-weight: 600;
  font-size: 0.95rem;
  color: ${COLORS.TEXT_PRIMARY};
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LastMessage = styled.div`
  font-size: 0.85rem;
  color: ${COLORS.TEXT_SECONDARY};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UnreadBadge = styled.div`
  background: ${COLORS.PRIMARY};
  color: white;
  border-radius: 12px;
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
`;

const EmptyState = styled.div`
  padding: 2rem 1.25rem;
  text-align: center;
  color: ${COLORS.TEXT_SECONDARY};
  font-size: 0.875rem;
`;

const ChatsList = () => {
  const { user, chats, setChats, activeChat, setActiveChat, setUser } =
    useContext(appContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserFace[]>([]);
  const [searching, setSearching] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Disconnect WebSocket
    wsService.disconnect();

    // Clear only session-specific storage (NOT chats - they should persist)
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("activeChat");
    // NOTE: We DO NOT clear chats - they are stored per user and should persist

    // Clear session storage
    sessionStorage.removeItem("connectionToastShown");

    // Clear context state
    setUser(null);
    setActiveChat(null);
    setChats(new Map());

    // Show success message
    toast.success("Logged out successfully");

    // Navigate to login
    navigate(ROUTES.LOGIN);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Clear results if query is empty
    if (query.trim().length === 0) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    // Show searching state immediately
    setSearching(true);

    // Debounce search with 200ms delay for better performance
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        console.log("=== SEARCH DEBUG ===");
        console.log("Searching for:", query.trim());
        console.log("API URL:", API_URL);

        const response = await userAPI.searchUsers(query.trim());

        console.log("Search response:", response);
        console.log("Search results count:", response.users?.length || 0);
        console.log("Search results:", response.users);

        setSearchResults(response.users || []);
      } catch (error: any) {
        console.error("=== SEARCH ERROR ===");
        console.error("Error details:", error);
        console.error("Error response:", error.response?.data);
        toast.error(
          "Search failed: " + (error.response?.data?.error || error.message)
        );
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 200);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSelectUser = (selectedUser: UserFace) => {
    // Check if chat already exists
    if (!chats.has(selectedUser.id)) {
      // Create new chat
      const newChat: Chat = {
        id: selectedUser.id,
        participant: selectedUser,
        messages: [],
        lastMessage: undefined,
        updatedAt: new Date(),
        unreadCount: 0,
      };

      setChats((prevChats) => {
        const newChats = new Map(prevChats);
        newChats.set(selectedUser.id, newChat);
        return newChats;
      });
    }

    setActiveChat(selectedUser.id);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Sort chats by most recent message
  const chatArray = Array.from(chats.values()).sort((a, b) => {
    const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return bTime - aTime;
  });

  return (
    <StyledChatsList>
      <Header>
        <UserInfo ref={profileRef}>
          <img src={"./images/logo.png"} alt={user?.name} />
          <ProfileButton onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <HeaderAvatar src={user?.avatarUrl} alt={user?.name} />
            <UserName>{user?.name}</UserName>
          </ProfileButton>

          <ProfileDropdown show={showProfileMenu}>
            <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
          </ProfileDropdown>
        </UserInfo>

        <SearchContainer>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path d="M10.25 2a8.25 8.25 0 0 1 6.34 13.53l5.69 5.69a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215l-5.69-5.69A8.25 8.25 0 1 1 10.25 2ZM3.5 10.25a6.75 6.75 0 1 0 13.5 0 6.75 6.75 0 0 0-13.5 0Z"></path>
          </svg>
          <SearchInput
            type="text"
            placeholder="Search by name, email or mobile..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            autoComplete="off"
          />
          {searchQuery.trim().length > 0 && (
            <SearchResults>
              {searching ? (
                <SearchResultItem style={{ cursor: "default" }}>
                  <ChatInfo>
                    <ChatName>Searching...</ChatName>
                  </ChatInfo>
                </SearchResultItem>
              ) : searchResults.length > 0 ? (
                searchResults.map((resultUser) => (
                  <SearchResultItem
                    key={resultUser.id}
                    onClick={() => handleSelectUser(resultUser)}
                  >
                    <AvatarWrapper>
                      <Avatar
                        src={resultUser.avatarUrl}
                        alt={resultUser.name}
                      />
                      <OnlineBadge isOnline={resultUser.isOnline} />
                    </AvatarWrapper>
                    <ChatInfo>
                      <ChatName>{resultUser.name}</ChatName>
                      <LastMessage>{resultUser.email}</LastMessage>
                    </ChatInfo>
                  </SearchResultItem>
                ))
              ) : (
                <SearchResultItem style={{ cursor: "default" }}>
                  <ChatInfo>
                    <ChatName>No users found</ChatName>
                    <LastMessage>
                      Try searching by name, email or mobile
                    </LastMessage>
                  </ChatInfo>
                </SearchResultItem>
              )}
            </SearchResults>
          )}
        </SearchContainer>
      </Header>

      <ChatsContainer>
        {chatArray.length === 0 ? (
          <EmptyState>
            Search for users by name, email or mobile to start chatting
          </EmptyState>
        ) : (
          chatArray.map((chat) => (
            <ChatItem
              key={chat.id}
              active={activeChat === chat.id}
              onClick={() => setActiveChat(chat.id)}
            >
              <AvatarWrapper>
                <Avatar
                  src={chat.participant.avatarUrl}
                  alt={chat.participant.name}
                />
                <OnlineBadge isOnline={chat.participant.isOnline} />
              </AvatarWrapper>
              <ChatInfo>
                <ChatName>{chat.participant.name}</ChatName>
                <LastMessage>
                  {chat.lastMessage || "No messages yet"}
                </LastMessage>
              </ChatInfo>
              {chat.unreadCount > 0 && (
                <UnreadBadge>{chat.unreadCount}</UnreadBadge>
              )}
            </ChatItem>
          ))
        )}
      </ChatsContainer>
    </StyledChatsList>
  );
};

export default ChatsList;
