import { init } from '@instantdb/react';

import schema from '../../instant.schema';

const APP_ID =
  import.meta.env.VITE_INSTANT_APP_ID || '8449dd6d-6ce9-4059-b85f-de9db3c0cdde';

const db = init({ appId: APP_ID, schema, devtool: false });

export default db;
