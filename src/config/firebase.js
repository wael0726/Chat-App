import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";

const firebaseConfig = {
  apiKey: "AIzaSyBkTCyAD3I5TOqQCC1mS1eTEQHCdfk88KI",
  authDomain: "chat-app-f0426.firebaseapp.com",
  projectId: "chat-app-f0426",
  storageBucket: "chat-app-f0426.appspot.com",
  messagingSenderId: "15348386943",
  appId: "1:15348386943:web:60f9a99fc40743d5bac34a"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async (username, email, password) => {
    try{
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;
        await setDoc(doc(db,"users", user.uid),{
            id:user.uid,
            username:username.toLowerCase(),
            email,
            name:"",
            avatar:"",
            bio:"Hey its me",
            lastSeen:Date.now()
        })
        await setDoc(doc(db, "chats", user.uid), {
            chatData:[]
        })
    } catch (error) {
        console.error(error)
        toast.error(error.code.split("/")[1].split("-").join(" "));
    }
}

const login = async (email, password) => {
    try{
        await signInWithEmailAndPassword(auth, email, password)
    } catch(error) {
        console.error(error)
        toast.error(error.code.split("/")[1].split("-").join(" "));
    }
}

const logout = async () => {
    try{
        await signOut(auth)
    } catch(error){
        console.error(error)
        toast.error(error.code.split("/")[1].split("-").join(" "));
    }
}

export {signup, login, logout, auth, db};