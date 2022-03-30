class Post {
    static templates = {};
    constructor(id, title, description, likes = [], replies= [], photos = [], location = {}, createdAt, type, author) {
        const uid = sessionStorage.getItem("uid");
        this.id = id || `${uid}-${Date.now().toString(36)}`;
        this.title = title;
        this.description = description;
        this.photos = photos;
        this.photos = photos;
        this.likes = likes;
        this.createdAt = createdAt || new Date();
        this.modifiedAt = createdAt ? new Date() : null;
        this.type = type;
        this.author = createdAt ? author : sessionStorage.getItem("uid");
        this.replies = replies;
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

    static async loadPostForm(postType) {
      postTypeInput.value = postType;
      newPostAddImageButtons.classList.remove('visually-hidden');
      document.querySelector('.new-post-footer button').disabled = false;
      const newPostForm = await Post.getPostTemplate(postType);
      postTypeContainer.innerHTML = newPostForm;
    }

    static save() {
      const postType = postTypeInput.value;
      if (POST_CLASSES[postType]) {
        const post = (POST_CLASSES[postType]).create().toJson();
        modalState.close();
        db.collection('posts').add(post).then(docRef => {  //Get document reference id for the post
        console.log("Document written with ID: ", docRef.id);
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
    }

    static applyChanges(postElement, post) {
        postElement.querySelector('.post-card').dataset.id = post.id;
        postElement.querySelector('.post-title').innerHTML = post.title;
        postElement.querySelector('.post-type').innerHTML = POST_TYPES_LABELS[post.type];
        postElement.querySelector('.post-category').innerHTML = post.category ? `Category: ${POST_CATEGORIES[post.category]}` : '';
        postElement.querySelector('.post-condition').innerHTML = post.condition ? `Condition: ${GIVEAWAY_CONDITION[post.condition]}` : '';
        postElement.querySelector('.post-description').innerHTML = post.description;
        postElement.querySelector('.post-author').innerHTML = `${post.author?.firstName} ${post.author?.lastName}`;
        postElement.querySelector('.post-createdAt').innerHTML = dbTimestampToDate(post.createdAt).toString().substring(0, 25);
        postElement.querySelector('.post-img').src = post.photos?.length ? post.photos[0] : '';
        postElement.querySelector('.post-avatar img').src = `https://i.pravatar.cc/150?u=${post.author?.userId}`;

        if (post.starRating) {
            const starRatingInput = postElement.querySelector('.post-card-star-rating');
            starRatingInput.classList.remove('visually-hidden');
            starRatingInput.value = post.starRating;
        }

        if (post.likes?.length) {
            postElement.querySelector('.post-likes').innerHTML = post.likes?.length;
            if (post.likes.includes(post.author.userId)) {
                postElement.querySelector('.post-like-action').classList.add('visually-hidden');
            }
        } else {
            postElement.querySelector('.post-likes').parentElement.classList.add('visually-hidden');
        }

        const populateReply = (replyElement, postReply) => {
            replyElement.dataset.id = postReply.id;
            replyElement.querySelector('.post-reply-author-avatar img').src = `https://i.pravatar.cc/150?u=${postReply.author?.userId}`;
            replyElement.querySelector('.post-reply-author-name').innerHTML = `${postReply.author?.firstName} ${postReply.author?.lastName}`;
            replyElement.querySelector('.post-reply-text').innerHTML = postReply.text;
            replyElement.querySelector('.post-reply-createdAt').innerHTML = dbTimestampToDate(postReply.createdAt).toString().substring(0, 25);
        };

        const repliesContainerElement = postElement.querySelector('.post-replies');
        const emptyReplyElement = repliesContainerElement.querySelector('.post-reply-container.visually-hidden');

        post.replies.forEach((postReply, idx) => {
            const existingElement = repliesContainerElement.querySelector(`.post-reply-container[data-id="${postReply.id}"]`);
            const element = existingElement || emptyReplyElement.cloneNode(true);
            element.classList.remove('visually-hidden');
            populateReply(element, postReply);
            if (!existingElement) {
                repliesContainerElement.appendChild(element)
            }
        });

        return postElement;
    }

    static async toHTMLElement(post) {
        let postCard = await Post.getPostTemplate('card');
        const parser = new DOMParser();
        const element = parser.parseFromString(postCard, 'text/html').body.firstChild;
        return Post.applyChanges(element, post);
    }

    static async addNewPostCardToFeed(post, appendElement = true) {
        const postHTMLElement = await Post.toHTMLElement(post)
        if (appendElement) {
            feed.append(postHTMLElement);
        } else {
            feed.prepend(postHTMLElement);
        }
    }


    static async updatePostCard(post) {
        const element = feed.querySelector(`.post-card[data-id="${post.id}"]`);
        if (element) {
            Post.applyChanges(element.parentElement, post);
        } else {
            await Post.addNewPostCardToFeed(post, false);
        }
    }

    static async like(element) {
        element.classList.add('visually-hidden');
        const postContainer = element.closest('.post-card');
        const postId = postContainer.dataset?.id;
        const likesCountElement = postContainer.querySelector('.post-likes');
        likesCountElement.parentElement.classList.remove('visually-hidden');

        likesCountElement.innerHTML = Number(likesCountElement.innerHTML || 0) + 1;
        db.collection('posts').doc(postId).update({
            likes: firestore.FieldValue.arrayUnion(sessionStorage.getItem("uid"))
        })
    }

}

class Recommendation extends Post {
    constructor({ id, title, description, likes, replies, starRating, photos, location, createdAt, author }) {
        super(id, title, description, likes, replies, photos, location, createdAt, POST_TYPES.recommendation, author);
        this.starRating = starRating > 0 && starRating < 6  ? Number(starRating): null;
    }

    static create() {
        return new Recommendation({
            title: newPostTitle.value,
            starRating: newPostRating.value,
            description: newPostDescription.value,
            photos: newPostImage.src ? [newPostImage.src] : []
        });
    }
}

class HelpRequest extends Post {
    constructor({ id, title, description, likes, replies, photos, location, createdAt, compensation, author, category }) {
        super(id, title, description, likes, replies, photos, location, createdAt, POST_TYPES.helpRequest, author);
        this.compensation = compensation;
        this.category = category;
    }

    static create() {
        return new HelpRequest({
            title: newPostTitle.value,
            compensation: newPostCompensation.value,
            description: newPostDescription.value,
            photos: newPostImage.src ? [newPostImage.src] : [],
            category: helpRequestCategory.value,
        });
    }
}

class Giveaway extends Post {
    constructor({ id, title, description, likes, replies, photos, location, createdAt, condition, category, author }) {
        super(id, title, description, likes, replies, photos, location, createdAt, POST_TYPES.giveaway, author);
        this.condition = condition;
        this.category = category;
    }


    static create() {
        return new Giveaway({
            title: newPostTitle.value,
            condition: giveawayCondition.value,
            category: giveawayCategory.value,
            description: newPostDescription.value,
            photos: newPostImage.src ? [newPostImage.src] : []
        });
    }
}

class Reply {
    constructor({ id, text, postId, parentId, createdAt, author }) {
        const uid = sessionStorage.getItem("uid");
        this.id = id || `${uid}-${Date.now()}`;
        this.text = text;
        this.postId = postId;
        this.parentId = parentId || null;
        this.createdAt = createdAt || new Date();
        this.author = createdAt ? author : uid;
    }

    toJson() {
        return toJson(this);
    }

    static async postReply(messageInput) {
        const postContainer = messageInput.closest('.post-card');
        const replyContainer = messageInput.closest('.post-reply-input-container');
        const input = replyContainer?.querySelector('input.post-reply-input');
        const text = input.value;
        input.value = '';
        if (messageInput && text.trim()) {
            const postId = postContainer?.dataset?.id;
            const message = (new Reply({ text, postId })).toJson();
            db.collection('posts').doc(postId).update({
              replies: firestore.FieldValue.arrayUnion(message)
            })
        }
    }
}

const POST_CLASSES = {
    [POST_TYPES.recommendation]: Recommendation,
    [POST_TYPES.helpRequest]: HelpRequest,
    [POST_TYPES.giveaway]: Giveaway,
};
