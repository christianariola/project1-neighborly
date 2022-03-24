const firebaseConfig = {
  apiKey: "AIzaSyBB9Jml1C-kCtAJZ0PzHmJL6-fobbJdig4",
  authDomain: "team7-8fad9.firebaseapp.com",
  projectId: "team7-8fad9",
  storageBucket: "team7-8fad9.appspot.com",
  messagingSenderId: "1004780029762",
  appId: "1:1004780029762:web:520749c7c8301d6c1faadb",
  measurementId: "G-GWTDFWLMX0"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// make auth and firestore references
const auth = firebase.auth();
const db = firebase.firestore();
const firestore = firebase.firestore;
const storage = firebase.storage();
const BASE_URL = '/Neighbourly'

const dbCollection = (collection, orderBy = 'createdAt') => {
  return db.collection(collection).orderBy(orderBy, 'desc');
};
