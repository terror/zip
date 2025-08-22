import db from '@/lib/db';
import { generateBoard } from '@/lib/generator';
import { Cell } from '@/lib/generator';
import { id } from '@instantdb/react';
import React, {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useState,
} from 'react';

interface RoomContextType {
  // Room state
  roomHash: string;
  currentRoom: { id: string; name: string; createdAt: number } | undefined;
  isLoading: boolean;

  // User identity
  userId: string;
  nickname: string;
  updateNickname: (newNickname: string) => void;

  // Game board
  gameBoard: Cell[][] | undefined;
  isAdmin: boolean;
  adminId: string | undefined;
  regenerateBoard: () => void;

  // Chat messages
  messages: {
    id: string;
    text: string;
    authorName: string;
    createdAt: number;
  }[];
  sendMessage: (message: string) => void;

  // Presence
  onlineCount: number;
}

export const RoomContext = createContext<RoomContextType | undefined>(
  undefined
);

interface RoomProviderProps {
  children: ReactNode;
}

export const RoomProvider: React.FC<RoomProviderProps> = ({ children }) => {
  // Room hash from URL
  const [currentRoomHash, setCurrentRoomHash] = useState(() => {
    return window.location.hash.slice(1);
  });

  // Generate persistent user ID
  const [userId] = useState(() => {
    const stored = localStorage.getItem('chat-user-id');
    if (stored) return stored;
    const newUserId = id();
    localStorage.setItem('chat-user-id', newUserId);
    return newUserId;
  });

  // Nickname management
  const [nickname, setNickname] = useState(() => {
    const stored = localStorage.getItem('chat-nickname');
    if (stored) return stored;
    const newNickname = `User${Math.random().toString(36).substr(2, 4)}`;
    localStorage.setItem('chat-nickname', newNickname);
    return newNickname;
  });

  const updateNickname = useCallback((newNickname: string) => {
    if (newNickname.trim()) {
      setNickname(newNickname.trim());
      localStorage.setItem('chat-nickname', newNickname.trim());
    }
  }, []);

  // Hash change listener
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash !== currentRoomHash) {
        setCurrentRoomHash(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentRoomHash]);

  // Query for room and game board data
  const { data: roomData, isLoading: roomLoading } = db.useQuery(
    currentRoomHash
      ? {
          rooms: {
            $: { where: { name: currentRoomHash } },
            gameBoard: {},
          },
        }
      : null
  );

  const currentRoom = roomData?.rooms?.[0];
  const currentGameBoard = currentRoom?.gameBoard;

  // Query for messages
  const { data: messagesData, isLoading: messagesLoading } = db.useQuery(
    currentRoom
      ? {
          messages: {
            $: {
              where: { 'room.id': currentRoom.id },
              order: { createdAt: 'asc' },
            },
          },
        }
      : null
  );

  // Presence
  const room = currentRoomHash ? db.room('chat', currentRoomHash) : null;
  const { peers } = db.rooms.usePresence(room || db.room('chat', 'default'));
  const onlineCount = currentRoomHash ? 1 + Object.keys(peers).length : 0;

  // Create room if it doesn't exist
  useEffect(() => {
    if (currentRoomHash && roomData && !currentRoom) {
      const roomId = id();
      db.transact(
        db.tx.rooms[roomId].update({
          name: currentRoomHash,
          createdAt: Date.now(),
        })
      );
    }
  }, [currentRoomHash, roomData, currentRoom]);

  // Create game board if room exists but no game board
  useEffect(() => {
    if (currentRoom && !currentGameBoard && userId) {
      const gameBoardId = id();
      const board = generateBoard(5);

      db.transact(
        db.tx.gameBoards[gameBoardId]
          .update({
            boardData: board,
            adminId: userId,
            createdAt: Date.now(),
          })
          .link({ room: currentRoom.id })
      );
    }
  }, [currentRoom, currentGameBoard, userId]);

  // Admin logic
  const isAdmin = Boolean(
    currentGameBoard && currentGameBoard.adminId === userId
  );

  // Regenerate board function
  const regenerateBoard = useCallback(() => {
    if (!currentGameBoard || !isAdmin) return;

    const newBoard = generateBoard(5);
    db.transact(
      db.tx.gameBoards[currentGameBoard.id].update({
        boardData: newBoard,
        createdAt: Date.now(),
      })
    );
  }, [currentGameBoard, isAdmin]);

  // Send message function
  const sendMessage = useCallback(
    (message: string) => {
      if (!message.trim() || !currentRoom) return;

      db.transact(
        db.tx.messages[id()]
          .update({
            text: message,
            authorName: nickname,
            createdAt: Date.now(),
          })
          .link({ room: currentRoom.id })
      );
    },
    [currentRoom, nickname]
  );

  // Loading state
  const isLoading = Boolean(
    roomLoading ||
      (currentRoom && messagesLoading) ||
      (currentRoomHash && !currentGameBoard)
  );

  const contextValue: RoomContextType = {
    roomHash: currentRoomHash,
    currentRoom,
    isLoading,
    userId,
    nickname,
    updateNickname,
    gameBoard: currentGameBoard?.boardData as Cell[][] | undefined,
    isAdmin,
    adminId: currentGameBoard?.adminId,
    regenerateBoard,
    messages: messagesData?.messages || [],
    sendMessage,
    onlineCount,
  };

  return (
    <RoomContext.Provider value={contextValue}>{children}</RoomContext.Provider>
  );
};
