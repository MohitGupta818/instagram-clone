import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthProvider";
import { Button } from "@material-ui/core";
import PhotoCamera from "@material-ui/icons/PhotoCamera";
import { firebaseDB, firebaseStorage, timeStamp } from "../config/firebase";
import { uuid } from "uuidv4";
import VideoPost from "./VideoPost";
import { Avatar, makeStyles } from "@material-ui/core";

const Feeds = (props) => {
  const { signOut } = useContext(AuthContext);
  const [videoFile, setVideoFile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [uploadVideoError, setUploadVideoError] = useState("");
  const { currentUser } = useContext(AuthContext);
  const [userName, setUserName] = useState();
  const [userImageUrl, setUserProfileImageUrl] = useState();
  const [progress, setProgress] = useState("");

  const handleLogout = async () => {
    try {
      await signOut();
      props.history.push("/login");
    } catch (err) {
      console.log(err);
    }
  };
  const handleInputFile = (e) => {
    let file = e.target.files[0];
    setVideoFile(file);
  };
  const handleUploadFile = async () => {
    try {
      if (videoFile.size / 1000000 > 5) {
        setUploadVideoError("Selected File Exceeds 5MB cannot upload !");
        return;
      }

      // upload video in firebase storage
      let uid = currentUser.uid;
      const uploadVideoObject = firebaseStorage
        .ref(`/profilePhotos/${uid}/${Date.now()}.mp4`)
        .put(videoFile);
      uploadVideoObject.on("state_changed", fun1, fun2, fun3);
      function fun1(snapshot) {
        // bytes transferred
        // total bytes
        let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      }
      // if indicates a error !!
      function fun2(error) {
        console.log(error);
      }
      // it indicates success of the upload !!
      async function fun3() {
        let videoUrl = await uploadVideoObject.snapshot.ref.getDownloadURL();
        // console.log(videoUrl);
        let pid = uuid(); // unique post id
        // create a post document
        await firebaseDB.collection("posts").doc(pid).set({
          pid: pid,
          uid: uid,
          comments: [],
          likes: [],
          videoLink: videoUrl,
          createdAt: timeStamp(),
        });
        // get user document
        let doc = await firebaseDB.collection("users").doc(uid).get();
        let document = doc.data();
        // push pid in post in user document
        document.postsCreated.push(pid);
        // set updated user document
        await firebaseDB.collection("users").doc(uid).set(document);
        setUploadVideoError("");
        setVideoFile(null);
        setProgress(0);
      }
    } catch (err) {}
  };

  let conditionObject = {
    root: null, //observe from whole page
    threshold: "0.8", //80%
  };

  function cb(entries) {
    // console.log(entries);
    entries.forEach((entry) => {
      let child = entry.target.children[0];
      // play(); => async
      // pause(); => sync

      child.play().then(function () {
        if (entry.isIntersecting == false) {
          child.pause();
        }
      });
    });
  }

  useEffect(() => {
    // code which will run when the component loads
    let observerObject = new IntersectionObserver(cb, conditionObject);
    let elements = document.querySelectorAll(".video-container");

    elements.forEach((el) => {
      observerObject.observe(el); //Intersection Observer starts observing each video element
    });
  }, [posts]);

  useEffect(async () => {
    //GET ALL THE POSTS
    //onSnapshot => listens for changes on the collection
    firebaseDB
      .collection("posts")
      .orderBy("createdAt", "desc")
      .onSnapshot((snapshot) => {
        let allPosts = snapshot.docs.map((doc) => {
          return doc.data();
        });
        setPosts(allPosts);
      });

    let doc = await firebaseDB.collection("users").doc(currentUser.uid).get();
    let user = doc.data();
    let currentUserName = user.username;
    let currentProfileImageUrl = user.profileImageUrl;
    setUserName(currentUserName);
    setUserProfileImageUrl(currentProfileImageUrl);
  }, []); //component did mount !!

  let useStyles = makeStyles({
    header: {
      position: "sticky",
      top: "0",
      zIndex: "1",
      backgroundColor: "white",
      padding: "20px",
      objectFit: "contain",
      border: "1px solid lightgray",
      display: "flex",
      justifyContent: "space-between",
      alignItems:"center",
      height:"35px",
    },
    headerImage: {
      objectFit: "contain",
    },
    oneDiv:{
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
    },
    columnwise:{
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
      flexDirection:"column",
      marginLeft:"15px",
      margin: "auto"
    },
    marginbottom:{
      marginBottom:"5px"
    },
    margintop:{
      marginTop:"10px"
    },
    smallSize:{
      height:"40px"
    }
  });
  let classes = useStyles();

  return (
    <div>
      <div className={classes.header}>
        

        {/* <input type="file" onChange={handleInputFile} /> */}
        <div className={classes.oneDiv}>
          <div className={classes.columnwise}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCamera></PhotoCamera>}
              color="secondary"
              className={classes.marginbottom}
            >
              Choose Video
              <input type="file" hidden onChange={handleInputFile} />
            </Button>

            <progress value={progress} max="100"></progress>
          </div>

          <div className={classes.columnwise}>
            <Button
              onClick={handleUploadFile}
              variant="contained"
              color="secondary"
            >
              Upload
            </Button>
            <label>{uploadVideoError}</label>
          </div>
        </div>

        <img
          className={classes.headerImage}
          src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
          alt=""
        ></img>

        <div className={classes.oneDiv}>
          <div className={classes.columnwise}>
            <Avatar src={userImageUrl} className={classes.margintop}></Avatar>
            <Button size="small" variant="text" color="primary">
              {userName}
            </Button>
          </div>

          <Button onClick={handleLogout} variant="contained" color="primary" className={classes.smallSize}>
            Logout
          </Button>
        </div>
      </div>

      <div className="feeds-video-list" style={{ margin: "auto" }}>
        {posts.map((postObj) => {
          return <VideoPost key={postObj.pid} postObj={postObj}></VideoPost>;
        })}
      </div>
    </div>
  );
};

export default Feeds;
