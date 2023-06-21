
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { uuid } from "uuidv4";
import { type Book, type BookEntry, type BookGroup } from "@prisma/client";

import { env } from "~/env.mjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";

const firebaseConfig = {
    apiKey: env.API_KEY,
    authDomain: env.AUTH_DOMAIN,
    projectId: env.PROJECT_ID,
    storageBucket: env.STORAGE_BUCKET,
    messagingSenderId: env.MESSAGING_SENDER_ID,
    appId: env.APP_ID,
    measurementId: env.MEASUREMENT_ID
};
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

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
        .input(z.object({ img: z.instanceof(Blob) }))
        .mutation(async ({ ctx, input }) => {
            const imgRef = ref(storage, `books/${uuid()}`);
            await uploadBytes(imgRef, input.img);
    }),
});
