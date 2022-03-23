let stopListineng; 
async function onloadsetshow(){
    filterSelection("all");
}
async function filterSelection(c) {
    if (stopListineng) stopListineng();
    
    const dbCollection = c == 'all' ? db.collection("posts") :db.collection("posts").where("type", "==", c);
    
    stopListineng = dbCollection.onSnapshot(async (querySnapshot) => {
        await populateFeed(querySnapshot);
    });
}
onloadsetshow();

function filterhelptype(c) {
    if (stopListineng) stopListineng();
    const dbCollection = c == '' ? db.collection("posts").where("compensation", "==", c) : db.collection("posts").where("compensation", "!=", c);
    stopListineng = dbCollection.onSnapshot(async (querySnapshot) => {
        await populateFeed(querySnapshot);
    });
}