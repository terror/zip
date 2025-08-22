import { useRoomContext } from '@/hooks/use-room-context';
import { useEffect, useRef, useState } from 'react';

import { generateRoomHash } from '../lib/utils';

export const Room = () => {
  const [message, setMessage] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    roomHash: currentRoomHash,
    messages,
    onlineCount,
    sendMessage: contextSendMessage,
  } = useRoomContext();

  const [displayRoomHash, setDisplayRoomHash] = useState(() => {
    return currentRoomHash || generateRoomHash();
  });

  useEffect(() => {
    if (currentRoomHash) {
      setDisplayRoomHash(currentRoomHash);
    }
  }, [currentRoomHash]);

  useEffect(() => {
    window.location.hash = displayRoomHash;
  }, [displayRoomHash]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      if (e.key === '/') {
        e.preventDefault();
        const newHash = generateRoomHash();
        setDisplayRoomHash(newHash);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const sendMessage = () => {
    if (!message.trim()) return;
    contextSendMessage(message);
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
