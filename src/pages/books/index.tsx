
import { type NextPage } from "next";
import Head from "next/head";
import Navbar from "~/components/navbar";
import { api } from "~/utils/api";
import { type Book } from "@prisma/client";
import { Decimal } from "decimal.js";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

const Books: NextPage = () => {
    const { data: books } = api.books.getAll.useQuery();
    // placeholder book
    const placeholder: Book = {
        id: "placeholder", createdAt: new Date(), title: "placeholder",
        shortTitle: "placeholder", author: "placeholder",
        price: new Decimal(10.0), quantity: 0, category: "placeholder",
        image: "placeholder"
    };
    const [displayBooks, setDisplayBooks] = useState<Book[]>([placeholder]);

    if (!books) {
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

    if (displayBooks[0]?.id === "placeholder") {
        setDisplayBooks(books);
    }

    function filterBooks(prompt: string) {
        if (!books) {
            return;
        }

        let d_books: Book[] = []
        if (prompt.startsWith("a:")) {
            d_books = books.filter((book) => book.author.toLowerCase().includes(prompt.substring(2).toLowerCase()));
        } else {
            d_books = books.filter((book) => book.shortTitle.toLowerCase().includes(prompt.toLowerCase()));
        }
        setDisplayBooks(d_books);
    }

    return (
        <>
            <Head>
              <title>Books</title>
              <meta name="description" content="Book keeping application for Faithstore" />
              <link rel="icon" href="/n_favicon.ico" />
            </Head>
            <Navbar text="Faithstore" link="/" />
            <div className="py-3 px-5 md:px-28 xl:px-[22rem] font-atkinson">
                <div className="pb-2 flex flex-row justify-between">
                    <div className="mr-4 p-1 border border-slate-300 flex flex-row rounded-full w-full">
                        <FontAwesomeIcon className="px-1" icon={faSearch} width={20} />
                        <input className="md:pl-1 text-base md:text-lg lg:text-xl focus:outline-none" type="text" 
                            onChange={(e) => {filterBooks(e.target.value)}}/>
                    </div>
                    <Link className="px-2 flex flex-row items-center bg-blue-50 rounded-full" href={"/books/"}>
                        <FontAwesomeIcon icon={faPlus} width={12} />
                        <div className="pl-1 lg:pl-2 text-base md:text-lg lg:text-xl">NEW</div>
                    </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6">
                    {displayBooks.map((book) => {
                        return (
                            <BookUI key={book.id} book={book} />
                        );
                    })}
                </div>
                {displayBooks.length <= 0 &&
                    <div>There are no books in the database yet</div>
                }
            </div>
        </>
    );
};

export default Books;

const BookUI = (props: { book: Book }) => {
    const book = props.book;

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
        <Link className="border border-slate-200 rounded-lg overflow-hidden" href={`/books/${book.id}`}>
            <div className="h-full flex flex-col justify-between">
                <div>
                    <div className="relative pt-[100%]">
                        <div className="p-0 h-[100%]">
                            <Image src={book.image} fill={true} alt={""} />
                        </div>
                    </div>
                    <div className="px-1 md:px-2 lg:px-4 lg:pt-1">
                        <div className="text-left text-base md:text-lg lg:text-xl xl:text-2xl">{book.shortTitle}</div>
                    </div>
                </div>
                <div className="px-1 md:px-2 lg:px-4 lg:pb-1 flex flex-row justify-between text-base md:text-lg lg:text-xl xl:text-2xl">
                    <div className="pr-1">{money_format(book.quantity)}</div>
                    <div className="pl-1">{money_format(Number(book.price))}</div>
                </div>
            </div>
        </Link>
    );
};
