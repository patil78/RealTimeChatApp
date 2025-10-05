import "./chat.css";
import React, { useEffect, useState, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import { arrayUnion, doc, onSnapshot, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatstore";
import { useUserStore } from "../../lib/userStore";

// -------------------------
// Cloudinary Upload Function
// -------------------------
const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ReactChat_unsigned"); // Your preset
  try {
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dveyxz1jy/image/upload", // Your cloud name
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await res.json();
    return data.secure_url;
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return null;
  }
};

// -------------------------
// Chat Component
// -------------------------
const Chat = () => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [Text, setText] = useState("");
  const [img, setImg] = useState({ file: null, url: "" });

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
  const endRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  // Listen to chat document
  useEffect(() => {
    if (!chatId) return;
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => unSub();
  }, [chatId]);

  // Emoji picker
  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  // Handle image selection
  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  // Send message
  const handleSent = async () => {
    // Prevent sending if blocked
    if (isCurrentUserBlocked || isReceiverBlocked) return;
    if (Text.trim() === "" && !img.file) return;

    let imgurl = null;
    try {
      if (img.file) imgurl = await uploadToCloudinary(img.file);

      // Add message to Firestore
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          Text,
          createdAt: new Date(),
          ...(imgurl && { img: imgurl }),
        }),
      });

      // Update userchats for both users
      const userIDs = [currentUser.id, user.id];
      for (const id of userIDs) {
        const userchatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userchatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);

          if (chatIndex !== -1) {
            userChatsData.chats[chatIndex].lastMessage = Text || "📷 Image";
            userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
            userChatsData.chats[chatIndex].updatedAt = Date.now();
          } else {
            userChatsData.chats.push({
              chatId,
              receiverId: user.id,
              lastMessage: Text || "📷 Image",
              isSeen: id === currentUser.id,
              updatedAt: Date.now(),
            });
          }

          await updateDoc(userchatsRef, { chats: userChatsData.chats });
        }
      }

      setText("");
      setImg({ file: null, url: "" });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="chat">
      {/* Top Bar */}
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username || "User"}</span>
            <p>{chat?.messages?.length ? chat.messages[chat.messages.length - 1]?.Text : "Say hi 👋"}</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="Phone" />
          <img src="./video.png" alt="Video" />
          <img src="./info.png" alt="Info" />
        </div>
      </div>

      {/* Messages */}
      <div className="center">
        {chat?.messages?.map((message, index) => (
          <div className={`messages ${message.senderId === currentUser.id ? "own" : ""}`} key={index}>
            <div className="text">
              {message.img && <img src={message.img} alt="" />}
              <p>{message.Text}</p>
            </div>
          </div>
        ))}

        {img.url && (
          <div className="messages own">
            <div className="text">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}

        <div ref={endRef}></div>
      </div>

      {/* Input */}
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="Upload" />
          </label>
          <input type="file" id="file" style={{ display: "none" }} onChange={handleImg} />
          <img src="./camera.png" alt="Camera" />
          <img src="./mic.png" alt="Mic" />
        </div>

        <input
          type="text"
          placeholder={isCurrentUserBlocked ? "You are blocked!" : isReceiverBlocked ? "User blocked" : "Type a message..."}
          value={Text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />

        <div className="emoji">
          <img src="./emoji.png" alt="Emoji" onClick={() => setOpen((prev) => !prev)} />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>

        <button
          className="sendbutton"
          onClick={handleSent}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;

<div className="icons">
          <img src="./phone.png" alt="Phone" />
          <img src="./video.png" alt="Video" />
          <img src="./info.png" alt="Info" />
        </div>