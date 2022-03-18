// Feed

const postCardTemplate = fetch(POST_TEMPLATES.card)
    .then(response => response.text());

createPostBtn.addEventListener('click', () => Post.loadPostSelection());

const buildFeedElements = async (allPosts) => {
    let feedElements = '';
    for(const doc of allPosts.docs) {
        let author;
        const postRaw = doc.data();
        if (!postRaw?.type) return; 
        if (postRaw.author) {
            await db.collection("users").where("userId", "==", postRaw.author).get()
            .then(({ docs }) => {
                const doc = docs[0];
                if (doc?.exists) {
                    const { firstName, lastName, userId } = doc.data();
                    author = { firstName, lastName, userId };
                }
            });
        }
        const post = new POST_CLASSES[postRaw.type]({...postRaw, author });
        const postHTMLString = await Post.toHTMLString(post)
        feedElements += postHTMLString;
    }
    return feedElements;
};

db.collection("posts").onSnapshot(async (querySnapshot) => {
    feed.innerHTML = await buildFeedElements(querySnapshot);
});

let map, infoWindow, ltude, lngtude, rad, zoomLvl;

class Dashboard {
    constructor(userid) {
        this.userid = userid;
    }

    // Get user document
    async getUser(userid) {
        // Make the initial query
        const query = await db.collection('users').where('userId', '==', userid).get();
            if (!query.empty) {
            const snapshot = query.docs[0];
            const data = snapshot.data();

            ltude = snapshot.data().location.latitude;
            lngtude = snapshot.data().location.longitude;
            rad = 5000;
            zoomLvl = 12;
            initMap(snapshot.data().location.latitude, snapshot.data().location.longitude, rad, zoomLvl);
        } else {
            alert('Sorry no document found.')
        }
    }

    

}

// retriving info
auth.onAuthStateChanged(user => {
    if (user) {
        const dashboard = new Dashboard;
        dashboard.getUser(user.uid);
    }
    else {
      console.log('user is not signed in to retrive document');
    }
})

// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.



// Update the current slider value (each time you drag the slider handle)
let slider = document.getElementById("myRange");
let outputKM = document.getElementById("radiusKm");
slider.oninput = function() {

    rad = this.value*1000;
    console.log("TEST "+this.value);

    if(this.value == 5){
        zoomLvl = 12;
    } else if(this.value == 4) {
        zoomLvl = 13;
    } else if(this.value == 3) {
        zoomLvl = 14;
    } else if(this.value == 2) {
        zoomLvl = 14;
    } else if(this.value == 1) {
        zoomLvl = 14;
    } else {
        zoomLvl = 12;
    }

    console.log("TEST "+zoomLvl);

    initMap(ltude, lngtude, rad, zoomLvl);

    outputKM.innerHTML = this.value;
}


function initMap(latitude, longitude, rad, zoomLvl) {

    let lati = parseFloat(latitude);
    let long = parseFloat(longitude);
    let latlng = new google.maps.LatLng(lati, long);

    console.log("RAD: "+rad);
    console.log("ZOOM: "+zoomLvl);

    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 49.22493043847068, lng: -123.10865688997087 },
        zoom: zoomLvl,
    });
    let image = 'http://www.google.com/intl/en_us/mapfiles/ms/micons/red-dot.png';

    infoWindow = new google.maps.InfoWindow();

    const locationButton = document.createElement("button");

    var circle = new google.maps.Circle({
        center: { lat: lati, lng: long },
        map: map,
        radius: rad,          // IN METERS.
        fillColor: '#009C4E',
        fillOpacity: 0.3,
        strokeColor: "#077740",
        strokeWeight: 0         // DON'T SHOW CIRCLE BORDER.
    });

    // Try HTML5 geolocation.
    // if (navigator.geolocation) {
    // navigator.geolocation.getCurrentPosition(
    //     (position) => {
        //console.log($latitude);
        const pos = {
            // lat: position.coords.latitude,
            // lng: position.coords.longitude,
            lat: lati,
            lng: long,
        };


        marker = new google.maps.Marker({
            position: latlng,
            map: map,
            icon: image
        });

        marker.setIcon(image);
        //infoWindow.setContent("Your Location");
        infoWindow.open(map);

        new google.maps.LatLng(lati, long)
        map.setCenter(pos);
        // },
        // () => {
        // handleLocationError(true, infoWindow, map.getCenter());
        // }
    // );
    // } else {
    // // Browser doesn't support Geolocation
    // handleLocationError(false, infoWindow, map.getCenter());
    // }
    
}














function handleLocationError(browserHasGeolocation, infoWindow, pos) {
infoWindow.setPosition(pos);
infoWindow.setContent(
    browserHasGeolocation
    ? "Error: The Geolocation service failed."
    : "Error: Your browser doesn't support geolocation."
);
infoWindow.open(map);
}

// Logout
const logout = document.querySelector('#logout');

logout.addEventListener('click', (e) => {
    e.preventDefault();

    auth.signOut().then(() => { 
        sessionStorage.removeItem("uid");
        alert('You have succesfully logout.');
        console.log('user signed out');
        window.location.href = `${BASE_URL}/index.html`;
    }).catch(error => {
        alert(error.message);
        return false;
    });

    return false;
})
