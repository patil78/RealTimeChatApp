import "./chatlist.css";
import { useState, useEffect } from "react";
import AddUser from "./addUser/addUser";
import { useUserStore } from "../../../lib/userStore";
import { doc, onSnapshot, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatstore";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");

  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  useEffect(() => {
    if (!currentUser?.id) return;

    const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
      if (!res.exists() || !res.data()?.chats) {
        setChats([]);
        return;
      }

      const items = res.data().chats;
      const promises = items.map(async (item) => {
        const userDocRef = doc(db, "users", item.receiverId);
        const userDocSnap = await getDoc(userDocRef);
        const user = userDocSnap.data();
        return { ...item, user };
      });

      const chatData = await Promise.all(promises);

      // ✅ Ensure that unseen messages show correctly (blue background)
      setChats(chatData.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)));
    });

    return () => unSub();
  }, [currentUser?.id]);

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex((item) => item.chatId === chat.chatId);
    if (chatIndex === -1) return;

    // ✅ Mark selected chat as seen when user opens it
    userChats[chatIndex].isSeen = true;
    userChats[chatIndex].updatedAt = Date.now();

    const userChatsRef = doc(db, "userchats", currentUser.id);
    try {
      await updateDoc(userChatsRef, { chats: userChats });
      changeChat(chat.chatId, chat.user);
    } catch (err) {
      console.error("Error updating userchats:", err);
    }
  };

  const filteredchats = chats.filter((c) => c.user.username.toLowerCase().includes(input.toLowerCase()))

  return (
    <div className="chatlist">
      <div className="search">
        <div className="searchbar">
          <img src="./search.png" alt="" />
          <input type="text" placeholder="Search" onChange={(e) => setInput(e.target.value)} />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt=""
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>

      {filteredchats.map((chat) => (
        <div
          className="item"
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
          style={{
            // ✅ Blue only if message not seen
            backgroundColor: chat.isSeen ? "transparent" : "#5183fe",
            transition: "background-color 0.3s ease",
          }}
        >
          <img src={chat.user.blocked.includes(currentUser.id) ?  "./avatar.png" : chat.user.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{
                chat.user.blocked.includes(currentUser.id) ?
             "user" : chat.user.username
                }
            
             </span>
            <p>{chat.lastMessage || ""}</p>
          </div>
        </div>
      ))}

      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;
