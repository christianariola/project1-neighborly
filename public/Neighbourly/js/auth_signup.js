// get array from index.html
let sessionString = sessionStorage.getItem('UserInfoHome')
let userSignup = JSON.parse(sessionString);

let autocomplete;
let address1Field;
let postalField;
let lat;
let lng;

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
    console.log('Place:'+place);
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
    document.querySelector("#latitude").value = place.geometry.location.lat();
    // get lng
    document.querySelector("#longitude").value = place.geometry.location.lng();

    //console.log("Latitude: "+lat+" - "+"Longitude: "+lng);
}

const signupBtn = document.getElementById("signupBtn");
const signupForm = document.getElementById("signupForm");

signupBtn.addEventListener("click", (event) => {
    event.preventDefault();

    const firstName = userSignup[0].firstName;
    const lastName = userSignup[0].lastName;
    const email = userSignup[0].email;
    const password = userSignup[0].password;
    const phonenumber = userSignup[0].phonenumber;

    const shipaddress = signupForm.querySelector("#ship-address");
    const locality = signupForm.querySelector("#locality");
    const state = signupForm.querySelector("#state");
    const country = signupForm.querySelector("#country");
    const postcode = signupForm.querySelector("#postcode");
    const latitude = signupForm.querySelector("#latitude");
    const longitude = signupForm.querySelector("#longitude");
 
    db.collection("users").where("email", "==", email)
    .get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            if(doc.data().email === email) {
                // alert('Email already exists, please choose a different one.');
                Toastify({
                    text: 'Email already exists, please choose a different one.',
                    duration: 5000,
                    close: true,
                    gravity: "top", // `top` or `bottom`
                    position: 'center', // `left`, `center` or `right`
                    backgroundColor: "linear-gradient(to right, #00b09b, #70C782)",
                }).showToast();
                return false;
            }
        })
    }).catch(error => {
        console.log("Unable to fetch document", error);
        Toastify({
            text: 'Please try again later.',
            duration: 5000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: 'center', // `left`, `center` or `right`
            backgroundColor: "linear-gradient(to right, #00b09b, #70C782)",
        }).showToast();
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
            //password: password,
            phonenumber: phonenumber,
            address: { street: shipaddress.value, locality: locality.value, state: state.value, country: country.value, postcode: postcode.value },
            location: { latitude: latitude.value, longitude: longitude.value },
            created_at: new Date(),
        }).then(() => {
            // remove array from first page
            sessionStorage.removeItem("UserInfoHome");
            Toastify({
                text: 'You have succesfully registered.',
                duration: 5000,
                close: true,
                gravity: "top", // `top` or `bottom`
                position: 'center', // `left`, `center` or `right`
                backgroundColor: "linear-gradient(to right, #00b09b, #70C782)",
            }).showToast();
            // alert('You have succesfully registered.');
            document.getElementById("signupBtn").disabled = false;

            setTimeout(() => {
                window.location.href = `${BASE_URL}/login.html`;
            }, 1500);
            // window.location.href = `${BASE_URL}/login.html`;
        });
    }).catch(error => {
        Toastify({
            text: 'You are being redirected to signup.',
            duration: 5000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: 'center', // `left`, `center` or `right`
            backgroundColor: "linear-gradient(to right, #00b09b, #70C782)",
        }).showToast();

        setTimeout(() => {
            window.location.href = `${BASE_URL}/index.html`;
        }, 5000);
        
        // alert(error.message);
        // alert(error.code);
        console.log(error);
        document.getElementById("signupBtn").disabled = false;
        return false;
    });
});



function getuserLocation(){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                //console.log(position);
                const pos = {  
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                var locAPI = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+position.coords.latitude+","+position.coords.longitude+"&key=AIzaSyBnwEPQPWFBiXDhX_2pJp-wQdcyoeX_eNQ&sensor=true";
                //console.log("show position: "+locAPI);

                fetch(locAPI).then(function(response) {
                    return response.json();
                }).then(function(data) {
                    console.log(data);

                    document.querySelector("#ship-address").value = data.results[0].address_components[0].long_name+" "+data.results[0].address_components[1].long_name;
                    document.querySelector("#locality").value = data.results[0].address_components[3].long_name;
                    document.querySelector("#state").value = data.results[0].address_components[5].short_name;
                    document.querySelector("#country").value = data.results[0].address_components[6].long_name;
                    document.querySelector("#postcode").value = data.results[0].address_components[7].long_name;
                    document.querySelector("#latitude").value = data.results[0].geometry.location.lat;
                    document.querySelector("#longitude").value = data.results[0].geometry.location.lng;
                }).catch(function() {
                    console.log("Ooops something went wrong.");
                    Toastify({
                        text: 'Please try again later.',
                        duration: 5000,
                        close: true,
                        gravity: "top", // `top` or `bottom`
                        position: 'center', // `left`, `center` or `right`
                        backgroundColor: "linear-gradient(to right, #00b09b, #70C782)",
                    }).showToast();
                });
            },
            () => {
                //handleLocationError(true, infoWindow, map.getCenter());
                console.error("ERROR")
            }
        );
    } else {
        console.log('Browser does not support geolocation.');
        Toastify({
            text: 'Browser does not support geolocation.',
            duration: 5000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: 'center', // `left`, `center` or `right`
            backgroundColor: "linear-gradient(to right, #00b09b, #70C782)",
        }).showToast();
        
    }
}

const getLocation = document.getElementById("getLocation");

getLocation.addEventListener("click", (event) => {
    event.preventDefault();

    getuserLocation();
});
