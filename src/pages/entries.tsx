
import { type NextPage } from "next";
import Head from "next/head";
import Navbar from "~/components/navbar";
import Ledger from "~/components/ledger";
import { api } from "~/utils/api";

const Entries: NextPage = () => {
    const { data: entries } = api.entries.getAll.useQuery();

    return (
        <>
            <Head>
              <title>Ledger Entries</title>
              <meta name="description" content="Book keeping application for Faithstore" />
              <link rel="icon" href="/n_favicon.ico" />
            </Head>
            <Navbar text="Faithstore" link="/" />
            <div className="py-3 px-5 md:px-28 xl:px-[12rem] 2xl:px-[20rem]">
                <Ledger entries={entries} showButton={false} />
            </div>
        </>
    );
};

export default Entries;
