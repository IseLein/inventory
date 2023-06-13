import { type NextPage } from "next";
import Head from "next/head";
import Navbar from "~/components/navbar";
import Ledger from "~/components/ledger";
import Link from "next/link";
import { api } from "~/utils/api";
import { useState } from "react";
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend } from 'chart.js';
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend);

const Home: NextPage = () => {
  const { data: entries } = api.entries.getRecent.useQuery();

  return (
    <>
      <Head>
        <title>Faithstore Inventory</title>
        <meta name="description" content="Book keeping application for Faithstore" />
        <link rel="icon" href="/n_favicon.ico" />
      </Head>
      <Navbar text="Faithstore" link="/" />
      <div className="py-3 px-5 md:px-28 xl:px-[22rem]">
          <GraphView />
          <div className="my-6 xl:my-9">
              <div className="grid grid-cols-3 gap-2 md:gap-4 lg:gap-6 xl:gap-8">
                <Link href={""} className="py-2 px-3 border-0 text-lg font-normal font-atkinson bg-blue-50 hover:bg-blue-100 rounded-lg">
                    SALES
                </Link>
                <Link href={"/books"} className="py-2 px-3 border-0 text-lg font-normal font-atkinson bg-blue-50 hover:bg-blue-100 rounded-lg">
                    BOOKS
                </Link>
                <Link href={""} className="py-2 px-3 border-0 text-lg font-normal font-atkinson bg-blue-50 hover:bg-blue-100 rounded-lg">
                    STOCK
                </Link>
              </div>
          </div>
          <Ledger entries={entries} showButton={true} />
      </div>
    </>
  );
};

export default Home;

const GraphView: React.FC = () => {
    const { data: entries_ph } = api.entries.getLastMonthPh.useQuery();
    const { data: entries_oh } = api.entries.getLastMonthOh.useQuery();

    const options = {
        scales: {
            x: {
                grid: {
                    color: 'rgba(219, 234, 254, 0.4)',
                },
            },
            y: {
                grid: {
                    color: 'rgba(219, 234, 254, 0.8)',
                },
            }
        },
    }

    const [isQtyView, setQtyView] = useState<boolean>(false);

    function month_itoa(month: number): string {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Nov", "Dec"];
        return months[month] || "";
    }

    function getData(n: number) {
        if (!entries_ph || !entries_oh) {
            return null
        }
        const dates: Date[] = [];
        for (let i = n - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates[dates.length] = date;
        }
        const ph_data: number[] = Array.from({ length: 30 }, () => 0);
        const oh_data: number[] = Array.from({ length: 30 }, () => 0);

        const today = new Date();
        today.setDate(today.getDate() - (n - 1));
        const firstDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        for (const entry_ph of entries_ph) {
            let timeDiff = entry_ph.createdAt.getTime() - firstDay.getTime();
            timeDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

            let entry_data = isQtyView ? 1 : Number(entry_ph.price.toString());
            entry_data = entry_data * entry_ph.quantity;
            ph_data[timeDiff] = ph_data[timeDiff] || 0 + entry_data;
        }
        for (const entry_oh of entries_oh) {
            let timeDiff = entry_oh.createdAt.getTime() - firstDay.getTime();
            timeDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

            let entry_data = isQtyView ? 1 : Number(entry_oh.price.toString());
            entry_data = entry_data * entry_oh.quantity;
            oh_data[timeDiff] = oh_data[timeDiff] || 0 + entry_data;
        }

        const graphData = {
            labels: dates.map((date: Date) => {return `${month_itoa(date.getMonth())} ${date.getDate()}`}),
            datasets: [
                {
                  label: 'Peace House',
                  data: ph_data,
                  borderColor: 'rgb(24, 165, 88)',
                  backgroundColor: 'rgba(24, 165, 88, 0.5)',
                },
                {
                  label: 'Others',
                  data: oh_data,
                  borderColor: 'rgb(255, 99, 132)',
                  backgroundColor: 'rgba(255, 99, 132, 0.5)',
                }
            ],
        };
        return graphData;
    }

    const data_not_used = {
        datasets: []
    }

    return (
        <div className="">
            <div className="rounded-lg border-2 border-blue-100">
                <div className="pt-1 px-2 flex flex-row justify-end">
                    <label className="text-sm font-normal font-atkinson">
                        <input type="checkbox" checked={isQtyView} onChange={() => setQtyView(!isQtyView)}
                        />{" Quantity"}
                    </label>
                </div>
                <div className="p-2">
                    {!(entries_ph && entries_oh) &&
                        <div className="px-5 py-20 md:py-32 lg:py-48 xl:py-56 flex justify-center items-center text-blue-600">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <div className="text-2xl">Loading...</div>
                        </div>
                    }
                    {entries_ph && entries_oh &&
                        <>
                        <div className="hidden lg:block">
                            <Line
                              datasetIdKey='id'
                              options={options}
                              data={getData(21) || data_not_used}
                            />
                        </div>
                        <div className="hidden md:block lg:hidden">
                            <Line
                              datasetIdKey='id'
                              options={options}
                              data={getData(14) || data_not_used}
                            />
                        </div>
                        <div className="md:hidden">
                            <Line
                              datasetIdKey='id'
                              options={options}
                              data={getData(7) || data_not_used}
                            />
                        </div>
                        </>
                    }
                </div>
            </div>
        </div>
    );
};
