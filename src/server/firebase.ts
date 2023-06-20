
import { env } from "~/env.mjs";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
    apiKey: env.API_KEY,
    authDomain: env.AUTH_DOMAIN,
    projectId: env.PROJECT_ID,
    storageBucket: env.STORAGE_BUCKET,
    messagingSenderId: env.MESSAGING_SENDER_ID,
    appId: env.APP_ID,
    measurementId: env.MEASUREMENT_ID
};
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const leptos = () => {
    return "function";
};

export default leptos;
