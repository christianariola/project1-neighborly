let userSignup = [];

class User {
    constructor(firstName, lastName, postalCode, address, email) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.postalCode = postalCode;
        this.address = address;
        this.email = email;
    }
}

// index.html sign up form
const signupHome = document.getElementById("signupHome");

signupHome.addEventListener("submit", function (event) {
    event.preventDefault();
    const fnameInput = signupHome.querySelector("#firstName");
    const lnameInput = signupHome.querySelector("#lastName");
    const postalInput = signupHome.querySelector("#postalCode");
    const address = signupHome.querySelector("#address");
    const email = signupHome.querySelector("#email");

    const user = new User(fnameInput.value, lnameInput.value, postalInput.value, address.value, email.value);

    userSignup.push(user);

    sessionStorage.setItem('UserInfoHome', JSON.stringify(userSignup));

    window.location.href = 'signup.html';

});