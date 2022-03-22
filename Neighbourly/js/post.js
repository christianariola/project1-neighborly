class Post {
    static templates = {};
    constructor(title, description, photos = [], location = {}, createdAt, type, author) {
        this.title = title;
        this.description = description;
        this.photos = photos;
        this.location = location;
        this.createdAt = createdAt || new Date();
        this.modifiedAt = createdAt ? new Date() : null;
        this.type = type;
        this.author = createdAt ? author : sessionStorage.getItem("uid");
    }

    toJson() {
        return toJson(this);
    }

    static async getPostTemplate(type) {
        if (Post.templates[type]) {
            return Post.templates[type];
        } else {
            const postTemplatePath = POST_TEMPLATES[type] || POST_TEMPLATES.base;
            const postTemplate = await fetch(postTemplatePath);
            Post.templates[type] =  await postTemplate.text();
            return Post.templates[type];
        }
    }

    static async loadPostSelection() {
        const newPostForm = await Post.getPostTemplate();
        modalState.open(newPostForm);
    }
    
    static async loadPostForm() {
        const newPostForm = await Post.getPostTemplate(postTypeSelect.value);
        modalState.changeContent(newPostForm);
    }

    static save(postType) {
        const post = (POST_CLASSES[postType]).create().toJson();
        db.collection('posts').add(post).then(docRef => {  //Get document reference id for the post
        console.log("Document written with ID: ", docRef.id);
        modalState.close();
        // return(docRef.id);
        });
    }

    static async toHTMLString(post) {
        let postCard = await Post.getPostTemplate('card');
        const body = `<div class="user-post-${post.type} user-content box-shadow padding-1r margin-b-1r card-line">
        <span class="post-title">${post.title}</span><br>
        <span class="post-type">Type: ${post.type}</span>
        <span class="post-description">Description: ${post.description}</span>
        <span class="post-createdAt">Created At: ${(dbTimestampToDate(post.createdAt))}</span>
        <span class="post-author">Author: ${post.author?.firstName} ${post.author?.lastName}</span>
        </div>`;
        // postCard = postCard.replace('{header}', post.title);
        postCard = postCard.replace('{body}', body);
        return postCard;
    }

}

class Recomendation extends Post {
    constructor({title, description, starRating, photos, location, createdAt, author}) {
        super(title, description, photos, location, createdAt, POST_TYPES.recommendation, author);
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
    constructor({title, description, photos, location, createdAt, compensation, author}) {
        super(title, description, photos, location, createdAt, POST_TYPES.helpRequest, author);
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
    constructor({title, description, photos, location, createdAt, condition, conditionPercentage, author}) {
        super(title, description, photos, location, createdAt, POST_TYPES.giveaway, author);
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
