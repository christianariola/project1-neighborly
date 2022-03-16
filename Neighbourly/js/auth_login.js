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
        alert(error.message);
        return false;
    })
});