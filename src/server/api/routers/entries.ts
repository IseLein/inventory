
// import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { type Entry, type Book } from "@prisma/client";
import { TRPCError } from "@trpc/server";

const addBookDataToEntries = (entries: Entry[], books: Book[]) => {
    return entries.map((entry) => {
        const book = books.find((book) => book.id === entry.bookId);
        if (!book) {
            console.log("error getting book for an entry");
            console.log(entry);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Book for entry not found: entry id: ${entry.id}, book id: ${entry.bookId}`,
            });
        }
        return {
            entry,
            book,
        }
    });
}

export const entriesRouter = createTRPCRouter({
    getAll: protectedProcedure.query(async ({ ctx }) => {
        const entries = await ctx.prisma.entry.findMany({
            orderBy: [{ createdAt: "desc" }],
        });
        const books = await ctx.prisma.book.findMany();

        return addBookDataToEntries(entries, books);
    }),
    getRecent: protectedProcedure.query(async ({ ctx }) => {
        const date_90 = new Date();
        date_90.setDate(date_90.getDate() - 90);

        const entries = await ctx.prisma.entry.findMany({
            where: {
                createdAt: {
                    gte: date_90,
                },
            },
            orderBy: [{ createdAt: "desc" }],
        });
        const books = await ctx.prisma.book.findMany();

        return addBookDataToEntries(entries, books);
    }),
    getLastMonthPh: protectedProcedure.query(({ ctx }) => {
        const date_30 = new Date();
        date_30.setDate(date_30.getDate() - 29);

        return ctx.prisma.entry.findMany({
            where: {
                createdAt: {
                    gte: date_30,
                },
                type: "sale",
                book: {
                    category: "peace_house",
                }
            }
        });
    }),
    getLastMonthOh: protectedProcedure.query(({ ctx }) => {
        const date_30 = new Date();
        date_30.setDate(date_30.getDate() - 29);

        return ctx.prisma.entry.findMany({
            where: {
                createdAt: {
                    gte: date_30,
                },
                type: "sale",
                book: {
                    category: "other",
                }
            }
        });
    }),
});
