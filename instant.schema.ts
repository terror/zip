import { i } from '@instantdb/react';

const _schema = i.schema({
  entities: {
    rooms: i.entity({
      name: i.string(),
      createdAt: i.number().indexed(),
    }),
    messages: i.entity({
      text: i.string(),
      authorName: i.string(),
      createdAt: i.number().indexed(),
    }),
    gameBoards: i.entity({
      boardData: i.json(),
      adminId: i.string().indexed(),
      createdAt: i.number().indexed(),
    }),
  },
  links: {
    roomMessages: {
      forward: { on: 'messages', has: 'one', label: 'room' },
      reverse: { on: 'rooms', has: 'many', label: 'messages' },
    },
    roomGameBoard: {
      forward: { on: 'rooms', has: 'one', label: 'gameBoard' },
      reverse: { on: 'gameBoards', has: 'one', label: 'room' },
    },
  },
  rooms: {
    chat: {
      presence: i.entity({}),
    },
  },
});

type _AppSchema = typeof _schema;

interface AppSchema extends _AppSchema {}

const schema: AppSchema = _schema;

export type { AppSchema };

export default schema;
