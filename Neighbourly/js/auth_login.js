const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
    .then((userCredentials) => {
        sessionStorage.setItem("uid", userCredentials.user.uid);
        window.location.href = `${BASE_URL}/dashboard`;
    }).catch((error) => {
        // alert(error.message);
        if(error.code === "auth/wrong-password") {
            err="Wrong password";
        } else if(error.code === "auth/user-not-found") {
            err="User not found";
        } else {
            err="Something went wrong";
        }
        Toastify({
            text: err,
            duration: 2000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: 'center', // `left`, `center` or `right`
            backgroundColor: "linear-gradient(to right, #00b09b, #70C782)",
        }).showToast();
        setTimeout(() => {
            Toastify({
                text: 'You are being redirected to Signup.',
                duration: 3000,
                close: true,
                gravity: "top", // `top` or `bottom`
                position: 'center', // `left`, `center` or `right`
                backgroundColor: "linear-gradient(to right, #00b09b, #70C782)",
            }).showToast();
        }, 1000);
        
        setTimeout(() => {
            window.location.href = `${BASE_URL}/signup.html`;
        }, 5000);
        
        return false;
    })
});