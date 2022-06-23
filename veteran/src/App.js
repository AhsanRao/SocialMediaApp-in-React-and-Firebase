import logo from './logo.svg';
import './App.css';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { Navigate, Route, Routes } from 'react-router-dom';
import LightbulbCircleIcon from '@mui/icons-material/LightbulbCircle';
import { Link, useHistory } from 'react-router-dom'
import { useCollection, useCollectionData } from 'react-firebase-hooks/firestore';

import GoogleIcon from '@mui/icons-material/Google';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  getFirestore, collection, onSnapshot,
  addDoc, deleteDoc, doc,
  query, where,
  orderBy, serverTimestamp,
  updateDoc
} from 'firebase/firestore'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'




// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDWiomcVk7vxpEMp9JhfA6AZgKo81CLiJQ",
  authDomain: "veteran-1db97.firebaseapp.com",
  projectId: "veteran-1db97",
  storageBucket: "veteran-1db97.appspot.com",
  messagingSenderId: "274810854824",
  appId: "1:274810854824:web:6d844b069d7ad731b3519d",
  measurementId: "G-89LEDJ7J4G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


function App() {
  const [user, loading, error] = useAuthState(auth);
  return (
    <div className="App">
      {user? <Nav></Nav>: ""}
       <Routes>

        {user? <Route path='/' element={<Feed user = {user}/>}></Route>:<Route path='/' element={<SigninPage  user = {user} />}/>}
        <Route path = '/profile' element = {<Profile></Profile>} ></Route>
        <Route path = '/chat' element = {<Chat></Chat>}></Route>
      </Routes>
    </div>
  );
}

export default App;

//Navbar

export const Nav = () => {
  const logOut = () => 
  {
    signOut(auth);
    <Navigate to = "/"></Navigate>

    
  }
  return (
    <div className='nav'> 
   

      <Link to="/" className='feed-links'>Feed</Link>
      {/* <Link to="/signIn" className='feed-links'>Profile</Link> */}
      <Link to="/profile" className='feed-links'>Profile</Link>
      <Link to="/chat" className='feed-links'>Chat</Link>
      <button className='google-btn' onClick={logOut}>Log Out</button>
      
 
  </div>

  )
}



//Components

//singinPage

const SigninPage = (props) => {
  console.log(props.user)
  const signInUser = async() => 
  {
    const googleProvider = new GoogleAuthProvider();
    try
    {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;

      const colRef = collection(db, 'users');
      const q = query(colRef,where("uid","==",user.uid));
      let users = []
      const unsubCol = onSnapshot(q, (snapshot) => {
        snapshot.docs.forEach(doc => {
          users.push(doc.data())
        })
      });
      
      console.log(user)
      if(users.length === 0)
      {
        addDoc(colRef,{
          name: user.displayName,
          uid: user.uid
        })
      }
    
  

    }
    catch(e)
    {
      console.error(e);
    }
  
    

  }
  return (

    // left sections P
 
    <div className='container'>
      <section className='left'>
        <div className='img-container'>
          <img src="https://public-files.gumroad.com/ci5ek0wpe2cj4lqv4eju6ghg9epq" alt="Flowers in Chania"/>
        </div>
     
      </section>

      {/* Right section  */}
      <section className='right' >

        <div className='tag-line'>
            <h1 className='large-heading'>Veteran Meet</h1>
            <h1 className='age-quote'>Say Good Bye To Boredom </h1>
        </div>
        <div className='signIn-btn'>

          <button className='google-btn' onClick={signInUser}>Sign in with google</button>

        </div>

      </section>

    </div>
  )
}


//Feed

export const Feed = () => {
  const [user, loading, error] = useAuthState(auth);
  const [post, setPosts] = useState([]);


  

            const colRef = collection(db, 'posts');
            const q = query(colRef, orderBy('created','desc'));
          
                  const [data] = useCollectionData(q);
                  
                  // console.log(data)



    

  


  return (
    <div className='main-container'>
      <div className='feed-container'>
        <CreatePost/>
        {!data?<p>Loadingggg</p>: <Post posts= {data}></Post>}
        
     
        
      </div>

    </div>
    //implement the firestore db
  )
}

//posts feed


export const Post = (props) => {
  const [user, loading, error] = useAuthState(auth);
  console.log(props.posts)


return(
        props.posts.map(post => 
          (

          <div className='Posted-post'>
            <div className='post-image'>
              <img src={post.displayImage} className = 'postimg'></img>
            </div>
            <div className='text-container'>
              <h3 className='postText'>{post.text}</h3>
            </div>
          
          </div>
          ))
)


}

//create post section is here


export const CreatePost = () => {
  const [user, loading, error] = useAuthState(auth);
  const [post,setPost] = useState();
  const vetPost = useRef();
  

  //make post
  const makePost = () => 
  {
    const colRef = collection(db, 'posts');
    const q = query(colRef);

    addDoc(colRef, {
      displayImage: user.photoURL,
      displayName: user.displayName,
      text: post,
      created:  serverTimestamp(),
    })
    vetPost.value.text = "";
  }
 



  return (
    <div className='create-post'>
      <div className='post-image'>
        <img src={user.photoURL} className = 'postimg'></img>
      </div>
      <div className='form-container'>
        <form className='post-form'>
          <textarea type={"textarea"} placeholder = "Share Your Wisdom" onChange={e => setPost(e.target.value) } ref = {vetPost}></textarea>
        </form>

      </div>
      <div>
        <button className='post-btn btn' onClick={makePost} >Post</button>
      </div>
    </div>
  )
}


//profile page

export const Profile = () => {
  const [user, loading, error] = useAuthState(auth);
  console.log(user)

  return (
    <div>
      <div className='cover-photo'>
          
          <div className='profile-image'>
            <img src = {user.photoURL}></img>
          </div>
      </div>
      <h1 className='dead-text'>Welcome Home {user.displayName}</h1>
    </div>
  )
}





export const Chat = () => {
  const scrollDown = useRef();
  const [user, loading, error] = useAuthState(auth);
  const [message, setMessage] = useState([]);
            const colRef = collection(db, 'messages');
            const q = query(colRef, orderBy('created'));
          
                  const [data] = useCollectionData(q);

                  const [post,setPost] = useState();
                  const vetPost = useRef();
                  
                
                  //make post
                  const makePost = () => 
                  {
                    const colRef = collection(db, 'messages');
                    const q = query(colRef);
                
                    addDoc(colRef, {
                   
                      created:  serverTimestamp(),
                      message: message,
                      name: user.displayName,
                      uid: user.uid,
                    })
                    vetPost.value.text = "";
                  }

  useEffect(() => 
  {
    scrollDown.current.scrollIntoView({ behavior: "smooth" })

  },[message])
                 
                  
                  // console.log(data)
  return (
    <div className='main-container main-message-container' >
      <div className='feed-container msg-container'>
        {!data?<p>Loadingggg</p>: <Message posts= {data}></Message>}
        <div className='create-post'>
      <div className='post-image'>
        {/* <img src={user.photoURL} className = 'postimg'></img> */}
      </div>
      <div className='form-container'>
        <form className='post-form'>
          <textarea className='area'  type={"textarea"} placeholder = "Share Your kindness" onChange={e => setMessage(e.target.value) } ref = {vetPost}></textarea>
        </form>

      </div>
      <div>
        <button className='post-btn btn' onClick={makePost} ref={scrollDown}>Send Message</button>
      </div>
    </div>
        
     
        
      </div>

    </div>
    //implement the firestore db
  )
}


export const Message = (props) => {
  const [user, loading, error] = useAuthState(auth);
  console.log(props.posts)


return(
        props.posts.map(post => 
          (
            
          <div className={user.uid != post.uid? 'other-message msg': 'my-message msg'}>
           
            <div >
              <p className="message-text">{post.message}</p>
              <p className='tag'>~{post.name}</p>
            </div>
          
          </div>
          ))
)

}



