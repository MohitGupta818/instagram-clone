import React, { useState, useContext } from "react";
import { firebaseDB, firebaseStorage } from "../config/firebase";
import { AuthContext } from "../context/AuthProvider";
import { Link } from "react-router-dom";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import logo from "../logo.png";
import {
  TextField,
  Grid,
  Button,
  Paper,
  Card,
  CardContent,
  CardActions,
  Container,
  CardMedia,
  Typography,
  makeStyles,
} from "@material-ui/core";

const Signup = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [message, setMessage] = useState("");
  const { signUp } = useContext(AuthContext);

  const handleFileSubmit = (e) => {
    let fileObject = e.target.files[0];
    setProfileImage(fileObject);
  };

  const handleSignup = async (e) => {
    try {
      let response = await signUp(email, password);
      let uid = response.user.uid;
      const uploadPhotoObject = firebaseStorage
        .ref(`/profilePhotos/${uid}/image.jpg`)
        .put(profileImage);

      uploadPhotoObject.on("state_changed", fun1, fun2, fun3);

      // to track progress of upload
      function fun1(snapshot) {
        // bytes transferred
        // total bytes
        let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(progress);
      }

      // it indicates error
      function fun2(error) {
        console.log(error);
      }

      // it indicates success of upload
      async function fun3() {
        let profileImageUrl =
          await uploadPhotoObject.snapshot.ref.getDownloadURL();
        console.log(profileImageUrl);

        // db mai collection => document => {username, email, profileImageUrl}
        firebaseDB.collection("users").doc(uid).set({
          email: email,
          userId: uid,
          username: username,
          profileImageUrl: profileImageUrl,
          postsCreated: [],
        });
      }

      props.history.push("/");
    } catch (err) {
      setMessage(err.message);
      // setUsername("");
      // setEmail("");
      // setPassword("");
      // setProfileImage(null);
    }
  };

  let useStyles = makeStyles({
    centerDivs: {
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      width: "100vw",
    },
    carousal: { height: "10rem", backgroundColor: "lightgray" },
    fullWidth: {
      width: "100%",
    },
    centerElements: {
      display: "flex",
      flexDirection: "column",
    },
    mb: {
      marginBottom: "1rem",
    },
    padding: {
      paddingTop: "1rem",
      paddingBottom: "1rem",
    },
    alignCenter: {
      justifyContent: "center",
    },
    margintop : {
      marginTop: "80px"
    }
  });
  let classes = useStyles();

  return (
    <div>
      <Container className={classes.margintop}>
        <Grid container spacing={2} style={{ justifyContent: "space-around" }}>
          {/* Carousel */}
          {/* <Grid item sm={5}>
            <CardMedia
              component="img"
              height="540"
              image="mobile.jpg"
              alt="instagram"
            />
          </Grid> */}

          <Grid item sm={3}>
            <Card variant="outlined" className={classes.mb}>
              <CardMedia
                image={logo}
                style={{ height: "5rem", backgroundSize: "contain" }}
              ></CardMedia>

              <CardContent className={classes.centerElements}>
                <TextField
                  label="Username"
                  type="text"
                  variant="outlined"
                  value={username}
                  size="small"
                  onChange={(e) => setUsername(e.target.value)}
                  className={classes.mb}
                ></TextField>

                <TextField
                  label="Email"
                  type="email"
                  variant="outlined"
                  value={email}
                  size="small"
                  onChange={(e) => setEmail(e.target.value)}
                  className={classes.mb}
                ></TextField>

                <TextField
                  label="Password"
                  type="password"
                  variant="outlined"
                  value={password}
                  size="small"
                  onChange={(e) => setPassword(e.target.value)}
                  className={classes.mb}
                ></TextField>

                <Button
                  variant="outlined"
                  color="secondary"
                  component="label"
                  startIcon={<CloudUploadIcon></CloudUploadIcon>}
                >
                  Upload Profile Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      handleFileSubmit(e);
                    }}
                  />
                </Button>
              </CardContent>

              <CardActions>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSignup}
                  className={classes.fullWidth}
                >
                  Signup
                </Button>
              </CardActions>
            </Card>
            <Card variant="outlined" className={classes.padding}>
              <Typography style={{ textAlign: "center" }}>
                Have an account?{` `}
                {/* <Button variant="contained" color="primary"> */}
                <Link style={{ color: "primary" }} to="/login">
                  Login
                </Link>
                {/* </Button> */}
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* <h1>Signup Page</h1>

      <div>
        Username
        <input
          type="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
        Profile Image
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            handleFileSubmit(e);
          }}
        />
      </div>

      <button onClick={handleSignup}>Signup</button>
      <h2 style={{ color: "red" }}>{message}</h2>*/}
    </div>
  );
};

export default Signup;
