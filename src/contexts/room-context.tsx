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
  roomHash: string;
  currentRoom: { id: string; name: string; createdAt: number } | undefined;
  isLoading: boolean;
  userId: string;
  nickname: string;
  updateNickname: (newNickname: string) => void;
  gameBoard: Cell[][] | undefined;
  isAdmin: boolean;
  adminId: string | undefined;
  regenerateBoard: () => void;
  messages: {
    id: string;
    text: string;
    authorName: string;
    createdAt: number;
  }[];
  sendMessage: (message: string) => void;
  onlineCount: number;
}

export const RoomContext = createContext<RoomContextType | undefined>(
  undefined
);

interface RoomProviderProps {
  children: ReactNode;
}

export const RoomProvider: React.FC<RoomProviderProps> = ({ children }) => {
  const [currentRoomHash, setCurrentRoomHash] = useState(() => {
    return window.location.hash.slice(1);
  });

  const [userId] = useState(() => {
    const stored = localStorage.getItem('chat-user-id');
    if (stored) return stored;
    const newUserId = id();
    localStorage.setItem('chat-user-id', newUserId);
    return newUserId;
  });

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

  const room = currentRoomHash ? db.room('chat', currentRoomHash) : null;

  const { peers } = db.rooms.usePresence(room || db.room('chat', 'default'));

  const onlineCount = currentRoomHash ? 1 + Object.keys(peers).length : 0;

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

  const isAdmin = Boolean(
    currentGameBoard && currentGameBoard.adminId === userId
  );

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
