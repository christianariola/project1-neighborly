
const Imgform = document.querySelector('.uploadimgform');
const Imgfile = document.querySelector('#imgfile');
const Updbtn = document.querySelector('.uploadimgbtn');
const Profilebtn = document.querySelector('.profilebtn');
//Webcam Control elements
const Scrstart = document.querySelector('#start');
const Scrsnap = document.querySelector('#snap');
const Scrstop = document.querySelector('#stop');
//UID fron Authentication
const UserId = sessionStorage.getItem("uid");
const canvasclass = document.querySelector('.imagecanvas');

if(UserId==null){
    window.location.href = "login.html";
}

//Funtion to detect Webcam presence
function detectWebcam(callback) {
    let md = navigator.mediaDevices;
    if (!md || !md.enumerateDevices) return callback(false);
    md.enumerateDevices().then(devices => {
        callback(devices.some(device => 'videoinput' === device.kind));
    })
}
//Disable Webcam controls if Webcam is not detected
detectWebcam(function (hasWebcam) {
    if (hasWebcam===false) {
        console.log('No webcam detected');
        Scrsnap.disabled = true;
        Scrstop.disabled = true;
        Scrstart.disabled = true;
        canvasclass.style.display = "none";

    }
    else {
console.log("Webcam detected");
    }});

//eventlister for button click


Updbtn.onclick = function Uploadimage() {
//Upload selected image to firebase storage
    //Storage reference path
    const ref = firebase.storage().ref('Images/' + UserId);
    //Get the file from Html Input file
    if(Imgfile.files[0]===undefined){
        alert("Please select an image");
        return false;
    }
    else{
    const file = Imgfile.files[0];
    //Create a new name reference
    const name = new Date() + '-' + '-' + file.name;
    //Set file metadata
    const metadata = {
        contentType: file.type
    };

//Task to upload the file
const task = ref.child(name).put(file, metadata);
    
//Get Url of the uploaded file
task.then(snapshot => snapshot.ref.getDownloadURL())
.then(url => {
    console.log(url);
    alert('Image Uploaded');
    const image = document.querySelector('#upimage');
    image.src=url;
    Imgfile.value = "";
}
)}}


/////////////////////////////////////////////////////////////////////////////////////////////
//Take Photos from device
/////////////////////////////////////////////////////////////////////////////////////////////
const video = document.getElementById('video');

// Elements for taking the snapshot
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
context.scale(0.5, 0.5);

Scrstart.addEventListener("click", function () {
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        
        navigator.mediaDevices.getUserMedia({
            video: true
        }).then((stream) => {
            video.srcObject = stream;
            
        });
    } else {
        console.log("media devices not available in this browser");
    }

});

// Trigger photo take
Scrsnap.addEventListener("click", () => {
    context.drawImage(video, 0, 0, );
    const img = canvas.toDataURL('image/png');
    console.log(img);
    uploadBase64(img);
});

//upload base64 images to firebase storage
function uploadBase64(base64) {
    const ref = firebase.storage().ref('Images/' + UserId);
    const name = new Date() + '-'+ 'Camcap' + '-' + '.jpeg';
    const metadata = {
        contentType: 'image/jpeg'
    };
    const task = ref.child(name).putString(base64, 'data_url', metadata);
    task.then(snapshot => snapshot.ref.getDownloadURL())
        .then(url => {
            console.log(url);
            alert('Image Uploaded');
            const image = document.querySelector('#upimage');
            image.src = url;
        });

Scrstop.addEventListener("click", () => {
    const tracks = video.srcObject.getTracks();
    tracks.forEach(track => track.stop());
});
}

function uploadProfimg(base64) {
    const ref = firebase.storage().ref('Images/' + UserId + '/Profile');
    //Upload behaviour changed to replace file already in Cloud storage under profile folder
    const name = "Profileimg" + '-' + UserId + '.jpeg';
    const metadata = {
        contentType: 'image/jpeg'
    };
    const task = ref.child(name).putString(base64, 'data_url', metadata);
    task.then(snapshot => snapshot.ref.getDownloadURL())
        .then(url => {
            console.log(url);
            alert('Image Uploaded');
            const image = document.querySelector('#upimage');
            image.src = url;
        });
    }


    Profilebtn.onclick = function UploadProfimage() {
        //funtion to upload profile image
        //Upload selected image to firebase storage
            //Storage reference path
            const ref = firebase.storage().ref('Images/' + UserId + '/Profile');
            //Get the file from Html Input file
            if(Imgfile.files[0]===undefined){
                alert("Please select an image");
                return false;
            }
            else{
            const file = Imgfile.files[0];
            //Create a new name reference
            //Upload behaviour changed to replace file already in Cloud storage
            const name = "Profileimg" + '-' +  UserId;
            //Set file metadata
            const metadata = {
                contentType: file.type
            };
        
        //Task to upload the file
        const task = ref.child(name).put(file, metadata);
            
        //Get Url of the uploaded file
        task.then(snapshot => snapshot.ref.getDownloadURL())
        .then(url => {
            console.log(url);
            alert('Image Uploaded');
            const image = document.querySelector('#upimage');
            image.src=url;
            Imgfile.value = "";
        }
        )}}

        