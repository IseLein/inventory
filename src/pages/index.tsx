import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Navbar from "~/components/navbar";
import { api } from "~/utils/api";

const Home: NextPage = () => {
  const { data: ownerData } = api.owners.getAll.useQuery();
  const { data: sessionData } = useSession();

  return (
    <>
      <Head>
        <title>Faithstore Inventory</title>
        <meta name="description" content="Book keeping application for Faithstore" />
        <link rel="icon" href="/n_favicon.ico" />
      </Head>
      <Navbar text="Faithstore" link="https://inventory-iselein.vercel.app/" />
          {ownerData && sessionData &&
            <p className="text-2xl text-black">
                {ownerData[0]?.email}
            </p>
          }
        <button>ddd</button>
    </>
  );
};

export default Home;
