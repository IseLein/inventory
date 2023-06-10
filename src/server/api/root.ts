import { createTRPCRouter } from "~/server/api/trpc";
import { ownersRouter } from "./routers/owners";
import { booksRouter } from "./routers/books";
import { entriesRouter } from "./routers/entries";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  books: booksRouter,
  entries: entriesRouter,
  owners: ownersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
