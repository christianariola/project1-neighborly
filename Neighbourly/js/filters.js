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