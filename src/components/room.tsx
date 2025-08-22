import db from '@/lib/db';
import { id } from '@instantdb/react';
import { useEffect, useRef, useState } from 'react';

import { generateNickname, generateRoomHash } from '../lib/utils';

export const Room = () => {
  const [message, setMessage] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [nickname] = useState(() => {
    const stored = localStorage.getItem('chat-nickname');
    if (stored) return stored;
    const newNickname = generateNickname();
    localStorage.setItem('chat-nickname', newNickname);
    return newNickname;
  });

  const [currentRoomHash, setCurrentRoomHash] = useState(() => {
    return window.location.hash.slice(1) || generateRoomHash();
  });

  useEffect(() => {
    window.location.hash = currentRoomHash;
  }, [currentRoomHash]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);

      if (hash && hash !== currentRoomHash) {
        setCurrentRoomHash(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentRoomHash]);

  const { data: roomsData } = db.useQuery({
    rooms: {
      $: { where: { name: currentRoomHash } },
    },
  });

  const currentRoom = roomsData?.rooms?.[0];

  useEffect(() => {
    if (roomsData && !currentRoom) {
      const roomId = id();

      db.transact(
        db.tx.rooms[roomId].update({
          name: currentRoomHash,
          createdAt: Date.now(),
        })
      );
    }
  }, [roomsData, currentRoom, currentRoomHash]);

  const { data: messagesData } = db.useQuery(
    currentRoom
      ? {
          messages: {
            $: {
              where: { 'room.id': currentRoom.id },
              order: { createdAt: 'asc' },
            },
          },
        }
      : {}
  );

  const messages = messagesData?.messages || [];
  const room = db.room('chat', currentRoomHash);
  const { peers } = db.rooms.usePresence(room);
  const onlineCount = 1 + Object.keys(peers).length;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      if (e.key === '/') {
        e.preventDefault();
        const newHash = generateRoomHash();
        setCurrentRoomHash(newHash);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const sendMessage = () => {
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

    setMessage('');
  };

  return (
    <div className='flex h-full flex-col'>
      <div className='border-b-1 bg-gray-100 p-2'>
        <div className='flex items-center justify-between'>
          <p className='font-semibold'>Room</p>
          <div className='flex items-center gap-1 text-xs text-gray-500'>
            <div className='h-2 w-2 rounded-full bg-green-500'></div>
            <span>{onlineCount} online</span>
          </div>
        </div>
      </div>
      <div className='mb-2 flex-1 overflow-y-auto rounded p-4'>
        <div className='space-y-2'>
          {messages.map((msg) => (
            <div key={msg.id} className='text-sm'>
              <span className='font-medium'>{msg.authorName}:</span>{' '}
              <span>{msg.text}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className='flex gap-2 border-t-1 p-4'>
        <input
          type='text'
          placeholder='Type a message...'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className='flex-1 text-sm focus:outline-none'
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
      </div>
    </div>
  );
};
