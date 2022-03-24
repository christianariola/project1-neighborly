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

function onlyOne(checkbox) {
    var checkboxes = document.getElementsByName('category')
    checkboxes.forEach((item) => {
        if (item !== checkbox) item.checked = false
    })
}

let stopListineng;
async function onloadsetshow(){
    filterSelection("all");
}
async function filterSelection(c) {
    if (stopListineng) stopListineng();
    const postsCollection = c == 'all' ? dbCollection("posts") :dbCollection("posts").where("type", "==", c);

    stopListineng = postsCollection.onSnapshot(async (querySnapshot) => {
        await populateFeed(querySnapshot);
    });
}
onloadsetshow();

function filterhelptype(c) {
    if (stopListineng) stopListineng();
    const postCollection = c

    // const postsCollection = c == '' ? dbCollection("posts").where("compensation", "==", c && "type", "==", "help_request") : dbCollection("posts", 'compensation').orderBy('createdAt').where("compensation", "!=", c && "type", "==", "help_request");

    if (c==''){
        const postsCollection = dbCollection("posts").where("compensation", "==", c && "type", "==", "help_request");
        stopListineng = postsCollection.onSnapshot(async (querySnapshot) => {
            await populateFeed(querySnapshot);
        });
    }
    else{
        const postsCollection = dbCollectioncomp("posts").where("compensation", "!=", '' && "type", "==", "help_request")
        stopListineng = postsCollection.onSnapshot(async (querySnapshot) => {
            await populateFeed(querySnapshot);
        });
    }
}

const btn = document.querySelector('#category_btn');
btn.addEventListener('click', (event) => {
    event.preventDefault();
    let checkboxes = document.querySelectorAll('input[name="category"]:checked');
    let values = [];
    checkboxes.forEach((checkbox) => {
        values.push(checkbox.value);
    });

    let Compcheckboxes = document.querySelectorAll('input[name="compensation"]:checked');
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




//     const postsCollection = values.length == 0 ? dbCollection("posts") : dbCollection("posts").where("category", "==", values[0] || "category", "==", values[1] || "category", "==", values[2] || "category", "==", values[3] || "category", "==", values[4] || "category", "==", values[5] || "category", "==", values[6] || "category", "==", values[7] || "category", "==", values[8] || "category", "==", values[9] || "category" || "category", "==", values[10] || "category" || "category", "==", values[11] || "category" || "category", "==", values[12] || "category" || "category", "==", values[13] || "category" || "category", "==", values[14] || "category" || "category", "==", values[15] || "category" || "category", "==", values[16] || "category" || "category", "==", values[17] || "category" || "category", "==", values[18] || "category" || "category", "==", values[19] || "category" || "category", "==", values[20] || "category" || "category", "==", values[21] || "category" || "category", "==", values[22] || "category" || "category", "==", values[23] || "category" || "category", "==", values[24] || "category" || "category", "==", values[25] || "category" || "category", "==", values[26] || "category" || "category", "==", values[27] || "category" || "category", "==", values[28] || "category" || "category", "==", values[29] || "category" || "category", "==", values[30] || "category" || "category", "==", values[31] || "category" || "category", "==", values[32] || "category" || "category", "==", values[33] || "category" || "category", "==", values[34] || "category" || "category", "==", values[35] || "category" || "category", "==", values[36] || "category" || "category", "==", values[37] || "category" || "category", "==", values[38] || "category" || "category", "==", values[39] || "category" || "category", "==", values[40] || "category" || "category", "==", values[41] || "category" || "category", "==", values[42] || "category" || "category", "==", values[43] || "category" || "category").where("type", "==", "help_request");
//     stopListineng = postsCollection.onSnapshot(async (querySnapshot) => {
//         await populateFeed(querySnapshot);
//     });
// });


















function onlytwo(checkbox) {
    var checkboxes = document.getElementsByName('compensation')
    checkboxes.forEach((item) => {
        if (item !== checkbox) item.checked = false
    })
}
