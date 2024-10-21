import { useContext, useState } from 'react';
import "./LeftSidebar.css";
import assets from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { arrayUnion, collection, getDocs, query, serverTimestamp, setDoc, updateDoc, where, doc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';

const LeftSidebar = () => {

    const navigate = useNavigate();
    const { userData, chatData, chatUser, setChatUser, setMessagesId, messagesId } = useContext(AppContext);
    const [user, setUser] = useState(null);
    const [showSearch, setShowSearch] = useState(false);

    const inputHandler = async (e) => {
        const input = e.target.value;
        if (!input) {
            setShowSearch(false);
            setUser(null);
            return;
        }

        try {
            setShowSearch(true);
            const userRef = collection(db, "users");
            const q = query(userRef, where("username", "==", input.toLowerCase()));
            const querySnap = await getDocs(q);

            if (!querySnap.empty && querySnap.docs[0].id !== userData?.id) {
                const fetchedUser = querySnap.docs[0].data();
                const userExist = chatData?.some(chat => chat.rId === fetchedUser.id);

                if (!userExist) {
                    setUser(fetchedUser);
                } else {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        } catch (error) {
            toast.error("An error occurred while searching.");
            console.error(error);
        }
    };

    const addChat = async () => {
        if (!user) return;

        try {
            const messageRef = collection(db, "messages");
            const chatsRef = collection(db, "chats");
            const newMessageRef = doc(messageRef);

            await setDoc(newMessageRef, {
                createAt: serverTimestamp(),
                messages: []
            });

            await updateDoc(doc(chatsRef, user.id), {
                chatsData: arrayUnion({
                    messageId: newMessageRef.id,
                    lastMessage: "",
                    rId: userData?.id,
                    updateAt: Date.now(),
                    messageSeen: true
                })
            });

            await updateDoc(doc(chatsRef, userData?.id), {
                chatsData: arrayUnion({
                    messageId: newMessageRef.id,
                    lastMessage: "",
                    rId: user.id,
                    updateAt: Date.now(),
                    messageSeen: true
                })
            });
        } catch (error) {
            toast.error(error);
            console.error(error);
        }
    };

    const setChat = async (item) => {
        setMessagesId(item.messageId);
        setChatUser(item)
    }

    return (
        <div className='ls'>
            <div className="ls-top">
                <div className="ls-nav">
                    <img src={assets.logo} className='logo' alt="" />
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
                {showSearch && user ? (
                    <div onClick={addChat} className='friends add-user'>
                        <img src={user.avatar} alt="" />
                        <p>{user.name}</p>
                    </div>
                ) : (
                    chatData?.map((item, index) => (
                        <div onClick={() => setChat(item)} key={index} className="friends">
                            <img src={item.userData.avatar} alt="" />
                            <div>
                                <p>{item.userData.name}</p>
                                <span>{item.lastMessage}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LeftSidebar;
