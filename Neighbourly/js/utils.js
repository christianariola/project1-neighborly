const POST_TEMPLATES = {
    base: '/components/base_post_form.html',
    card: '/components/post_card.html',
    recommendation: '/components/recommendation_form.html',
    help_request: '/components/help_request_form.html',
    giveaway: '/components/giveaway_form.html',
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
