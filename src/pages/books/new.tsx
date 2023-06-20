
import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import Navbar from "~/components/navbar";
// import { api } from "~/utils/api";
import Image from "next/image";

const Entries: NextPage = () => {
    const placeholder = "https://firebasestorage.googleapis.com/v0/b/inventory-389209.appspot.com/o/books%2Fplaceholder.png?alt=media&token=7183db6b-749d-4016-a1dc-7cbce9d9de06";
    const [imageSrc, setImageSrc] = useState(placeholder);

    return (
        <>
            <Head>
              <title>Ledger Entries</title>
              <meta name="description" content="Book keeping application for Faithstore" />
              <link rel="icon" href="/n_favicon.ico" />
            </Head>
            <Navbar text="Faithstore" link="/" />
            <div className="py-3 px-5 md:px-28 xl:px-[12rem] 2xl:px-[20rem]">
                <div className="flex flex-col items-center font-atkinson text-base md:text-xl xl:text-2xl">
                    <div className="py-4 md:py-6">
                        <Image className="m-auto rounded-lg border border-slate-100 md:hidden" src={imageSrc} alt="" width={156} height={156} />
                        <Image className="m-auto rounded-lg border border-slate-100 hidden md:block lg:hidden" src={imageSrc} alt="" width={256} height={256} />
                        <Image className="m-auto rounded-lg border border-slate-100 hidden lg:block" src={imageSrc} alt="" width={346} height={346} />
                    </div>
                    <div className="pb-2">
                        <input className="w-full overflow-hidden" type="file" accept="image/*"
                            onChange={(e) => {setImageSrc(URL.createObjectURL((e.target.files ? e.target.files[0] || new Blob() : new Blob())))}}
                        />
                    </div>
                    <div className="py-2 w-full flex flex-row">
                        <label className="pr-2" htmlFor="title">Title:</label>
                        <input className="w-full border-b border-slate-200 focus:outline-none focus:border-blue-300" id="title" type="text"/>
                    </div>
                    <div className="py-2 w-full flex flex-row">
                        <label className="pr-2" htmlFor="shortTitle">Display:</label>
                        <input className="w-full border-b border-slate-200 focus:outline-none focus:border-blue-300" id="shortTitle" type="text"/>
                    </div>
                    <div className="py-2 w-full flex flex-row">
                        <label className="pr-2" htmlFor="author">Author:</label>
                        <input className="w-full border-b border-slate-200 focus:outline-none focus:border-blue-300" id="author" type="text"/>
                    </div>
                    <div className="py-2 w-full flex flex-row">
                        <label className="pr-2" htmlFor="price">Price:</label>
                        <input className="w-full border-b border-slate-200 focus:outline-none focus:border-blue-300" id="price" type="number"/>
                    </div>
                    <div className="py-2 flex flex-row gap-2">
                        <div className="px-2 py-1 border rounded-lg flex flex-row items-center">
                            <input type="radio" id="ph" name="category" value="peace_house" />
                            <label className="pl-1" htmlFor="ph">Peace House</label>
                        </div>
                        <div className="px-2 py-1 border rounded-lg flex flex-row items-center">
                            <input type="radio" id="oh" name="category" value="others" />
                            <label className="pl-1" htmlFor="oh">Others</label>
                        </div>
                    </div>
                    <button className="my-2 px-3 py-2 rounded-full bg-blue-50">ADD</button>
                </div>
            </div>
        </>
    );
};

export default Entries;
