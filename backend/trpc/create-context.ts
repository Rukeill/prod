import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

// Функция создания контекста
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  return {
    req: opts.req,
    // Здесь можно добавить больше элементов контекста, таких как подключения к базе данных, аутентификация и т.д.
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

// Инициализируем tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;