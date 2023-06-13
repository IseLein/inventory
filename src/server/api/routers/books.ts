
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";

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
});
