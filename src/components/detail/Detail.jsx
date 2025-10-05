import "./detail.css";
import { auth } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatstore";
import { useUserStore } from "../../lib/userStore";
import { db } from "../../lib/firebase";
import {doc, updateDoc, arrayRemove, arrayUnion } from "firebase/firestore";
const Detail = () => {
    const { user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = useChatStore();
  const { currentUser } = useUserStore();

  const handleBlock = async () => {
    if (!user) return;
    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock(); // immediately update store
    } catch (err) {
      console.log(err);
    }
    };
    return (
        <div className="detail">
            <div className="user">
                <img src={user?.avatar || "./avatar.png"} alt="" />
                <h2>{user?.username}</h2>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium, dignissimos, quisquam quidem ad qui sint sequi temporibus consequatur dolorem nobis similique, cupiditate sed.</p>
            </div>
            <div className="info">
                <div className="option">
                    <div className="title">
                        <span>Chat Settings</span>
                        <img src="./arrowUp.png" alt="" />
                    </div>
                </div>
                <div className="option">
                    <div className="title">
                        <span>Privacy & help</span>
                        <img src="./arrowUp.png" alt="" />
                    </div>
                </div>
                <div className="option">
                    <div className="title">
                        <span>Shared Photo</span>
                        <img src="./arrowDown.png" alt="" />
                    </div>
                    <div className="photos">
                        <div className="photoitem">
                            <div className="photodetail">

                                <img src="https://plus.unsplash.com/premium_vector-1723414018311-cb8c79149b96?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDF8ck5iajNOQkFZX3d8fGVufDB8fHx8fA%3D%3D" alt="" />
                                <span>photo_2024_2.png</span>
                            </div>

                            <img src="./download.png" alt="" className="icons" />
                        </div>

                        <div className="photoitem">
                            <div className="photodetail">

                                <img src="https://plus.unsplash.com/premium_vector-1723414018311-cb8c79149b96?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDF8ck5iajNOQkFZX3d8fGVufDB8fHx8fA%3D%3D" alt="" />
                                <span>photo_2024_2.png</span>
                            </div>

                            <img src="./download.png" alt="" className="icons" />
                        </div>

                        <div className="photoitem">
                            <div className="photodetail">

                                <img src="https://plus.unsplash.com/premium_vector-1723414018311-cb8c79149b96?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDF8ck5iajNOQkFZX3d8fGVufDB8fHx8fA%3D%3D" alt="" />
                                <span>photo_2024_2.png</span>
                            </div>

                            <img src="./download.png" alt="" className="icons" />
                        </div>


                    </div>
                </div>
                <div className="option">
                    <div className="title">
                        <span>Shared files</span>
                        <img src="./arrowUp.png" alt="" />
                    </div>
                </div>
                <button onClick={handleBlock}>
        {isCurrentUserBlocked
          ? "You are blocked!"
          : isReceiverBlocked
          ? "User blocked"
          : "Block user"}
      </button>
                <button className="logout" onClick={() => auth.signOut()}>Logout</button>
            </div>
        </div>
    )
}
export default Detail;