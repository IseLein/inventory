
import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import Navbar from "~/components/navbar";
import { api } from "~/utils/api";
import Image from "next/image";
import { useRouter } from "next/router";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: "inventory-389209.appspot.com",
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID
};
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const NewBook: NextPage = () => {
    const placeholder = "https://firebasestorage.googleapis.com/v0/b/inventory-389209.appspot.com/o/books%2Fplaceholder.png?alt=media&token=7183db6b-749d-4016-a1dc-7cbce9d9de06";
    const [imageSrc, setImageSrc] = useState(placeholder);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [shortTitle, setShortTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [price, setPrice] = useState(0);
    const [category, setCategory] = useState("");
    const [modalMsg, setModalMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const { mutate, isLoading: isMutating } = api.books.create.useMutation({
        onSuccess: (data) => {
            void router.push(`/books/${data.id}`);
        },
        onError: () => {
            setModalMsg("An Error Ocuured");
            const modal = document.getElementsByTagName("dialog").item(0);
            if (!modal) {
                console.log("error due to ..");
                return;
            }
            modal.showModal();
        }
    });

    function handleSubmit() {
        const modal = document.getElementsByTagName("dialog").item(0);
        if (!modal) {
            console.log("error due to ..");
            setIsLoading(false);
            return;
        }
        // validate
        if (!imageFile) {
            setModalMsg("Select an Image");
            modal.showModal();
            setIsLoading(false);
            return;
        }
        if (title === "") {
            setModalMsg("Enter a title");
            modal.showModal();
            setIsLoading(false);
            return;
        }
        if (shortTitle === "") {
            setModalMsg("Enter a display title");
            modal.showModal();
            setIsLoading(false);
            return;
        }
        if (author === "") {
            setModalMsg("Enter a display title");
            modal.showModal();
            setIsLoading(false);
            return;
        }
        if (price === 0) {
            setModalMsg("Enter a price");
            modal.showModal();
            setIsLoading(false);
            return;
        }
        if (category === "") {
            setModalMsg("Choose a category");
            modal.showModal();
            setIsLoading(false);
            return;
        }

        const imgRef = ref(storage, `books/${uuidv4()}`);
        uploadBytes(imgRef, imageFile)
            .then(
                async () => {
                    const image = await getDownloadURL(imgRef);
                    setIsLoading(false);
                    mutate({
                        title,
                        shortTitle,
                        author,
                        price,
                        category,
                        image,
                    });
                },
                () => {
                    setModalMsg("An error occured");
                    modal.showModal();
                    setIsLoading(false);
                    return;
                }
            );
    }

    function closeModal(message: string) {
        const modal = document.getElementsByTagName("dialog").item(0);
        if (!modal) {
            console.log("error due to ..");
            return;
        }
        modal.close(message);
    }

    return (
        <>
            <Head>
              <title>New Book</title>
              <meta name="description" content="Book keeping application for Faithstore" />
              <link rel="icon" href="/n_favicon.ico" />
            </Head>
            <Navbar text="Books" link="/books/" />
            <dialog id="modal">
                <div className="font-atkinson text-blue-500">
                    <div>{modalMsg}</div>
                    <div className="py-2 flex flex-row justify-center gap-2">
                        <button onClick={() => closeModal("")} className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-200">ok</button>
                    </div>
                </div>
            </dialog>
            <div className="py-3 px-5 md:px-28 xl:px-[12rem] 2xl:px-[20rem]">
                <div className="flex flex-col items-center font-atkinson text-base md:text-xl xl:text-2xl">
                    <div className="py-4 md:py-6">
                        <Image className="m-auto rounded-lg border border-slate-100 md:hidden" src={imageSrc} alt="" width={156} height={156} />
                        <Image className="m-auto rounded-lg border border-slate-100 hidden md:block lg:hidden" src={imageSrc} alt="" width={256} height={256} />
                        <Image className="m-auto rounded-lg border border-slate-100 hidden lg:block" src={imageSrc} alt="" width={346} height={346} />
                    </div>
                    <div className="pb-2">
                        <input className="w-full overflow-hidden" type="file" accept="image/*"
                            onChange={(e) => {
                                setImageSrc(URL.createObjectURL((e.target.files ? e.target.files[0] || new Blob() : new Blob())));
                                setImageFile(e.target.files ? e.target.files[0] || null : null)
                            }}
                        />
                    </div>
                    <div className="py-2 w-full flex flex-row">
                        <label className="pr-2" htmlFor="title">Title:</label>
                        <input className="w-full border-b border-slate-200 focus:outline-none focus:border-blue-300" id="title" type="text" defaultValue={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="py-2 w-full flex flex-row">
                        <label className="pr-2" htmlFor="shortTitle">Display:</label>
                        <input className="w-full border-b border-slate-200 focus:outline-none focus:border-blue-300" id="shortTitle" type="text" defaultValue={shortTitle}
                            onChange={(e) => setShortTitle(e.target.value)}
                        />
                    </div>
                    <div className="py-2 w-full flex flex-row">
                        <label className="pr-2" htmlFor="author">Author:</label>
                        <input className="w-full border-b border-slate-200 focus:outline-none focus:border-blue-300" id="author" type="text" defaultValue={author}
                            onChange={(e) => setAuthor(e.target.value)}
                        />
                    </div>
                    <div className="py-2 w-full flex flex-row">
                        <label className="pr-2" htmlFor="price">Price:</label>
                        <input className="w-full border-b border-slate-200 focus:outline-none focus:border-blue-300" id="price" type="number" defaultValue={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                        />
                    </div>
                    <div className="py-2 flex flex-row gap-2">
                        <div className="px-2 py-1 border rounded-lg flex flex-row items-center">
                            <input type="radio" id="ph" name="category" value="peace_house" onClick={() => setCategory("peace_house")} />
                            <label className="pl-1" htmlFor="ph">Peace House</label>
                        </div>
                        <div className="px-2 py-1 border rounded-lg flex flex-row items-center">
                            <input type="radio" id="oh" name="category" value="others" onClick={() => setCategory("other")}/>
                            <label className="pl-1" htmlFor="oh">Others</label>
                        </div>
                    </div>
                    <button disabled={isLoading || isMutating} className="my-2 px-3 py-2 rounded-full bg-blue-50"
                        onClick={() => {
                            setIsLoading(true);
                            handleSubmit();
                        }}>
                        {!(isMutating || isLoading) && <div>ADD</div>}
                        {(isMutating || isLoading) && <div>loading</div>}
                    </button>
                </div>
            </div>
        </>
    );
};

export default NewBook;
