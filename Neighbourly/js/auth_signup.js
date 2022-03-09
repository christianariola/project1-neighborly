// get array from index.html
let sessionString = sessionStorage.getItem('UserInfoHome')
let userSignup = JSON.parse(sessionString);

const signupBtn = document.getElementById("signupBtn");

signupBtn.addEventListener("click", (event) => {
    event.preventDefault();
    const phonenumber = document.getElementById("phone_number").value;
    const password = document.getElementById("password").value;

    const firstName = userSignup[0].firstName;
    const lastName = userSignup[0].lastName;
    const postalCode = userSignup[0].postalCode;
    const address = userSignup[0].address;
    const email = userSignup[0].email;
 
    db.collection("users").where("email", "==", email)
    .get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            if(doc.data().email === email) {
                alert('Email already exists, please choose a different one.');
                return false;
            }
        })
    }).catch(error => {
        console.log("Unable to fetch document", error);
    })

    document.getElementById("signupBtn").disabled = true;

    const today = new Date();

    auth.createUserWithEmailAndPassword(email, password)
    .then((userCredentials) => {
        db.collection("users").doc().set({
            userId: userCredentials.user.uid,
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            phonenumber: phonenumber,
            postalCode: postalCode,
            address: address,
            created_at: new Date()
        }).then(() => {
            // remove array from first page
            sessionStorage.removeItem("UserInfoHome");

            alert('You have succesfully registered.');
            document.getElementById("signupBtn").disabled = false;
            window.location.href = "login.html";
        });
    }).catch(error => {
        alert(error.message);
        document.getElementById("signupBtn").disabled = false;
        return false;
    });
});