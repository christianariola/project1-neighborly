// Feed
const postCardTemplate = fetch(POST_TEMPLATES.card)
    .then(response => response.text());

let feedHasBeenPopulated = false;

createPostInput.addEventListener('click', () => Post.loadPostSelection());
document.querySelector('.create-post-avatar img').src = `https://i.pravatar.cc/150?u=${sessionStorage.getItem("uid")}`;

const populateFeed = async (allPosts) => {
    const postMethodHandler = feedHasBeenPopulated ? Post.updatePostCard : Post.addNewPostCardToFeed;
    feedHasBeenPopulated = true;
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
                const reply = new Reply({ ...postReply, author: replyAuthor });
                replies.push(reply);
            });
        }

        const post = new POST_CLASSES[postRaw.type]({...postRaw, author, replies, id: postRaw.id, docId: doc.id  });
        await postMethodHandler(post);
    }
};


// MAP ======================================================================

let map, infoWindow, ltude, lngtude, rad, zoomLvl, userIdent;
const nearList = [];
const uids = [];
// const userIdent = sessionStorage.getItem("uid");

class Dashboard {
    constructor(userid, rad, zoomLvl) {
        this.userid = userid;
        this.rad = rad;
        this.zoomLvl = zoomLvl;
    }

    // Get user document
    async getUser(userid, rad, zoomLvl) {
        uids.length = 0;
        nearList.length = 0;
        try {
            this.showSpinner();
            nearList.length = 0
            uids.length = 0
            // Make the initial query
            const query = await db.collection('users').where('userId', '==', userid).get();
                if (!query.empty) {
                const snapshot = query.docs[0];
                const data = snapshot.data();

                ltude = snapshot.data().location.latitude;
                lngtude = snapshot.data().location.longitude;

                createPostInput.setAttribute('placeholder', `Hi${data.firstName ? ` ${data.firstName}`: ''}, what is happening in your neighborhood?`)

                if(rad == null){
                    rad = 5000;
                } else {
                    rad = rad;
                }

                if(zoomLvl == null){
                    zoomLvl = 12;
                } else {
                    zoomLvl = zoomLvl;
                }

                //console.log(rad);

                //get list of users with the same locality and state
                const usersCollectionRef = db.collection('users');
                // const usersQuery = usersCollectionRef.where('address.locality', '==', snapshot.data().address.locality).where('userId', '!=', userid);
                const usersQuery = usersCollectionRef.where('userId', '!=', userid);
                const usersSnapshot = await usersQuery.get();

                usersSnapshot.forEach(doc => {
                    uids.push(doc.data());
                    //console.log("ADDRESS: "+doc.data().userId);
                });

                const postsRef = db.collection('posts');
                for (const uid of uids) {


                    // let userData = { };
                    let checkPoint = { lat: uid.location.latitude, lng: uid.location.longitude };
                    let centerPoint = { lat: snapshot.data().location.latitude, lng: snapshot.data().location.longitude};
                    //check if nearby users lat lng is near logged in user
                    let checker = this.arePointsNear(checkPoint, centerPoint, rad)


                    if(checker) {


                        let postRef = postsRef.where('author', '==', uid.userId);
                        let postSnapshot = await postRef.get();

                        postSnapshot.forEach(postdoc => {
                            let postData = {postInfo: postdoc.data(), location: checkPoint }
                            nearList.push(postData);
                        });
                    }
                }

                console.log("CHECKER: "+nearList.length);

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
                    backgroundColor: "linear-gradient(to right, #00b09b, #70C782)",
                    stopOnFocus: true, // Prevents dismissing of toast on hover
                }).showToast();
            }

        } catch (err) {
            console.error(err);
        } finally {
            this.hideSpinner();
        }
    }

    showSpinner() {
        document.querySelector('#loader').style.display='block';
    }

    hideSpinner() {
        document.querySelector('#loader').style.display='none';
    }

    arePointsNear(marker, circle, radius) {
        var km = radius/1000;
        var kx = Math.cos(Math.PI * circle.lat / 180) * 111;
        var dx = Math.abs(circle.lng - marker.lng) * kx;
        var dy = Math.abs(circle.lat - marker.lat) * 111;
        return Math.sqrt(dx * dx + dy * dy) <= km;
    }


}

// retriving info
auth.onAuthStateChanged(user => {
    if (user) {
        const dashboard = new Dashboard;
        userIdent = user.uid;
        dashboard.getUser(user.uid, null, null);
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
    //console.log("TEST "+this.value);

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

    //console.log("TEST "+rad);

    const dashboard2 = new Dashboard;
    dashboard2.getUser(userIdent, rad, zoomLvl);

    //initMap(ltude, lngtude, rad, zoomLvl);

    outputKM.innerHTML = this.value;
}

// Calculation if coords is inside radius
// function arePointsNear(marker, circle, radius) {
//     var km = radius/1000;
//     var kx = Math.cos(Math.PI * circle.lat / 180) * 111;
//     var dx = Math.abs(circle.lng - marker.lng) * kx;
//     var dy = Math.abs(circle.lat - marker.lat) * 111;
//     return Math.sqrt(dx * dx + dy * dy) <= km;
// }

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
    let image = '../../Neighbourly/images/markers/home-icon.png';
    let image2 = 'http://www.google.com/intl/en_us/mapfiles/ms/micons/red-dot.png';

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

    // USER LOCATION MARKER AND INFO ==========================================

    const contentString =
    '<div id="content">' +
    '<div id="siteNotice">' +
    "</div>" +
    '<div id="bodyContent">' +
    "<p>Your Location</p> " +
    "</div>" +
    "</div>";

    const infowindow = new google.maps.InfoWindow({
        content: contentString,
    });
    const marker = new google.maps.Marker({
        position: latlng,
        map,
        icon: image,
        title: "You Location",
    });

    marker.addListener("click", () => {
        infowindow.open({
            anchor: marker,
            map,
            shouldFocus: false,
        });
    });



    let cnt = 0;
    let infowindows = [];
    let mark = [];
    let bounds = new google.maps.LatLngBounds();
    let postmarker;


    // // Group post by author
    let nearbyPosts = nearList.reduce((r, a) => {
        // console.log("a", a.postInfo.author);
        // console.log('r', r);
        r[a.postInfo.author] = [...r[a.postInfo.author] || [], a];
        return r;
    }, {});

    for (let postskey in nearbyPosts) {
        if(nearbyPosts[postskey].length > 1) {
            let userPost = [];
            for (let postkey in nearbyPosts[postskey]) {
                userPost += '<div id="siteNotice">';
                userPost += '<h4>'+ nearbyPosts[postskey][postkey].postInfo.title +'</h4>';
                userPost += '<p class="post-createdAt">'+ dbTimestampToDate(nearbyPosts[postskey][postkey].postInfo.createdAt).toString().substring(0, 25) +'</p>';
                // chantest += '<div id="bodyContent"><p class="post-popup-type">Type: <span>' + nearbyPosts[postskey][postkey].postInfo.type + '</span></p>';
                userPost += '<div><a href="#'+nearbyPosts[postskey][postkey].postInfo.id+'">View Post</a></div></div>';
            }
            // console.log("CHANS: "+chantest);

            let temppos = new google.maps.LatLng(nearbyPosts[postskey][0].location.lat, nearbyPosts[postskey][0].location.lng);
        
            const postContent =
            '<div id="content">' +
            // '<div id="siteNotice">' +
            userPost +
            // '<h4>'+ nearbyPosts[postskey][postkey].postInfo.title +'</h4>' +
            // '<p class="post-createdAt">'+ dbTimestampToDate(nearbyPosts[postskey][postkey].postInfo.createdAt).toString().substring(0, 25) +'</p>' +
            // '<div id="bodyContent">' +
            // '<p class="post-popup-type">Type: <span>' + nearbyPosts[postskey][postkey].postInfo.type + '</span></p>' +
            // '<div><a href="#!">View Post</a></div>' +
            // "</div>" +
            // "</div>" +
            "</div>";

            infowindows[cnt] = new google.maps.InfoWindow({
                content: postContent,
                //maxWidth: 200
            });

            postmarker = '../../Neighbourly/images/markers/multiple-icon.png';

            mark[cnt] = new google.maps.Marker({
                position: temppos,
                map: map,
                animation:google.maps.Animation.DROP,
                icon: postmarker
            });

            google.maps.event.addListener(mark[cnt], 'click', (function(markerrr, cnt) {
                return function() {
                    infowindows[cnt].open(map, mark[cnt]);
                }
            })(mark[cnt], cnt));

            bounds.extend(mark[cnt].getPosition());

        } else {
            //console.log("equal 1");
            for (let singlepostkey in nearbyPosts[postskey]) {
                let temppos = new google.maps.LatLng(nearbyPosts[postskey][singlepostkey].location.lat, nearbyPosts[postskey][singlepostkey].location.lng);
            
                const postContent =
                '<div id="content">' +
                '<div id="siteNotice">' +
                "</div>" +
                '<h4>'+ nearbyPosts[postskey][singlepostkey].postInfo.title +'</h4>' +
                '<p class="post-createdAt">'+ dbTimestampToDate(nearbyPosts[postskey][singlepostkey].postInfo.createdAt).toString().substring(0, 25) +'</p>' +
                '<div id="bodyContent">' +
                '<p class="post-popup-type">Type: <span>' + nearbyPosts[postskey][singlepostkey].postInfo.type + '</span></p>' +
                '<div><a href="#'+nearbyPosts[postskey][singlepostkey].postInfo.id+'">View Post</a></div>' +
                "</div>" +
                "</div>";

                infowindows[cnt] = new google.maps.InfoWindow({
                    content: postContent,
                    //maxWidth: 200
                });

                switch(nearbyPosts[postskey][singlepostkey].postInfo.type) {
                    case "recommendation":
                        postmarker = '../../Neighbourly/images/markers/recommendation-icon.png';
                    break;
                    case "help_request":
                        postmarker = '../../Neighbourly/images/markers/help-request-icon.png';
                    break;
                    case "giveaway":
                        postmarker = '../../Neighbourly/images/markers/giveaway-icon.png';
                    break;
                    default:
                        postmarker = '../../Neighbourly/images/markers/home-icon.png';
                }

                mark[cnt] = new google.maps.Marker({
                    position: temppos,
                    map: map,
                    animation:google.maps.Animation.DROP,
                    icon: postmarker
                });

                google.maps.event.addListener(mark[cnt], 'click', (function(markerrr, cnt) {
                    return function() {
                        infowindows[cnt].open(map, mark[cnt]);
                    }
                })(mark[cnt], cnt));

                bounds.extend(mark[cnt].getPosition());
            }


        }

        cnt++;
    }




    // for (let key in nearList) {
    //     // skip loop if the property is from prototype
    //     //if(!obj.hasOwnProperty(prop)) continue;

    //     let temppos = new google.maps.LatLng(nearList[key].location.lat, nearList[key].location.lng);

    //     const postContent =
    //     '<div id="content">' +
    //     '<div id="siteNotice">' +
    //     "</div>" +
    //     '<h4>'+ nearList[key].postInfo.title +'</h4>' +
    //     '<p class="post-createdAt">'+ dbTimestampToDate(nearList[key].postInfo.createdAt).toString().substring(0, 25) +'</p>' +
    //     '<div id="bodyContent">' +
    //     '<p>' + nearList[key].postInfo.description + '</p>' +
    //     '<p class="post-popup-type">Type: <span>' + nearList[key].postInfo.type + '</span></p>' +
    //     '<div><a href="#!">View Post</a></div>' +
    //     "</div>" +
    //     "</div>";

    //     infowindows[cnt] = new google.maps.InfoWindow({
    //         content: postContent,
    //         //maxWidth: 200
    //     });

    //     switch(nearList[key].postInfo.type) {
    //         case "recommendation":
    //             postmarker = '../../Neighbourly/images/markers/recommendation-icon.png';
    //         break;
    //         case "help_request":
    //             postmarker = '../../Neighbourly/images/markers/help-request-icon.png';
    //         break;
    //         case "giveaway":
    //             postmarker = '../../Neighbourly/images/markers/giveaway-icon.png';
    //         break;
    //         default:
    //             postmarker = 'http://www.google.com/intl/en_us/mapfiles/ms/micons/green-dot.png';
    //     }

    //     mark[cnt] = new google.maps.Marker({
    //         position: temppos,
    //         map: map,
    //         animation:google.maps.Animation.DROP,
    //         icon: postmarker
    //     });

    //     google.maps.event.addListener(mark[cnt], 'click', (function(markerrr, cnt) {
    //         return function() {
    //             infowindows[cnt].open(map, mark[cnt]);
    //         }
    //     })(mark[cnt], cnt));

    //     bounds.extend(mark[cnt].getPosition());

    //     cnt++;
    // }

    // marker.setIcon(image);
    // infoWindow.setContent("Your Location");
    // infoWindow.open(map);

    // END OF USER LOCATION MARKER AND INFO ==========================================

    // Close popup windows on map click
    google.maps.event.addListener(map, "click", function(event) {
        infowindow.close();
    });
    google.maps.event.addListener(circle, "click", function(event) {
        infowindow.close();
    });

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

// END OF MAP ======================================================================

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
            backgroundColor: "linear-gradient(to right, #00b09b, #70C782)",
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
