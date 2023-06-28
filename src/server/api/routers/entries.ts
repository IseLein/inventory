
import { z } from "zod";
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
    createWithGroup: protectedProcedure
        .input(z.object({
            bookid: z.string(),
            type: z.enum(["sale", "purchase"]),
            quantity: z.number().gt(0).int(),
            price: z.number().gt(0),
            groupName: z.string(),
        }))
        .mutation( async({ ctx, input}) => {
            const bookEntries = await ctx.prisma.bookEntry.findMany({
                where: {
                    bookId: input.bookid,
                    groupName: input.groupName,
                }
            })
            let bookEntry = bookEntries[0];
            if (input.type === "sale") {
                if (!bookEntry) {
                    return;
                }
                if (bookEntry.quantity < input.quantity) {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "There are not enough books in stock",
                    });
                }
                await ctx.prisma.entry.create({
                    data: {
                        bookId: input.bookid,
                        type: input.type,
                        quantity: input.quantity,
                        price: input.price,
                    }
                });
                const updatedBookEntry = await ctx.prisma.bookEntry.update({
                    where: {
                        id: bookEntry.id,
                    },
                    data: {
                        quantity: bookEntry.quantity - input.quantity,
                    },
                })
                return updatedBookEntry;
            } else {
                if (!bookEntry) {
                    bookEntry = await ctx.prisma.bookEntry.create({
                        data: {
                            bookId: input.bookid,
                            groupName: input.groupName,
                            quantity: 0,
                        }
                    });
                }
                await ctx.prisma.entry.create({
                    data: {
                        bookId: input.bookid,
                        type: input.type,
                        quantity: input.quantity,
                        price: input.price,
                    }
                });
                const updatedBookEntry = await ctx.prisma.bookEntry.update({
                    where: {
                        id: bookEntry.id,
                    },
                    data: {
                        quantity: bookEntry.quantity + input.quantity,
                    },
                })
                return updatedBookEntry;
            }
    }),
});
