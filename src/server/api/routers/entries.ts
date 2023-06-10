
// import { z } from "zod";
import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";

export const entriesRouter = createTRPCRouter({
    getAll: protectedProcedure.query(({ ctx }) => {
        return ctx.prisma.entry.findMany();
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
