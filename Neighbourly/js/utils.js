const POST_TEMPLATES = {
    base: `${BASE_URL}/components/base_post_form.html`,
    card: `${BASE_URL}/components/post_card.html`,
    recommendation: `${BASE_URL}/components/recommendation_form.html`,
    help_request: `${BASE_URL}/components/help_request_form.html`,
    giveaway: `${BASE_URL}/components/giveaway_form.html`,
}

const POST_TYPES = {
    recommendation: 'recommendation',
    helpRequest: 'help_request',
    giveaway: 'giveaway',
};


const toJson = (object) => {
    return Object.entries(object).reduce((acc, [key, value])=> {
        acc[key] = value;
        return acc;
    }, {})
}

const dbTimestampToDate = (timestamp) => {
    return new firebase.firestore.Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
}
