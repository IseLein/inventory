
import { type NextPage } from "next";
import { type Book, type BookEntry } from "@prisma/client";
import Head from "next/head";
import { useRouter } from "next/router";
import Navbar from "~/components/navbar";
import { api } from "~/utils/api";
import { useState } from "react";
import { Decimal } from "decimal.js";

type BookWithGroup = {
    book: Book,
    bookEntries: BookEntry[]
}

const NewEntry: NextPage = () => {
    const router = useRouter();
    const { type: entryType, bookid } = router.query;

    // placeholder book
    const placeholder: BookWithGroup = {
        book: {
        id: "placeholder", createdAt: new Date(), title: "placeholder",
        shortTitle: "placeholder", author: "placeholder",
        price: new Decimal(10.0), category: "placeholder",
        image: "placeholder"
        },
        bookEntries: []
    };
    const [dialogBooks, setDialogBooks] = useState<BookWithGroup[]>([placeholder]);
    const [selectedBook, selectBook] = useState<BookWithGroup>(placeholder);
    const [price, setPrice] = useState(0);
    const [quantity, setQuantity] = useState(0);
    const [modalMsg, setModalMsg] = useState("");

    const { mutate, isLoading } = api.entries.createWithGroup.useMutation({
        onSuccess: (data) => {
            if (data) {
                void router.push(`/books/${data.bookId}`);
            } else {
                setModalMsg("An error occured");
                toggleModal("error");
            }
        }
    });

    console.log(entryType);
    if (!(typeof entryType === "string" && (entryType === "sale" || entryType === "purchase"))) {
        void router.replace("/");
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

    const { data: books } = api.books.getAllWithGroups.useQuery();
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
    if (dialogBooks[0]?.book.id === "placeholder") {
        setDialogBooks(books);
    }

    function filterBooks(prompt: string) {
        if (!books) {
            return;
        }

        let d_books: BookWithGroup[] = []
        if (prompt.startsWith("a:")) {
            d_books = books.filter((bookWithGroup) => bookWithGroup.book.author.toLowerCase().includes(prompt.substring(2).toLowerCase()));
        } else {
            d_books = books.filter((bookWithGroup) => bookWithGroup.book.shortTitle.toLowerCase().includes(prompt.toLowerCase()));
        }
        setDialogBooks(d_books);
    }
    if (selectedBook.book.title === "placeholder") {
        const book = books.find((book) => book.book.id === bookid);
        if (book) {
            selectBook(book);
            setPrice(Number(book.book.price.toString()));
        }
    }

    function get_quantity(bookEntries: BookEntry[]): number {
        let total = 0;
        for (const entry of bookEntries) {
            total += entry.quantity;
        }
        return total;
    }

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

    function toggleModal(dialogId: string) {
        const modal = document.getElementsByTagName("dialog").namedItem(dialogId);
        if (!modal) {
            console.log("error due to ..");
            return;
        }
        modal.toggleAttribute("open")
    }

    function handleSave(eType: "sale" | "purchase") {
        if (selectedBook.book.title === "placeholder") {
            setModalMsg("Select a book");
            toggleModal("error");
            return;
        }
        if (price <= 0) {
            setModalMsg("Set an appriopriate price");
            toggleModal("error");
            return;
        }
        if (quantity <= 0) {
            setModalMsg("Set an appriopriate quantity");
            toggleModal("error");
            return;
        }
        if (eType === "sale" && get_quantity(selectedBook.bookEntries) < quantity) {
            setModalMsg("There are not enough books");
            toggleModal("error");
            return;
        }
        mutate({
            bookid: selectedBook.book.id,
            type: eType,
            quantity: quantity,
            price: price,
            groupName: "Stock",
        });
    }

    return (
        <>
            <Head>
              <title>Books</title>
              <meta name="description" content="Book keeping application for Faithstore" />
              <link rel="icon" href="/n_favicon.ico" />
            </Head>
            <Navbar text="Entries" link="/entries/"/>
            <dialog id="error" className="mt-5 bg-slate-50 rounded-lg">
                <div className="font-atkinson text-blue-500">
                    <div>{modalMsg}</div>
                    <div className="py-2 flex flex-row justify-center gap-2">
                        <button onClick={() => toggleModal("error")} className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300">ok</button>
                    </div>
                </div>
            </dialog>
            <dialog id="book-select" className="w-[90%] lg:w-[60%] text-blue-500 text-base md:text-lg lg:text-xl font-atkinson">
                <div className="p-2 md:p-4 bg-slate-100 rounded-lg">
                    <div className="py-1 flex flex-row justify-between">
                        <input autoFocus={true} className="pl-1 md:pl-2 w-full rounded-lg text-base md:text-lg lg:text-xl focus:outline-none" type="text" 
                            onChange={(e) => {filterBooks(e.target.value)}}
                        />
                        <button className="pl-2 md:pl-16 lg:pl-40" onClick={() => toggleModal("book-select")}>x</button>
                    </div>
                    {dialogBooks.slice(0, 10).map((bookData) => {
                        return (
                            <div key={bookData.book.id} className="">
                                <button className="px-2 py-1 w-full hover:bg-slate-200"
                                    onClick={() => {
                                        selectBook(bookData);
                                        setPrice(Number(bookData.book.price.toString()));
                                        toggleModal("book-select");
                                    }}>
                                    <div className="flex flex-row gap-1 justify-between">
                                        <div className="text-left">{bookData.book.title}</div>
                                        <div>{money_format(get_quantity(bookData.bookEntries))}</div>
                                    </div>
                                </button>
                            </div>
                        );
                    })}
                    <button className="mt-2 px-2 py-1 rounded-lg bg-slate-200" onClick={() => toggleModal("book-select")}>close</button>
                </div>
            </dialog>
            <div className="py-3 px-5 md:px-28 xl:px-[12rem] 2xl:px-[20rem] font-atkinson">
                <div className="mb-2 py-2">
                    <div className="text-2xl">{entryType === "sale" ? "Record Sale" : "Add to Stock"}</div>
                </div>
                <div className="mb-8">
                    <div className="underline">{entryType === "sale" ? "NOTE: you are selling a book" : "NOTE: you are adding to stock"}</div>
                </div>
                <div className="flex flex-row justify-between">
                    <button className="px-2 py-1 rounded-lg bg-blue-50" onClick={() => toggleModal("book-select")}>SELECT</button>
                    <div></div>
                </div>
                <div className="py-2 flex flex-row gap-1 justify-between">
                    {!(selectedBook.book.title === "placeholder") &&
                        <>
                        <div className="text-left">{selectedBook.book.title}</div>
                        <div>{money_format(get_quantity(selectedBook.bookEntries))}</div>
                        </>
                    }
                    {selectedBook.book.title === "placeholder" &&
                        <div>no book selected</div>
                    }
                </div>
                <div className="py-2 w-full flex flex-row">
                    <label className="pr-2" htmlFor="price">Price:</label>
                    <input className="w-full border-b border-slate-200 focus:outline-none focus:border-blue-300" id="price" type="number" defaultValue={price} key={Math.random()}
                        onChange={(e) => setPrice(Number(e.target.value))}
                    />
                </div>
                <div className="py-2 w-full flex flex-row">
                    <label className="pr-2" htmlFor="quantity">Quantity:</label>
                    <input className="w-full border-b border-slate-200 focus:outline-none focus:border-blue-300" id="quantity" type="number" defaultValue={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                </div>
                <button disabled={isLoading} className="my-2 px-2 py-1 rounded-lg bg-blue-50"
                    onClick={() => {
                        console.log(quantity);
                        handleSave(entryType);
                    }}
                >
                    {isLoading ? "loading..." : "SAVE"}
                </button>
            </div>
        </>
    );
}

export default NewEntry;
