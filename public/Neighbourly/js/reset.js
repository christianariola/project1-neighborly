import {
    getAuth,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/9.6.7/firebase-auth.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";

const app = initializeApp(firebaseConfig);
const auth = firebase.auth();


const mailField = document.getElementById('email');
// const labels = document.getElementsByTagName('label');
const resetBtn = document.getElementById('resetBtn');
const successModal = document.querySelector('.success');
const failureModal = document.querySelector('.failure');

const fauth = getAuth();

auth.useDeviceLanguage();

const resetPasswordFunction = (e) => {
        e.preventDefault();
        const email = mailField.value;
sendPasswordResetEmail(fauth, email)
    .then(() => {
        console.log('Password Reset Email Sent Successfully!');
        Toastify({
            text: 'Password Reset Email Sent Successfully!',
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: 'center', // `left`, `center` or `right`
            backgroundColor: "linear-gradient(to right, #00b09b, #70C782)",
        }).showToast();
        setTimeout(() => {
            window.location.href = `${BASE_URL}/index.html`;
        }, 4000);
        // failureModal.style.display = 'none';
        // successModal.style.display = 'block';
        
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        failureModal.style.display = 'block';
        let err = "";
        if(errorCode === "auth/user-not-found") {
            err="User not found";
        } else if(errorCode === "auth/invalid-email") {
            err="Invalid email Format";
        }
        else if (errorCode === "auth/missing-email") {
            err="Enter a valid email address";
        }
        Toastify({
            text: err,
            duration: 2000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: 'center', // `left`, `center` or `right`
            backgroundColor: "linear-gradient(to right, #00b09b, #70C782)",
        }).showToast();
        console.log(errorMessage);
    });
};

resetBtn.addEventListener('click', resetPasswordFunction);