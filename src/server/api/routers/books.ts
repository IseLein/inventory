
import { type Book, type BookEntry } from "@prisma/client";

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";

const addGroupsToBook = (books: Book[], g_bookEntries: BookEntry[]) => {
    return books.map((book) => {
        const bookEntries = g_bookEntries.filter((bookEntry) => bookEntry.bookId == book.id);
        return {
            book,
            bookEntries
        }
    });
}

export const booksRouter = createTRPCRouter({
    getAll: protectedProcedure.query(({ ctx }) => {
        return ctx.prisma.book.findMany();
    }),
    getAllWithGroups: protectedProcedure.query(async ({ ctx }) => {
        const books = await ctx.prisma.book.findMany();
        const bookEntries = await ctx.prisma.bookEntry.findMany();
        return addGroupsToBook(books, bookEntries);
    }),
    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const book =  await ctx.prisma.book.findUnique({
                where: { id: input.id },
            });

            if (!book) { throw new TRPCError({ code: "NOT_FOUND" }) }

            return book;
    }),
    getByIdWithGroups: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const book =  await ctx.prisma.book.findUnique({
                where: { id: input.id },
            });

            if (!book) { throw new TRPCError({ code: "NOT_FOUND" }) }

            const bookEntries = await ctx.prisma.bookEntry.findMany({
                where: { bookId: book.id },
            });

            return {
                book,
                bookEntries
            };
    }),
    create: protectedProcedure
        .input(z.object({
            title: z.string(),
            shortTitle: z.string(),
            author: z.string(),
            price: z.number().gt(0),
            category: z.string(),
            image: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const book = await ctx.prisma.book.create({
                data: {
                    title: input.title,
                    shortTitle: input.shortTitle,
                    author: input.author,
                    price: input.price,
                    category: input.category,
                    image: input.image,
                },
            });
            return book;
    }),
});
