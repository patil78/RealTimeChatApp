import "./addUser.css";
import { useState, useEffect } from "react";
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { useUserStore } from "../../../../lib/userStore";

const AddUser = () => {
  const [user, setUser] = useState(null);
  const [alreadyAdded, setAlreadyAdded] = useState(false);
  const { currentUser } = useUserStore();

  // Search user by username
  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        const docSnap = querySnapShot.docs[0];
        const searchedUser = { id: docSnap.id, ...docSnap.data() };
        setUser(searchedUser);

        // Check if chat already exists
        const currentUserChatsRef = doc(db, "userchats", currentUser.id);
        const currentUserChatsSnap = await getDoc(currentUserChatsRef);
        const currentUserChats = currentUserChatsSnap.exists() ? currentUserChatsSnap.data().chats : [];
        const exists = currentUserChats.some(chat => chat.receiverId === searchedUser.id);
        setAlreadyAdded(exists);

      } else {
        setUser(null);
        setAlreadyAdded(false);
      }
    } catch (err) {
      console.log("Error searching user:", err);
    }
  };

  // Add user/chat
  const handleAdd = async () => {
    if (!user || alreadyAdded) return;

    try {
      // Create a new chat
      const newChatRef = doc(collection(db, "chats"));
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      // Update userChats for the searched user
      await updateDoc(doc(db, "userchats", user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(doc(db, "userchats", currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now(),
        }),
      });

      console.log("Chat added:", newChatRef.id);
      setUser(null);
      setAlreadyAdded(false);
    } catch (err) {
      console.log("Error adding chat:", err);
    }
  };

  return (
    <div className="adduser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" />
        <button type="submit">Search</button>
      </form>

      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./avatar.png"} alt="avatar" />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd} disabled={alreadyAdded}>
            {alreadyAdded ? "User Already Added" : "Add User"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
