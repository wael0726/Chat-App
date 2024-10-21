import { useContext, useEffect, useState } from 'react';
import "./LeftSidebar.css";
import assets from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { arrayUnion, collection, getDocs, query, serverTimestamp, setDoc, updateDoc, where, doc, getDoc } from "firebase/firestore";
import { db, logout } from "../../config/firebase";
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
    
        const chatExists = chatData?.some(chat => chat.rId === user.id);
    
        if (chatExists) {
            toast.info("This user is already in your chat list.");
            return;
        }
    
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
    
            const uSnap = await getDoc(doc(db, "users", user.id))
            const uData = uSnap.data();
            setChat({
                messagesId: newMessageRef.id,
                lastMessage: "",
                rId: user.id,
                updatedAt: Date.now(),
                messageSeen: true,
                userData: uData
            });
    
            setShowSearch(false);
            toast.success(`${user.name} has been added to your chat list.`);
    
        } catch (error) {
            toast.error("An error occurred while adding the chat.");
            console.error(error);
        }
    };
    

    const setChat = async (item) => {
        try {
            setMessagesId(item.messageId);
            setChatUser(item);
            const userChatsRef = doc(db,"chats", userData.id);
            const userChatsSnapshot = await getDoc(userChatsRef);
            const userChatsData = userChatsSnapshot.data();
            const chatIndex = userChatsData.chatsData.findIndex((c) => c.messageId === item.messageId);
            userChatsData.chatsData[chatIndex].messageSeen = true;
            await updateDoc(userChatsRef, {
                chatsData: userChatsData.chatsData
            });
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        const updateChatUserData = async () => {
            if (chatUser) {
                const userRef = doc(db, "users", chatUser.userData.id);
                const userSnap = await getDoc(userRef);
                const userData = userSnap.data();
                setChatUser(prev => ({ ...prev, userData: userData }));
            }
        };
        updateChatUserData();
    }, [chatData]);

    return (
        <div className='ls'>
            <div className="ls-top">
                <div className="ls-nav">
                    <img src={assets.logo_big} className='logo' alt="" />
                    <div className="menu">
                        <img src={assets.menu_icon} alt="" />
                        <div className="sub-menu">
                            <p onClick={() => navigate("/profile")}>Edit profile</p>
                            <hr />
                            <p onClick={() => logout()}>Logout</p>
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
                    <div className='friends add-user'>
                        <img src={user.avatar} alt="" />
                        <p>{user.name}</p>
                        {/* Ajout du bouton add_icon.png */}
                        <img
                            src={assets.add_icon} // Ajouter le chemin vers l'image add_icon.png dans ton fichier assets.js
                            alt="Add User"
                            className="add-icon"
                            onClick={addChat} // Appel de la fonction addChat au clic
                        />
                    </div>
                ) : (
                    chatData?.map((item, index) => (
                        <div onClick={() => setChat(item)} key={index} className={`friends ${item.messageSeen || item.messageId === messagesId ? "" : "border"}`}>
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
