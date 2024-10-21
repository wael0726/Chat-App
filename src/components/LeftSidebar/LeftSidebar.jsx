import { useContext, useState } from 'react'
import "./LeftSidebar.css"
import assets from '../../assets/assets'
import { useNavigate } from 'react-router-dom'
import {arrayUnion, collection, getDocs, query, serverTimestamp, setDoc, updateDoc, where, doc} from "firebase/firestore"
import {db} from "../../config/firebase"
import { AppContext } from '../../context/AppContext'

const LeftSidebar = () => {

    const navigate = useNavigate();
    const {userData} = useContext(AppContext);
    const [user, setUser] = useState(null);
    const [showSearch, setShowSearch] = useState(false);

    const inputHandler = async (e) => {
        try {
            const input = e.target.value;
            if (input) {
                setShowSearch(true);
                const userRef = collection(db, "users");
                const q = query(userRef,where("username","==",input.toLowerCase()));
                const querySnap = await getDocs(q);
                if(!querySnap.empty && querySnap.docs[0].id !== userData.id)
                    {
                        setUser(querySnap.docs[0].data());
                    }
                    else {
                        setUser(null);
                    }
                }
                else {
                    setShowSearch(false);
                }
            } catch (error) {
                console.error(error)
            }
        }

    const addChat = async () => {
        const messageRef = collection(db, "messages");
        const chatsRef = collection(db, "chats");
        try {
            const newMessageRef = doc(messageRef);
            await setDoc(newMessageRef, {
                createAt:serverTimestamp(),
                messages:[]
            })
            await updateDoc(doc(chatsRef, user.id),{
                chatsData:arrayUnion({
                    messageId:newMessageRef.id,
                    lastMessage:"",
                    rId:userData.id,
                    updateAt:Date.now(),
                    messageSeen:true
                })
            })
        } catch (error) {
            console.log(error)
        }
    }

  return (
    <div className='ls'>
        <div className="ls-top">
            <div className="ls-nav">
                <img src={assets.logo} className='logo' alt=""/>
                <div className="menu">
                    <img src={assets.menu_icon} alt="" />
                    <div className="sub-menu">
                        <p onClick={() => navigate("/profile")}>Edit profile</p>
                        <hr />
                        <p>Logout</p>
                    </div>
                </div>
            </div>
            <div className="ls-search">
                <img src={assets.search_icon} alt="" />
                <input onChange={inputHandler} type="text" placeholder='Search here' />
            </div>
        </div>
        <div className="ls-list">
            {showSearch && user
            ? <div onClick={addChat} className='friends add-user'>
                <img src={user.avatar} alt="" />
                <p>{user.name}</p>
            </div>
            :Array(12).fill("").map((item, index) => (
                <div key={index} className="friends">
                <img src={assets.profile_img} alt="" />
                <div>
                    <p>
                        Wael Bennabi
                    </p>
                    <span>Hello, How are you?</span>
                </div>
            </div>
            ))
            }
        </div>
    </div>
  )
}

export default LeftSidebar