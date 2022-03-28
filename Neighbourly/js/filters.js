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

let stopListineng;
async function onloadsetshow(){
    filterSelection("all");
}

const resetFeed = () => {
    //In order to remove post that dont match the filters criteria, this should be executed every time we apply a new filter
    feed.innerHTML = '';
    feedHasBeenPopulated = false;
}

async function filterSelection(c) {
    resetFeed();
    if (stopListineng) stopListineng();
    const postsCollection = c == 'all' ? dbCollection("posts") :dbCollection("posts").where("type", "==", c);

    stopListineng = postsCollection.onSnapshot(async (querySnapshot) => {
        await populateFeed(querySnapshot);
    });
}
onloadsetshow();

const btn = document.querySelector('#category_btn');
btn.addEventListener('click', (event) => {
    resetFeed();
    event.preventDefault();
    let checkboxes = document.querySelectorAll('input[name="category"]:checked');
    let values = [];
    checkboxes.forEach((checkbox) => {
        values.push(checkbox.value);
    });

    let Compcheckboxes = document.querySelectorAll('input[name="compensation"]:checked');
    console.log(Compcheckboxes.length);
    if (Compcheckboxes.length == 0 ||checkboxes.length == 0) {
        Toastify({
            text: "Please select compensation and Category",
            duration: 2000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: 'right', // `left`, `center` or `right`
            backgroundColor: "linear-gradient(to right, #00b09b, #70C782)",
        }).showToast();
        setTimeout(() => {
        window.location.reload();
        }, 1000);
        return;
    }
    console.log(Compcheckboxes[0].value);
    let c = Compcheckboxes[0].value;
    // Compcheckboxes.forEach((c) => {
    //     values.push(c.value);
    // });
    // const c = document.getElementById("helprequest_type");
    // console.log(c.value);
    if (stopListineng) stopListineng();
    if (c == '') {
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
    event.preventDefault();
    resetFeed();
    let givecheckboxes = document.querySelectorAll('input[name="GiveawayCategory"]:checked');
    let values = [];
    givecheckboxes.forEach((checkbox) => {
        values.push(checkbox.value);
    });

    if (values.length > 10) {
        Toastify({
            text: "Please select less than 10 categories",
            duration: 2000,
            close: true,
            gravity: "bottom", // `top` or `bottom`
            position: 'center', // `left`, `center` or `right`
            backgroundColor: "linear-gradient(to right, #00b09b, #70C782)",
        }).showToast();
        setTimeout(() => {
            window.location.reload();
        }, 1000);
        return;
    }

    let Condcheckboxes = document.querySelectorAll('input[name="condition"]:checked');
    console.log(Condcheckboxes.length);
    if (Condcheckboxes.length == 0 || givecheckboxes.length == 0) {
        Toastify({
            text: "Please select compensation and Category",
            duration: 2000,
            close: true,
            gravity: "bottom", // `top` or `bottom`
            position: 'center', // `left`, `center` or `right`
            backgroundColor: "linear-gradient(to right, #00b09b, #70C782)",
        }).showToast();
        setTimeout(() => {
            window.location.reload();
        }, 1000);
        return;
    }
    console.log(Condcheckboxes[0].value);
    let c = Condcheckboxes[0].value;
    // Compcheckboxes.forEach((c) => {
    //     values.push(c.value);
    // });
    // const c = document.getElementById("helprequest_type");
    // console.log(c.value);
    if (stopListineng) stopListineng();
    if (c == '') {
        const postsCollection = dbCollectioncomp("posts").where("condition", "==", c && "type", "==", "giveaway").where("category", "in", values);
        stopListineng = postsCollection.onSnapshot(async (querySnapshot) => {
            await populateFeed(querySnapshot);
        });
    } else {
        const postsCollection = dbCollectioncomp("posts").where("condition", "!=", '' && "type", "==", "giveaway").where("category", "in", values);
        stopListineng = postsCollection.onSnapshot(async (querySnapshot) => {
            await populateFeed(querySnapshot);
        });
    }
});




// function onlyOne(checkbox) {
//     var checkboxes = document.getElementsByName('category')
//     checkboxes.forEach((item) => {
//         if (item !== checkbox) item.checked = false
//     })
// }

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
// function onlyfour(checkbox) {
//     var checkboxes = document.getElementsByName('GiveawayCategory')
//     checkboxes.forEach((item) => {
//         if (item !== checkbox) item.checked = false
//     })
// }
