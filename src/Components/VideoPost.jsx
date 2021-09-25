import React, { useContext, useEffect, useState } from "react";
import { firebaseDB, timeStamp } from "../config/firebase";
import ReactDOM from "react-dom";
import { AuthContext } from "../context/AuthProvider";
import {
  Card,
  CardHeader,
  CardActions,
  CardContent,
  CardMedia,
  Button,
  makeStyles,
  Typography,
  TextField,
  Avatar,
  Container,
  Modal,
} from "@material-ui/core";
import { Favorite, FavoriteBorder } from "@material-ui/icons";

const VideoPost = (props) => {
  let [user, setUser] = useState(null);
  let [comment, setComment] = useState("");
  let [commentList, setCommentList] = useState([]);
  let [likesCount, setLikesCount] = useState(null);
  let [isLiked, setIsLiked] = useState(false);
  let { currentUser } = useContext(AuthContext);
  let [open, setOpen] = useState(false);
  const [modalStyle] = useState(getModalStyle);
  // { comment , profilePhotoUrl }

  const addCommentToCommentList = async (e) => {
    if (comment.length == 0) return;
    let commentUserName;
    let profilePic;
    // when commenting user and post author user is same
    if (currentUser.uid == user.userId) {
      commentUserName = user.username;
      profilePic = user.profileImageUrl;
    } else {
      let doc = await firebaseDB.collection("users").doc(currentUser.uid).get();
      let user = doc.data();
      commentUserName = user.username;
      profilePic = user.profileImageUrl;
    }
    let newCommentList = [
      ...commentList,
      {
        commentUserName: commentUserName,
        profilePic: profilePic,
        comment: comment,
      },
    ];

    // add comments in firebase
    let postObject = props.postObj;
    postObject.comments.push({ uid: currentUser.uid, comment: comment });
    // it will set a new post object with updated comments in firebase DB
    await firebaseDB.collection("posts").doc(postObject.pid).set(postObject);
    setCommentList(newCommentList);
    setComment("");
  };

  const toggleLikeIcon = async () => {
    if (isLiked) {
      // post liked hai to unlike the post
      // make isLiked = false;
      // in postDoc remove your uid in likes array !
      // setLikesCount(1 ? null : -1);
      let postDoc = props.postObj;
      let filteredLikes = postDoc.likes.filter((uid) => {
        if (uid == currentUser.uid) {
          return false;
        } else {
          return true;
        }
      });
      postDoc.likes = filteredLikes;
      await firebaseDB.collection("posts").doc(postDoc.pid).set(postDoc);
      setIsLiked(false);
      likesCount == 1 ? setLikesCount(null) : setLikesCount(likesCount - 1);
    } else {
      // post liked nhi hai to like the post
      // make isLiked = true;
      // in postDOc add your uid in likes array !
      // setLikesCount( null ? 1 : +1);
      let postDoc = props.postObj;
      postDoc.likes.push(currentUser.uid);
      await firebaseDB.collection("posts").doc(postDoc.pid).set(postDoc);
      setIsLiked(true);
      likesCount == null ? setLikesCount(1) : setLikesCount(likesCount + 1);
    }
  };

  useEffect(async () => {
    // console.log(props);
    let uid = props.postObj.uid;
    let doc = await firebaseDB.collection("users").doc(uid).get();
    let user = doc.data();
    let commentList = props.postObj.comments;
    let likes = props.postObj.likes;
    // {uid , comment} , {uid , comment} , {uid , comment};
    let updatedCommentList = [];

    for (let i = 0; i < commentList.length; i++) {
      let commentObj = commentList[i];
      let doc = await firebaseDB.collection("users").doc(commentObj.uid).get();
      let user = doc.data();
      let commentUserPic = user.profileImageUrl;
      let commentUserName = user.username;
      // console.log(commentUserName);
      updatedCommentList.push({
        commentUserName: commentUserName,
        profilePic: commentUserPic,
        comment: commentObj.comment,
      });
    }

    if (likes.includes(currentUser.uid)) {
      setIsLiked(true);
      setLikesCount(likes.length);
    } else {
      if (likes.length) {
        setLikesCount(likes.length);
      }
    }

    // console.log(updatedCommentList);
    setUser(user);
    setCommentList(updatedCommentList);
  }, []); //comp did Mount

  let useStyles = makeStyles((theme) => ({
    card: {
      // height: "80vh",
      width: "350px",
      margin: "auto",
      padding: "10px",
      marginBottom: "20px",
    },
    videoContainerSize: {
      height: "50%",
    },
    centerDiv: {
      display: "flex",
      alignItems: "center",
      marginTop: "0.5rem",
      marginBottom: "0.5rem",
    },
    marginleft: {
      marginLeft: "5px",
    },
    marginleft2: {
      marginLeft: "10px",
    },
    bold: {
      marginLeft: "5px",
      fontWeight: "bold",
    },
    paper: {
      position: "absolute",
      width: 400,
      height: 500,
      backgroundColor: theme.palette.background.paper,
      border: "2px solid #000",
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
      overflow: "auto",
    },
  }));
  let classes = useStyles();

  function getModalStyle() {
    const top = 90;
    const left = 90;

    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    };
  }

  return (
    <Container>
      <Card className={classes.card}>
        <div className={classes.centerDiv}>
          <Avatar src={user ? user.profileImageUrl : ""}></Avatar>
          <Button className={classes.marginleft2}>
            {user ? user.username : ""}
          </Button>
        </div>

        <div className="video-container">
          <Video
            className={classes.videoContainerSize}
            src={props.postObj.videoLink}
          ></Video>
        </div>

        <div className={classes.centerDiv}>
          <>
            {isLiked ? (
              <Favorite
                onClick={() => toggleLikeIcon()}
                style={{ color: "red" }}
              ></Favorite>
            ) : (
              <FavoriteBorder onClick={() => toggleLikeIcon()}></FavoriteBorder>
            )}
          </>

          {likesCount && (
            <>
              <Typography variant="p" className={classes.marginleft}>
                {likesCount} {likesCount === 1 ? ` Like` : ` Likes`}
              </Typography>
            </>
          )}
        </div>

        <Typography variant="div">
          {commentList.length == 0 ? `No` : commentList.length}{" "}
          {commentList.length == 1 ? ` Comment` : `Comments`}
        </Typography>
        <div className={classes.centerDiv}>
          <TextField
            variant="outlined"
            label="Add a comment"
            size="small"
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
            }}
          ></TextField>
          <Button
            variant="outlined"
            color="secondary"
            onClick={addCommentToCommentList}
            className={classes.marginleft}
          >
            Post
          </Button>
        </div>

        <>
          {commentList.slice(0, 4).map((commentObj) => {
            return (
              <div className={classes.centerDiv}>
                <Avatar
                  src={commentObj.profilePic}
                  style={{ width: 20, height: 20 }}
                ></Avatar>
                <br />
                <Typography variant="p" className={classes.bold}>
                  {commentObj.commentUserName}
                </Typography>
                <Typography variant="p" className={classes.marginleft2}>
                  {commentObj.comment}
                </Typography>
              </div>
            );
          })}

          <Modal open={open} onClose={() => setOpen(false)}>
            <div style={modalStyle} className={classes.paper}>
              {commentList.map((commentObj) => {
                return (
                  <div className={classes.centerDiv}>
                    <Avatar
                      src={commentObj.profilePic}
                      style={{ width: 20, height: 20 }}
                    ></Avatar>
                    <br />
                    <Typography variant="p" className={classes.bold}>
                      {commentObj.commentUserName}
                    </Typography>
                    <Typography variant="p" className={classes.marginleft2}>
                      {commentObj.comment}
                    </Typography>
                  </div>
                );
              })}
            </div>
          </Modal>
          <Button onClick={() => setOpen(true)}>View All Comments</Button>
        </>

        {/* {commentList.map((commentObj) => {
          return (
            <div className={classes.centerDiv}>
              <Avatar
                src={commentObj.profilePic}
                style={{ width: 20, height: 20 }}
              ></Avatar>
              <br />
              <Typography variant="p" className={classes.bold}>
                {commentObj.commentUserName}
              </Typography>
              <Typography variant="p" className={classes.marginleft2}>
                {commentObj.comment}
              </Typography>
            </div>
          );
        })} */}
      </Card>
    </Container>
  );
};

function Video(props) {
  const handleAutoScroll = (e) => {
    //   console.log(e);
      let next = ReactDOM.findDOMNode(e.target).parentNode.parentNode.parentNode
        .nextSibling;
      console.log(next);
      if (next) {
        next.scrollIntoView({ behaviour: "smooth" });
        e.target.muted = "true";
      }
  };
  return (
    <video
      style={{
        height: " 100%",
        width: "100%",
      }}
      muted={true}
      onEnded={handleAutoScroll}
      onClick={(e) => {
        console.log(timeStamp());
      }}
    >
      <source src={props.src} type="video/mp4"></source>
    </video>
  );
}

export default VideoPost;
