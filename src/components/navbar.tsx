
import Link from "next/link";
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";

type NavInfo = {
    text: string,
    link: string
}
const Navbar = (navProps: NavInfo) => {
    const { data: sessionData } = useSession();

    return(
        <div className="p-2 md:px-4 sticky z-40 top-0 text-blue-600 font-atkinson font-semibold flex flex-row justify-between border-b border-blue-100 backdrop-blur">
            <div className="flex flex-row items-center gap-2">
                <Link href={"/"}>
                    <Image src={"/n_favicon.ico"} alt="" width={25} height={25}></Image>
                </Link>
                <Link href={navProps.link} >
                    <div className="font-normal text-lg">
                        {navProps.text}
                    </div>
                </Link>
            </div>
            <div className="flex flex-row items-center gap-1">
                <button
                    className="p-1 md:py-1 md:px-3 font-normal text-lg rounded-full hover:bg-blue-100"
                    onClick={sessionData ? () => void signOut() : () => void signIn()}
                >{sessionData ? "Sign out" : "Sign in"}</button>
                {sessionData && sessionData.user.image &&
                    <Image className="rounded-full" src={sessionData?.user.image} alt="" width={25} height={25}/>
                }
            </div>
        </div>
    );
};

export default Navbar;
