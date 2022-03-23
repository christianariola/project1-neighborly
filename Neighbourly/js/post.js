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
        Toastify({
            text: "Post created successfully!",
            duration: 2000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: 'center', // `left`, `center` or `right`
            backgroundColor: "linear-gradient(to right, #00b09b, #70C782)",
        }).showToast();
        
        // return(docRef.id);
        });
    }

    static async toHTMLString(post) {
        let postCard = await Post.getPostTemplate('card');
        const parser = new DOMParser();
		const element = parser.parseFromString(postCard, 'text/html').body.firstChild;
        element.querySelector('.post-title').innerHTML = post.title;
        // element.querySelector('.post-type').innerHTML = post.type;
        element.querySelector('.post-description').innerHTML = post.description;
        element.querySelector('.post-author').innerHTML = `${post.author?.firstName} ${post.author?.lastName}`;
        element.querySelector('.post-createdAt').innerHTML = dbTimestampToDate(post.createdAt).toString().substring(0, 25);
        return element;
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
