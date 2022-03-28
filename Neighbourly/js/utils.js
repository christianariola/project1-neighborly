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

const POST_TYPES_LABELS = {
    [POST_TYPES.recommendation]: 'Recommendation',
    [POST_TYPES.helpRequest]: 'Help Request',
    [POST_TYPES.giveaway]: 'Giveaway',
};

const POST_CATEGORIES = {
    'gardening': 'Gardening',
    'grocery_shopping': 'Grocery',
    'installation': 'Installation',
    'cleaning': 'Cleaning',
    'babysitting': 'Babysitting',
    'other': 'Other',
    'electronics': 'Electronics',
    'furniture': 'Furniture',
    'bicycles': 'Bicycles',
    'clothing_and_accessories': 'Clothing & Accessories',
    'home_decor': 'Home Decor',
    'musical_instruments': 'Musical Instruments',
    'property_rental': 'Property Rental',
    'property_sales': 'Property Sales',
    'tools': 'Tools',
    'toys': 'Toys',
    'car_parts': 'Car Parts',
    'baby_and_kids': 'Baby & Kids',
    'appliances': 'Appliances',
};

const GIVEAWAY_CONDITION = {
    'new': 'New',
    'like_new': 'Like New',
    'used': 'Used',
    'needs_reparing': 'Needs Reparing',
}

const toJson = (object) => {
    return Object.entries(object).reduce((acc, [key, value])=> {
        acc[key] = value;
        return acc;
    }, {})
}

const dbTimestampToDate = (timestamp) => {
    return new firebase.firestore.Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
}
