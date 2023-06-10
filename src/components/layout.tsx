import type { PropsWithChildren } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { api } from "~/utils/api";
import Head from "next/head";
import type { Session } from "next-auth";
import type { Owner } from "@prisma/client";
import Link from "next/link";

export const Layout = (props: PropsWithChildren) => {
    const { data: ownerData } = api.owners.getAll.useQuery();
    const { data: sessionData } = useSession();

    return (
        <>
        <Head>
          <title>Faithstore Inventory</title>
          <meta name="description" content="Book keeping application for Faithstore" />
          <link rel="icon" href="/n_favicon.ico" />
        </Head>
        <div className="min-h-screen text-blue-600 text-xl text-center">
          {!ownerData &&
            <div className="px-5 w-fit left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 absolute flex justify-center items-center text-blue-600">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div className="text-2xl">Loading...</div>
            </div>
          }
          {ownerData && !sessionData &&
            <div className="w-fit left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 absolute">
                <div className="pb-2 md:text-2xl">Please sign in</div>
                <button
                    className="px-3 py-1 text-lg md:text-xl rounded-full bg-blue-100 hover:bg-blue-200"
                    onClick={() => void signIn()}
                >Sign In</button>
            </div>
          }
          {ownerData && sessionData && !isAuthorized(sessionData, ownerData) &&
            <div className="w-fit left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 absolute">
                <Link className="underline" href={"https://science-hub-blog.vercel.app/"}>Not authorized. Click here to visit somewhere nice :)</Link>
                <button
                    className="px-3 py-1 text-lg md:text-xl rounded-full bg-blue-100 hover:bg-blue-200"
                    onClick={() => void signOut()}
                >Sign Out</button>
            </div>
          }
          {ownerData && sessionData && isAuthorized(sessionData, ownerData) &&
            <main>{props.children}</main>
          }
        </div>
        </>
    );
};

function isAuthorized(sessionData: Session, ownerData: Owner[]): boolean {
    const emails: string[] = ownerData.map((owner: Owner): string => { return owner.email || "nil" });
    return emails.includes(sessionData.user.email || "def not included");
}
