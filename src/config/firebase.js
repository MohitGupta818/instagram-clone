import firebase from "firebase";

// const firebaseConfig = {
//   apiKey: "AIzaSyBtgArIUQ4MGungbEYayEcNoo-eqvJI64o",
//   authDomain: "instagram-50c48.firebaseapp.com",
//   projectId: "instagram-50c48",
//   storageBucket: "instagram-50c48.appspot.com",
//   messagingSenderId: "141388806774",
//   appId: "1:141388806774:web:83aec80b26c2aee607bd57",
// };

const firebaseConfig = {
  apiKey: "AIzaSyCrZukODxCQMd5kV79us3DYplbtZBilMhw",
  authDomain: "react-login-edaec.firebaseapp.com",
  projectId: "react-login-edaec",
  storageBucket: "react-login-edaec.appspot.com",
  messagingSenderId: "235778037161",
  appId: "1:235778037161:web:255ecef3f394f306d6a0b8"
};

let firebaseApp = firebase.initializeApp(firebaseConfig);
export let firebaseAuth = firebaseApp.auth();
export let firebaseStorage = firebaseApp.storage();
export let firebaseDB = firebaseApp.firestore();
export let timeStamp = firebase.firestore.FieldValue.serverTimestamp;