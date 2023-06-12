
import { type Book, type Entry } from "@prisma/client";
import Link from "next/link";

type EntryPlus = {
    entry: Entry,
    book: Book,
};

type LedgerProp = {
    entries: EntryPlus[] | undefined,
    showButton: boolean,
}

const Ledger = (ledgerProps: LedgerProp) => {
    const entries = ledgerProps.entries;
    if (!entries) {
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
    return (
        <div className="font-atkinson">
            <div className="px-2 lg:px-4 py-2 lg:py-4 text-left bg-blue-50 rounded-t-lg">
                <div className="flex flex-row justify-between items-center">
                    <div>Ledger Entries</div>
                    <Link className={`px-3 py-1 rounded-full text-base h-fit bg-blue-100 hover:bg-blue-200 ${ledgerProps.showButton ? "" : "hidden"}`} href={"/entries"}>SHOW ALL</Link>
                </div>
            </div>
            {entries.map((entry) => {
                return (
                    <EntryUI key={entry.entry.id} entry={entry} />
                );
            })}
            {entries.length <= 0 &&
                <div className="py-2 lg:py-4 md:text-xl lg:text-2xl">
                    There are no entries yet
                </div>
            }
            <div className="px-1 lg:px-2 py-1 lg:py-2 text-base md:text-lg text-left bg-blue-50 rounded-b-lg">
                <div className={`text-center ${ledgerProps.showButton ? "hidden" : ""}`}>END</div>
                <div className="flex flex-row justify-center">
                    <Link className={`px-3 py-1 rounded-full text-base h-fit bg-blue-100 hover:bg-blue-200 ${ledgerProps.showButton ? "" : "hidden"}`} href={"/entries"}>SHOW ALL</Link>
                </div>
            </div>
        </div>
    );
}

export default Ledger;

const EntryUI = (props: { entry: EntryPlus }) => {
    const data = props.entry;

    function month_itoa(month: number): string {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Nov", "Dec"];
        return months[month] || "";
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

    return (
        <div className={`w-full py-2 bg-${data.book.category === "other"? 'red' : 'green'}-50 border-blue-600 border-x-${data.entry.type === "sale" ? '0' : '2'}`}>
            <div className="flex flex-row align-middle">
                <div className="w-[65%]">
                    <div className="px-2 lg:px-4 text-sm lg:text-base text-left font-light">
                        {`${month_itoa(data.entry.createdAt.getMonth())} ${data.entry.createdAt.getDate()}`}
                    </div>
                    <div className="px-2 lg:px-4 text-lg md:text-xl lg:text-2xl text-left">
                        {data.book.shortTitle}
                    </div>
                </div>
                <div className="w-[35%]">
                    <div className="pr-2 lg:pr-4 text-right">
                        <div className="text-sm lg:text-base font-light"><span>{data.entry.quantity}</span><span>x</span><span>{`${money_format(Number(data.entry.price.toString()))}`}</span></div>
                        <div className="text-lg md:text-xl lg:text-2xl">{money_format(data.entry.quantity * Number(data.entry.price.toString()))}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
