import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

// приложение будет смонтировано на /api
const app = new Hono();

// Включаем CORS для всех маршрутов
app.use("*", cors());

// Монтируем tRPC роутер на /trpc
app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  })
);

// Простая проверка работоспособности
app.get("/", (c) => {
  return c.json({ status: "ok", message: "API работает" });
});

export default app;