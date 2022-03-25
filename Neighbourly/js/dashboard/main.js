// Feed

const postCardTemplate = fetch(POST_TEMPLATES.card)
    .then(response => response.text());

createPostBtn.addEventListener('click', () => Post.loadPostSelection());

const populateFeed = async (allPosts) => {
    feed.innerHTML = '';
    for(const doc of allPosts.docs) {
        let author;
        let replies = [];
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

        for(const postReply of (postRaw.replies || [])) {
            let replyAuthor;
            await db.collection("users").where("userId", "==", postReply.author).get()
            .then(({ docs }) => {
                const doc = docs[0];
                if (doc?.exists) {
                    const { firstName, lastName, userId } = doc.data();
                    replyAuthor = { firstName, lastName, userId };
                }
                replies.push(new Reply({ ...postReply, author: replyAuthor }));
            });
        }

        const post = new POST_CLASSES[postRaw.type]({...postRaw, author, replies, id:doc.id });
        const postHTMLElement = await Post.toHTMLElement(post)
        feed.appendChild(postHTMLElement);
    }
};

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
            const nearList = [];
            const uids = [];

            ltude = snapshot.data().location.latitude;
            lngtude = snapshot.data().location.longitude;
            rad = 5000;
            zoomLvl = 12;

            //get list of users with the same locality and state
            const usersCollectionRef = db.collection('users')
            const usersQuery = usersCollectionRef.where('address.locality', '==', snapshot.data().address.locality).where('userId', '!=', userid);
            const usersSnapshot = await usersQuery.get();

            usersSnapshot.forEach(doc => {
                uids.push(doc.data());
                //console.log("ADDRESS: "+doc.data().userId);
            });


            const postsRef = db.collection('posts');
            for (const uid of uids) {
                let postRef = postsRef.where('author', '==', uid.userId);
                let postSnapshot = await postRef.get();

                let checkPoint = { lat: uid.location.latitude, lng: uid.location.longitude };
                let centerPoint = { lat: snapshot.data().location.latitude, lng: snapshot.data().location.longitude};
                //check if nearby users lat lng is near logged in user
                let checker = arePointsNear(checkPoint, centerPoint, rad)


                if(checker) {
                    postSnapshot.forEach(postdoc => {
                        let postData = {postInfo: postdoc.data(), location: checkPoint }
                        nearList.push(postData);
                    });
                }

            }

            initMap(snapshot.data().location.latitude, snapshot.data().location.longitude, rad, zoomLvl, nearList);
        } else {
            // alert('Sorry no document found.')
            Toastify({
                text: "Sorry no document found.",
                duration: 3000,
                newWindow: true,
                close: true,
                gravity: "top", // `top` or `bottom`
                position: 'center', // `left`, `center` or `right`
                backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
                stopOnFocus: true, // Prevents dismissing of toast on hover
            }).showToast();
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

// Update the current slider value (each time you drag the slider handle)
let slider = document.getElementById("myRange");
let outputKM = document.getElementById("radiusKm");
slider.oninput = function() {

    rad = this.value*1000;
    console.log("TEST "+this.value);

    if(this.value == 5){
        zoomLvl = 12;
    } else if(this.value == 4) {
        zoomLvl = 12.6;
    } else if(this.value == 3) {
        zoomLvl = 13.1;
    } else if(this.value == 2) {
        zoomLvl = 13.8;
    } else if(this.value == 1) {
        zoomLvl = 13.8;
    } else {
        zoomLvl = 12;
    }

    console.log("TEST "+zoomLvl);

    initMap(ltude, lngtude, rad, zoomLvl);

    outputKM.innerHTML = this.value;
}

// Calculation if coords is inside radius
function arePointsNear(marker, circle, radius) {
    // var ky = 40000 / 360;
    // var kx = Math.cos(Math.PI * centerPoint.lat / 180.0) * ky;
    // var dx = Math.abs(centerPoint.lng - checkPoint.lng) * kx;
    // var dy = Math.abs(centerPoint.lat - checkPoint.lat) * ky;
    // return Math.sqrt(dx * dx + dy * dy) <= km;

    var km = radius/1000;
    var kx = Math.cos(Math.PI * circle.lat / 180) * 111;
    var dx = Math.abs(circle.lng - marker.lng) * kx;
    var dy = Math.abs(circle.lat - marker.lat) * 111;
    return Math.sqrt(dx * dx + dy * dy) <= km;
}

function initMap(latitude, longitude, rad, zoomLvl, nearList) {

    let lati = parseFloat(latitude);
    let long = parseFloat(longitude);
    let latlng = new google.maps.LatLng(lati, long);

    // console.log("RAD: "+rad);
    // console.log("ZOOM: "+zoomLvl);

    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 49.22493043847068, lng: -123.10865688997087 },
        zoom: zoomLvl,
        disableDefaultUI: true,
    });
    let image = 'http://www.google.com/intl/en_us/mapfiles/ms/micons/red-dot.png';
    let image2 = 'http://www.google.com/intl/en_us/mapfiles/ms/micons/green-dot.png';

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

    const pos = {
        lat: lati,
        lng: long,
    };

    marker = new google.maps.Marker({
        position: latlng,
        map: map,
        icon: image
    });

    // using for...in
    for (let key in nearList) {
        let value;

        // get the value
        value = nearList[key].location.lat;

        console.log(key + " - " +  value);

        nearbyLoc = new google.maps.LatLng(nearList[key].location.lat, nearList[key].location.lng);

        new google.maps.Marker({
            position: nearbyLoc,
            title: 'Location',
            map: map,
            icon: image2
        });
    }



    //marker.setIcon(image);
    infoWindow.setContent("Your Location");
    infoWindow.open(map);

    new google.maps.LatLng(lati, long)
    map.setCenter(pos);
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
        // alert('You have succesfully logout.');
        Toastify({
            text: "You have succesfully logged out.",
            duration: 2000,
            newWindow: true,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: 'center', // `left`, `center` or `right`
            backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
            stopOnFocus: true, // Prevents dismissing of toast on hover
        }).showToast();
        setTimeout(() => {
            window.location.href = `${BASE_URL}/index.html`;
        }, 3000);
        console.log('user signed out');
    }).catch(error => {
        alert(error.message);
        return false;
    });

    return false;
})
