let userSignup = [];

class User {
    constructor(firstName, lastName, email, password, phonenumber) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.postalCode = password;
        this.address = phonenumber;
    }
}

// index.html sign up form
const signupHome = document.getElementById("signupHome");

signupHome.addEventListener("submit", function (event) {
    event.preventDefault();
    const fnameInput = signupHome.querySelector("#firstName");
    const lnameInput = signupHome.querySelector("#lastName");
    const email = signupHome.querySelector("#email");
    const password = signupHome.querySelector("#password");
    const phonenumber = signupHome.querySelector("#phone_number");

    const user = new User(fnameInput.value, lnameInput.value, email.value, password.value, phonenumber.value);

    userSignup.push(user);

    sessionStorage.setItem('UserInfoHome', JSON.stringify(userSignup));

    window.location.href = 'signup.html';
});