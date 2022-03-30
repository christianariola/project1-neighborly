const category_btn = document.getElementById("category_btn");
const gardening = document.getElementById("gardening");
const grocery_shopping = document.getElementById("grocery_shopping");
const installation = document.getElementById("installation");
const cleaning = document.getElementById("cleaning");
const babysitting = document.getElementById("babysitting");
const other = document.getElementById("other");
const electronics = document.getElementById("electronics");
const furniture = document.getElementById("furniture");
const bicycles = document.getElementById("bicycles");
const clothing_and_accessories = document.getElementById("clothing_and_accessories");
const home_decor = document.getElementById("home_decor");
const musical_instruments = document.getElementById("musical_instruments");
const property_rental = document.getElementById("property_rental");
const property_sales = document.getElementById("property_sales");
const tools = document.getElementById("tools");
const toys = document.getElementById("toys");
const car_parts = document.getElementById("car_parts");
const baby_and_kids = document.getElementById("baby_and_kids");
const appliances = document.getElementById("appliances");
const helprequest_type = document.getElementById("helprequest_type");
const searchInput = document.getElementById("searchInput");
let allPostsBackup = document.createElement('div');

let stopListineng;
async function onloadsetshow() {
    filterSelection("all");
}

const resetFeed = () => {
    //In order to remove post that dont match the filters criteria, this should be executed every time we apply a new filter
    feed.innerHTML = '';
    searchInput.value = '';
    allPostsBackup.innerHTML = '';
    feedHasBeenPopulated = false;
}

async function filterSelection(c) {
    resetFeed();
    if (stopListineng) stopListineng();
    const postsCollection = c == 'all' ? dbCollection("posts") : dbCollection("posts").where("type", "==", c);

    stopListineng = postsCollection.onSnapshot(async (querySnapshot) => {
        await populateFeed(querySnapshot);
    });
}
onloadsetshow();


async function filterReco(c) {
    resetFeed();
    const values = parseFloat(c);
    console.log(values);
    console.log(typeof values);
    if (stopListineng) stopListineng();

    const postCollection = dbCollection("posts").where("starRating", "==", values).where("type", "==", "recommendation");

    stopListineng = postCollection.onSnapshot(async (querySnapshot) => {
        await populateFeed(querySnapshot);
    });
}

async function filtergiveCon(c){
    resetFeed();
    if (stopListineng) stopListineng();
    const postCollection = dbCollection("posts").where("condition", "==", c).where("type", "==", "giveaway");

    stopListineng = postCollection.onSnapshot(async (querySnapshot) => {
        await populateFeed(querySnapshot);
    });
}

//reset filters and reload feed

function reloadfeed() {
    resetFeed();
    onloadsetshow();
}

//filter by Help request category and Compensation
const btn = document.querySelector('#category_btn');
btn.addEventListener('click', (event) => {
    resetFeed();
    event.preventDefault();
    let checkboxes = document.querySelectorAll('input[name="category"]:checked');
    let values = [];
    //store the values of the checked checkboxes in an array
    checkboxes.forEach((checkbox) => {
        values.push(checkbox.value);
    });

    let Compcheckboxes = document.querySelectorAll('input[name="compensation"]:checked');
    console.log(Compcheckboxes.length);
    //check that both filters are selected
    if (Compcheckboxes.length == 0 || checkboxes.length == 0) {
        Toastify({
            text: "Please select both Compensation and Category",
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: 'center', // `left`, `center` or `right`
            backgroundColor: "linear-gradient(to right, #00b09b, #70C782)",
        }).showToast();
        // setTimeout(() => {
        //     window.location.reload();
        // }, 1500);
        // reloadfeed();
        return;
    }

    let c = Compcheckboxes[0].value;
    if (stopListineng) stopListineng();
    if (c == '') {
        //query for all posts where compensation matches the selected value and category matches the selected values
        const postsCollection = dbCollectioncomp("posts").where("compensation", "==", c && "type", "==", "help_request").where("category", "in", values);
        stopListineng = postsCollection.onSnapshot(async (querySnapshot) => {
            await populateFeed(querySnapshot);
        });
    } else {
        const postsCollection = dbCollectioncomp("posts").where("compensation", "!=", '' && "type", "==", "help_request").where("category", "in", values);
        stopListineng = postsCollection.onSnapshot(async (querySnapshot) => {
            await populateFeed(querySnapshot);
        });
    }
});

////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

const givebtn = document.querySelector('#GiveCategory_btn');
givebtn.addEventListener('click', (event) => {
    resetFeed();
    event.preventDefault();
    let givecheckboxes = document.querySelectorAll('input[name="GiveawayCategory"]:checked');
    let values = [];
    givecheckboxes.forEach((checkbox) => {
        values.push(checkbox.value);
    });
    if (values.length == 0) {
        Toastify({
            text: "Please select at least one Category",
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: 'center', // `left`, `center` or `right`
            backgroundColor: "linear-gradient(to right, #00b09b, #70C782)",
        }).showToast();
        return;
    }
    //firebase "in" query cannot handle more than 10 values, so limit to ten
    if (values.length > 10) {
        Toastify({
            text: "Please select less than 10 categories",
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: 'center', // `left`, `center` or `right`
            backgroundColor: "linear-gradient(to right, #00b09b, #70C782)",
        }).showToast();
        // setTimeout(() => {
        //     window.location.reload();
        // }, 1000);
        return;
    }

    if (stopListineng) stopListineng();
    const postCollection = dbCollection("posts").where("type", "==", "giveaway").where("category", "in", values);
    stopListineng = postCollection.onSnapshot(async (querySnapshot) => {
        await populateFeed(querySnapshot);
    });

});

function onlytwo(checkbox) {
    var checkboxes = document.getElementsByName('compensation')
    checkboxes.forEach((item) => {
        if (item !== checkbox) item.checked = false
    })
}

function onlythree(checkbox) {
    var checkboxes = document.getElementsByName('condition')
    checkboxes.forEach((item) => {
        if (item !== checkbox) item.checked = false
    })
}

searchInput.addEventListener('change', (event) => {
    const search = event?.target?.value || '';
    if (search.trim()) {
        const container = document.createElement('div');
        const displayedPosts = feed.querySelectorAll('.post-wrapper');
        const backupPosts = allPostsBackup?.childNodes;
        const allPosts = displayedPosts.length > backupPosts.length ? displayedPosts : backupPosts;
        allPosts.forEach((card, idx) => {
            let cardContents = '';
            const clonedCard = card.cloneNode(true);
            allPostsBackup.append(clonedCard);
            cardContents += `${card.querySelector('.post-title').innerHTML?.toLowerCase()} `;
            cardContents += `${card.querySelector('.post-description').innerHTML?.toLowerCase()} `;
            card.querySelectorAll('.post-reply-text').forEach(reply => {
                cardContents += `${reply.innerHTML?.toLowerCase()} `;
            });
            if (cardContents.includes(search.toLowerCase())) {
                container.append(card.cloneNode(true));
            }
        });


        if (!container.innerHTML.length) {
            container.innerHTML = `There are no post that contain the word <span class="bold">${search}</span>`;
            Toastify({
                text: "There are no post that contain the word: " + search,
                duration: 2000,
                close: true,
                gravity: "top", // `top` or `bottom`
                position: 'center', // `left`, `center` or `right`
                backgroundColor: "linear-gradient(to right, #00b09b, #70C782)",
            }).showToast();
        }
        feed.innerHTML = container.innerHTML;
    } else {

        if (allPostsBackup.childNodes.length) {
            feed.innerHTML = allPostsBackup.innerHTML;
        }
    }
});
