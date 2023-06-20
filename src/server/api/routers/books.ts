
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { uuid } from "uuidv4";

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

export const booksRouter = createTRPCRouter({
    getAll: protectedProcedure.query(({ ctx }) => {
        return ctx.prisma.book.findMany();
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
    create: protectedProcedure
        .input(z.object({ img: z.instanceof(Blob) }))
        .mutation(async ({ ctx, input }) => {
            const imgRef = ref(storage, `books/${uuid()}`);
            await uploadBytes(imgRef, input.img);
    }),
});
