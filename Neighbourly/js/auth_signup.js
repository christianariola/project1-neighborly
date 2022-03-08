// get array from index.html
let sessionString = sessionStorage.getItem('UserInfoHome')
let userSignup = JSON.parse(sessionString);

let autocomplete;
let address1Field;
let postalField;

function initAutocomplete() {
    address1Field = document.querySelector("#ship-address");
    postalField = document.querySelector("#postcode");
    // Create the autocomplete object, restricting the search predictions to
    // addresses in the US and Canada.
    autocomplete = new google.maps.places.Autocomplete(address1Field, {
        componentRestrictions: { country: ["ca"] },
        fields: ["address_components", "geometry"],
        types: ["address"],
    });
    address1Field.focus();
    // When the user selects an address from the drop-down, populate the
    // address fields in the form.

    autocomplete.addListener("place_changed", fillInAddress);
}

function fillInAddress() {
    // Get the place details from the autocomplete object.
    const place = autocomplete.getPlace();
    let address1 = "";
    let postcode = "";

    // Get each component of the address from the place details,
    // and then fill-in the corresponding field on the form.
    // place.address_components are google.maps.GeocoderAddressComponent objects
    // which are documented at http://goo.gle/3l5i5Mr
    for (const component of place.address_components) {
    const componentType = component.types[0];

    switch (componentType) {
        case "street_number": {
        address1 = `${component.long_name} ${address1}`;
        break;
        }

        case "route": {
        address1 += component.short_name;
        break;
        }

        case "postal_code": {
        postcode = `${component.long_name}${postcode}`;
        break;
        }

        case "postal_code_suffix": {
        postcode = `${postcode}-${component.long_name}`;
        break;
        }
        case "locality":
        document.querySelector("#locality").value = component.long_name;
        break;
        case "administrative_area_level_1": {
        document.querySelector("#state").value = component.short_name;
        break;
        }
        case "country":
        document.querySelector("#country").value = component.long_name;
        break;
    }
    }

    address1Field.value = address1;
    postalField.value = postcode;

    // get lat
    var lat = place.geometry.location.lat();
    // get lng
    var lng = place.geometry.location.lng();

    console.log("Latitude: "+lat+" - "+"Longitude: "+lng);
}

const signupBtn = document.getElementById("signupBtn");

signupBtn.addEventListener("click", (event) => {
    event.preventDefault();

    const firstName = userSignup[0].firstName;
    const lastName = userSignup[0].lastName;
    const email = userSignup[0].email;
    const password = userSignup[0].password;
    const phonenumber = userSignup[0].phonenumber;

    const locality = document.querySelector("#locality");
    const state = document.querySelector("#state");
    const country = document.querySelector("#country");
 
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
            // address: { address1: address1Field, locality: locality, state: state, country: country, postcode: postalField },
            // location: { latitude: lat, longitude: lng },
            // created_at: new Date(),
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