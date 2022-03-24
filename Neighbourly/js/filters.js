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
    const postsCollection = c == '' ? dbCollection("posts").where("compensation", "==", c) : dbCollection("posts", 'compensation').orderBy('createdAt').where("compensation", "!=", c);
    stopListineng = postsCollection.onSnapshot(async (querySnapshot) => {
        await populateFeed(querySnapshot);
    });
}
