const POST_TEMPLATES = {
    base: '/components/base_post.html',
    recommendation: '/components/recommendation.html',
    help_request: '/components/help_request.html',
    giveaway: '/components/giveaway.html',
}

const POST_TYPES = {
    recommendation: 'recommendation',
    helpRequest: 'help_request',
    giveaway: 'giveaway',
};

class Post {
    constructor(title, description, photos = [], location = {}, createdAt) {
        this.title = title;
        this.description = description;
        this.photos = photos;
        this.location = location;
        this.created_at = createdAt || new Date();
        this.modified_at = createdAt ? new Date() : null;
    }

    toJson() {
        return Object.entries(this).reduce((acc, [key, value])=> {
            acc[key] = value;
            return acc;
        }, {})
    }

    static async loadPostSelection() {
        const postTemplatePath = POST_TEMPLATES.base;
        const postTemplate = await fetch(postTemplatePath);
        const newPostForm = await postTemplate.text();
        modalState.open(newPostForm);
    }

    static async loadPostForm() {
        const postTemplatePath = POST_TEMPLATES[postTypeSelect.value];
        const postTemplate = await fetch(postTemplatePath);
        const newPostForm = await postTemplate.text();
        modalState.changeContent(newPostForm);
    }

    static save(postType) {
        const post = (POST_CLASSES[postType]).create().toJson();
        db.collection('posts').add(post).then(() => {
            modalState.close();
        });
    }

}

class Recomendation extends Post {
    constructor({title, description, starRating, photos, location}) {
        super(title, description, photos, location);
        this.starRating = starRating > 0 && starRating < 6  ? Number(starRating): null;
    }

    static create() {
        return new Recomendation({
            title: newPostTitle.value,
            starRating: newPostRating.value,
            description: newPostDescription.value,
        });
    }
}

class HelpRequest extends Post {
    constructor({title, description, photos, location, compensation}) {
        super(title, description, photos, location);
        this.compensation = compensation;
    }

    static create() {
        return new HelpRequest({
            title: newPostTitle.value,
            compensation: newPostCompensation.value,
            description: newPostDescription.value,
        });
    }
}

class Giveaway extends Post {
    constructor({title, description, photos, location, condition, conditionPercentage}) {
        super(title, description, photos, location);
        this.condition = condition;
        this.conditionPercentage = Number(Math.min(Math.max(0, conditionPercentage),100));
    }


    static create() {
        return new Giveaway({
            title: newPostTitle.value,
            condition: newPostItemConditionNew.checked ? newPostItemConditionNew.value : newPostItemConditionUsed.value,
            conditionPercentage: newPostConditionPercent.value,
            description: newPostDescription.value,
        });
    }
}

const POST_CLASSES = {
    [POST_TYPES.recommendation]: Recomendation,
    [POST_TYPES.helpRequest]: HelpRequest,
    [POST_TYPES.giveaway]: Giveaway,
};
