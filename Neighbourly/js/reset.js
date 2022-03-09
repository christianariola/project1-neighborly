import {
    getAuth,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/9.6.7/firebase-auth.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";

const app = initializeApp(firebaseConfig);
const auth = firebase.auth();


const mailField = document.getElementById('email');
const resetBtn = document.getElementById('resetBtn');
const successModal = document.querySelector('.success');
const failureModal = document.querySelector('.failure');


const fauth = getAuth();

auth.useDeviceLanguage();

const resetPasswordFunction = () => {
        event.preventDefault();
        const email = mailField.value;
sendPasswordResetEmail(fauth, email)
    .then(() => {
        console.log('Password Reset Email Sent Successfully!');
        failureModal.style.display = 'none';
        successModal.style.display = 'block';
        
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        failureModal.style.display = 'block';
        console.log(errorCode);
        console.log(errorMessage);
    });
};

resetBtn.addEventListener('click', resetPasswordFunction);
