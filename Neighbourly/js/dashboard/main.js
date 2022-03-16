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

// Logout
const logout = document.querySelector('#logout');

// Get user document
async function getUser(userid) {
    // Make the initial query
    const query = await db.collection('users').where('userId', '==', userid).get();
        if (!query.empty) {
        const snapshot = query.docs[0];
        const data = snapshot.data();

        //console.log(snapshot.data().location.latitude);
        initMap(snapshot.data().location.latitude, snapshot.data().location.longitude);

    } else {
        alert('Sorry no document found.')
    }

}

// retriving info
auth.onAuthStateChanged(user => {
    if (user) {
      const userinfo = getUser(user.uid);
    }
    else {
      console.log('user is not signed in to retrive document');
    }
})

// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.
let map, infoWindow;

function initMap($latitude, $longitude) {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 49.22493043847068, lng: -123.10865688997087 },
        zoom: 15,
    });
    infoWindow = new google.maps.InfoWindow();

    const locationButton = document.createElement("button");

    var circle = new google.maps.Circle({
        center: { lat: $latitude, lng: $longitude },
        map: map,
        radius: 600,          // IN METERS.
        fillColor: '#009C4E',
        fillOpacity: 0.3,
        strokeColor: "#FFF",
        strokeWeight: 0         // DON'T SHOW CIRCLE BORDER.
    });

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
        //console.log($latitude);
        const pos = {
            // lat: position.coords.latitude,
            // lng: position.coords.longitude,
            lat: parseFloat($latitude),
            lng: parseFloat($longitude),
        };

        infoWindow.setPosition(pos);
        infoWindow.setContent("Your Location");
        infoWindow.open(map);
        map.setCenter(pos);
        },
        () => {
        handleLocationError(true, infoWindow, map.getCenter());
        }
    );
    } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
    }
    
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


logout.addEventListener('click', (e) => {
    e.preventDefault();

    auth.signOut().then(() => { 
        sessionStorage.removeItem("uid");
        alert('You have succesfully logout.');
        console.log('user signed out');
        window.location.href = "/index.html";
    }).catch(error => {
        alert(error.message);
        return false;
    });

    return false;
})
