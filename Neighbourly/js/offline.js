const offbox = document.querySelector('.offline');

class Offline {
    offline() {
        console.log("we are offline");
        offbox.innerHTML = '<div class="offline overlay"><div class="overlay-content offline-box text-white"><span>No Internet Connection.</span></div></div>';
    }
    
    online() {
        console.log("we are online");
        offbox.innerHTML = "";
    }
}

const connChecker = new Offline;

window.addEventListener('offline', connChecker.offline);
window.addEventListener('online', connChecker.online);