import { usePersistedState } from '@/hooks/use-persisted-state';
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

type Message = {
  id: string;
  text: string;
  authorName: string;
  createdAt: number;
  isSystem?: boolean;
};

interface RoomContextType {
  adminId: string | undefined;
  currentRoom: { id: string; name: string; createdAt: number } | undefined;
  gameBoard: Cell[][] | undefined;
  isAdmin: boolean;
  isLoading: boolean;
  messages: Message[];
  nickname: string;
  onlineCount: number;
  regenerateBoard: () => void;
  roomHash: string;
  sendMessage: (message: string) => void;
  sendSystemMessage: (message: string) => void;
  updateNickname: (newNickname: string) => void;
  userId: string;
}

export const RoomContext = createContext<RoomContextType | undefined>(
  undefined
);

interface RoomProviderProps {
  children: ReactNode;
}

export const RoomProvider: React.FC<RoomProviderProps> = ({ children }) => {
  const [currentRoomHash, setCurrentRoomHash] = useState(
    window.location.hash.slice(1)
  );

  const [userId] = usePersistedState('chat-user-id', id());

  const [nickname, setNickname] = usePersistedState(
    'chat-nickname',
    `User${Math.random().toString(36).substr(2, 4)}`
  );

  const updateNickname = useCallback((newNickname: string) => {
    if (newNickname.trim()) setNickname(newNickname.trim());
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

    db.transact([
      db.tx.gameBoards[currentGameBoard.id].update({
        boardData: newBoard,
        createdAt: Date.now(),
      }),
      db.tx.messages[id()]
        .update({
          text: `${nickname} generated a new game board`,
          authorName: 'System',
          createdAt: Date.now(),
          isSystem: true,
        })
        .link({ room: currentRoom.id }),
    ]);
  }, [currentGameBoard, isAdmin, nickname, currentRoom]);

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

  const sendSystemMessage = useCallback(
    (message: string) => {
      if (!message.trim() || !currentRoom) return;

      db.transact(
        db.tx.messages[id()]
          .update({
            text: message,
            authorName: 'System',
            createdAt: Date.now(),
            isSystem: true,
          })
          .link({ room: currentRoom.id })
      );
    },
    [currentRoom]
  );

  const isLoading = Boolean(
    roomLoading ||
      (currentRoom && messagesLoading) ||
      (currentRoomHash && !currentGameBoard)
  );

  const value: RoomContextType = {
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
    sendSystemMessage,
    onlineCount,
  };

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
};
