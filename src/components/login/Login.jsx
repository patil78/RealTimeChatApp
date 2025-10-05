import { useState } from "react";
import axios from "axios";
import {toast, ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css"
import "./login.css";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import {doc, setDoc} from "firebase/firestore";


const Login = () =>{
    const [avatar , setAvatar] = useState({
        file: null,
        url: ""
    });

    const [loading, setLoading] = useState(false)

    const handleAvatar = e => {
        if(e.target.files[0]){
            setAvatar({
                file:e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
        }
    };

    const handleLogin = async(e) =>{
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);

    const { email,password} = Object.fromEntries(formData);
        try{
            await signInWithEmailAndPassword(auth, email,password);

        }catch(err){
            console.log(err);
            console.log(err.message);
        }finally{
    setLoading(false);
  }
    }

    const handleRegister = async(e) =>{
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);

        const {username, email,password} = Object.fromEntries(formData);
     try {
    // 1️⃣ Upload avatar to Cloudinary if file is chosen
    let avatarUrl = "";
    if (avatar.file) {
      const data = new FormData();
      data.append("file", avatar.file);
      data.append("upload_preset", "ReactChat_unsigned"); // your preset name

      const uploadRes = await axios.post(
        `https://api.cloudinary.com/v1_1/dveyxz1jy/image/upload`,
        data
      );

      avatarUrl = uploadRes.data.secure_url; // <-- public URL
    }

    // 2️⃣ Create Firebase user
    const res = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", res.user.uid), {
      username,
      email,
      id: res.user.uid,
      blocked: [],
      avatar: avatarUrl, // Cloudinary public URL
    });

    await setDoc(doc(db, "userchats", res.user.uid), { chats: [] });

    toast.success("Account Created! You can login now.");
  } catch (err) {
    console.error(err);
    toast.error(err.message);
  }
  finally{
    setLoading(false);
  }
};


    return (
        <div className="login">
            <ToastContainer/>

            <div className="item">
                <h2>Welcome Back!</h2>
                <form onSubmit={handleLogin}>
                    <input type="text" placeholder="Email" name="email"/>
                    <input type="password" placeholder="Password" name="password"/>
                    <button disabled={loading}>{loading ? "Loading": "Login"}</button>

                </form>
            </div>
            <div className="seperator"></div>
            <div className="item">
                <h2>Create an Account</h2>
                <form onSubmit={handleRegister}>
                    <label htmlFor="file">
                        <img src={avatar.url || "./avatar.png"} alt=""/>
                        Upload an Image</label>
                    <input type="file" id="file" style={{display: "none"}} onChange={handleAvatar}/>
                    <input type="text" placeholder="Username" name="username"/>
                    <input type="text" placeholder="Email" name="email"/>
                    <input type="password" placeholder="Password" name="password"/>
                    <button disabled={loading}>{loading ? "Loading": "Sign Up"}</button>

                </form>
            </div>
        </div>
    )
};
export default Login;