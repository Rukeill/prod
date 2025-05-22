import { createServer } from 'http';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import app from './hono';

// Создаем Hono приложение
const server = new Hono( );

// Монтируем API на /api
server.route('/api', app);

// Запускаем сервер только в режиме разработки
if (__DEV__) {
  const port = 3000;
  serve({
    fetch: server.fetch,
    port,
  });
  console.log(`Backend server running at http://localhost:${port}` );
}

export default server;
