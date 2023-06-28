
import type { InferGetServerSidePropsType, GetServerSidePropsContext } from "next";
import Head from "next/head";
import Link from "next/link";
import Navbar from "~/components/navbar";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { prisma } from "~/server/db";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import { api } from "~/utils/api";
import { getSession } from "next-auth/react";
import Image from "next/image";

const Book = (
    props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
    const { id } = props;
    const bookQuery = api.books.getByIdWithGroups.useQuery({ id });
    if (bookQuery.status !== "success") {
        return(
            <div className="px-5 py-20 md:py-32 lg:py-48 xl:py-56 flex justify-center items-center text-blue-600">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div className="text-2xl">Loading...</div>
            </div>
        );
    }
    const { data: bookWithGroup } = bookQuery;
    const { book, bookEntries } = bookWithGroup;

    function money_format(num: number): string {
        const old = num.toString();
        let changed = "";
        let j = 0;
        for (let i = old.length - 1; i >= 0; i--) {
            if (j === 3) {
                changed = `,${changed}`;
                j = 0;
            }
            changed = `${old[i] || ""}${changed}`;
            j += 1;
        }
        return changed;
    }

    return (
        <>
            <Head>
              <title>{book.shortTitle}</title>
              <meta name="description" content="Book keeping application for Faithstore" />
              <link rel="icon" href="/n_favicon.ico" />
            </Head>
            <Navbar text="Books" link="/books/" />
            <div className="py-3 px-5 md:px-28 xl:px-[12rem] 2xl:px-[20rem]">
                <div className="flex flex-col font-atkinson text-base md:text-xl xl:text-2xl">
                    <div className="py-4 md:py-6">
                        <Image className="m-auto rounded-lg overflow-hidden md:hidden" src={book.image} alt="" width={156} height={156} />
                        <Image className="m-auto rounded-lg overflow-hidden hidden md:block lg:hidden" src={book.image} alt="" width={256} height={256} />
                        <Image className="m-auto rounded-lg overflow-hidden hidden lg:block" src={book.image} alt="" width={346} height={346} />
                    </div>
                    <div className="pt-3 md:pt-5 flex flex-row">
                        <div className="px-2 font-semibold">Title:</div>
                        <div className="text-left">{book.title}</div>
                    </div>
                    <div className="pt-1 flex flex-row">
                        <div className="px-2 font-semibold">Display:</div>
                        <div className="text-left">{book.shortTitle}</div>
                    </div>
                    <div className="pt-1 flex flex-row">
                        <div className="px-2 font-semibold">Author:</div>
                        <div className="text-left">{book.author}</div>
                    </div>
                    <div className="pt-1 flex flex-row">
                        <div className="px-2 font-semibold">Category:</div>
                        <div className="text-left">{book.category === "peace_house" ? "Peace House" : "Others"}</div>
                    </div>
                    <div className="pt-1 flex flex-row">
                        <div className="px-2 font-semibold">Price:</div>
                        <div className="text-left">{`₦${money_format(Number(book.price.toString()))}`}</div>
                    </div>
                    {bookEntries.length <= 0 &&
                        <div className="pt-1 flex flex-row">
                            <div className="px-2 font-semibold">Quantity:</div>
                            <div className="text-left">{`${money_format(0)}`}</div>
                        </div>
                    }
                    {bookEntries.length > 0 &&
                        <>
                        <div className="pt-1 flex flex-row">
                            <div className="px-2 font-semibold">Quantity</div>
                        </div>
                        {bookEntries.map((bookEntry) => {
                            return (
                                <div key={bookEntry.id} className="pt-1 flex flex-row">
                                    <div className="px-2">{bookEntry.groupName}</div>
                                    <div className="text-left">{`${money_format(bookEntry.quantity)}`}</div>
                                </div>
                        )})}
                        </>
                    }
                    <div className="pt-1 flex flex-row">
                        <Link href={`/entries/new?type=sale&bookid=${book.id}`} className="mx-2 px-2 py-1 rounded-lg bg-blue-50">sell book</Link>
                        <Link href={`/entries/new?type=purchase&bookid=${book.id}`} className="mx-2 px-2 py-1 rounded-lg bg-blue-50">add more books</Link>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Book;

export async function getServerSideProps(
    context: GetServerSidePropsContext<{ id: string }>
) {
    const helpers = createServerSideHelpers({
        router: appRouter,
        ctx: { prisma, session: await getSession() },
        transformer: superjson,
    });
    const id = context.params?.id as string;

    await helpers.books.getById.prefetch({ id });

    return {
        props: {
            trpcState: helpers.dehydrate(),
            id,
        },
    };
}
