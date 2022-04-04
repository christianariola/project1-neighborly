class Post {
    static templates = {};
    constructor(id, docId, title, description, likes = [], replies= [], photos = [], location = {}, createdAt, type, author) {
        const uid = sessionStorage.getItem("uid");
        this.id = id || `${uid}-${Date.now().toString(36)}`;
        this.docId = docId;
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
        const { docId, ...rest } = this;
        return toJson(rest);
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

    static async loadPostForm(postType, element) {
      postTypeInput.value = postType;
      newPostAddImageButtons.classList.remove('visually-hidden');
      element.parentElement.querySelector('li.active')?.classList.remove('active');
      element.classList.add('active');
      document.querySelector('.new-post .new-post-body h4').innerHTML = POST_TYPES_LABELS[postType];
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
        const postTypePill = postElement.querySelector('.post-type');
        const categoryPill = postElement.querySelector('.post-category');
        const conditionPill = postElement.querySelector('.post-condition');
        const compensationPill = postElement.querySelector('.post-compensation');
        const postPhoto = postElement.querySelector('.post-img');

        postElement.querySelector('.post-card').dataset.id = post.id;
        postElement.querySelector('.post-card').dataset.docId = post.docId;
        postElement.querySelector('.post-title').innerHTML = post.title;
        postElement.querySelector('.post-description').innerHTML = post.description;
        postElement.querySelector('.post-author').innerHTML = `${post.author?.firstName} ${post.author?.lastName}`;
        postElement.querySelector('.post-createdAt').innerHTML = dbTimestampToDate(post.createdAt).toString().substring(0, 25);
        postElement.querySelector('.post-avatar img').src = `https://i.pravatar.cc/150?u=${post.author?.userId}`;
        postTypePill.innerHTML = POST_TYPES_LABELS[post.type];

        if (post.photos?.length) {
            postPhoto.classList.remove('visually-hidden');
            postPhoto.src = post.photos[0];
        }

        if (post.compensation) {
            compensationPill.innerHTML = `$${post.compensation}`;
            compensationPill.classList.remove('visually-hidden');
        }

        if (post.category) {
            categoryPill.innerHTML = POST_CATEGORIES[post.category];
            categoryPill.classList.remove('visually-hidden');
        }

        if (post.condition) {
            conditionPill.innerHTML = GIVEAWAY_CONDITION[post.condition];
            conditionPill.classList.remove('visually-hidden');
        }

        if (post.starRating) {
            const starRatingInput = postElement.querySelector('.post-card-star-rating');
            starRatingInput.classList.remove('visually-hidden');
            starRatingInput.setAttribute('value', post.starRating);
            starRatingInput.value = post.starRating;
            postTypePill.classList.add('visually-hidden');
        }

        const icon = postElement.querySelector('.post-like-action i');
        if (post.likes?.length) {
            postElement.querySelector('.post-likes').innerHTML = post.likes?.length;

            const userId = sessionStorage.getItem("uid");
            if (!post.likes.includes(userId)) {
                icon.classList.remove('fa-light');
                icon.classList.add('fa-regular');
            }
        } else {
            icon.classList.remove('fa-light');
            icon.classList.add('fa-regular');
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

    static async addNewPostCardToFeed(post, container = searchInput.value ? allPostsBackup : feed, appendElement = true) {
        const postHTMLElement = await Post.toHTMLElement(post)
        if (appendElement) {
            container.append(postHTMLElement);
        } else {
            container.prepend(postHTMLElement);
        }
    }


    static async updatePostCard(post, container = searchInput.value ? allPostsBackup : feed) {
        const element = container.querySelector(`.post-card[data-id="${post.id}"]`);
        if (searchInput.value && searchInput.value.trim()) {
            const displayedElement = feed.querySelector(`.post-card[data-id="${post.id}"]`);
            displayedElement && Post.applyChanges(displayedElement.parentElement, post);
        }
        if (element) {
            Post.applyChanges(element.parentElement, post);
        } else {
            await Post.addNewPostCardToFeed(post, container, false);
        }
    }

    static async like(element) {
        const alreadyLiked = element.querySelector('i.fa-heart.fa-light');
        const icon = element.querySelector('i.fa-heart');
        if (alreadyLiked) {
            icon.classList.add('fa-regular');
            icon.classList.remove('fa-light');
        } else {
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-light');
        }

        const postContainer = element.closest('.post-card');
        const postDocId = postContainer.dataset?.docId;
        const userId = sessionStorage.getItem("uid");
        const likesCountElement = postContainer.querySelector('.post-likes');
        likesCountElement.parentElement.classList.remove('visually-hidden');
        const currentLikes = Number(likesCountElement.innerHTML || 0);
        const updatedLikes = alreadyLiked ? currentLikes - 1 : currentLikes + 1;

        likesCountElement.innerHTML = updatedLikes === 0 ? '' : updatedLikes;
        db.collection('posts').doc(postDocId).update({
            likes: alreadyLiked ? firestore.FieldValue.arrayRemove(userId) :firestore.FieldValue.arrayUnion(userId)
        })
    }

}

class Recommendation extends Post {
    constructor({ id, docId, title, description, likes, replies, starRating, photos, location, createdAt, author }) {
        super(id, docId, title, description, likes, replies, photos, location, createdAt, POST_TYPES.recommendation, author);
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
    constructor({ id, docId, title, description, likes, replies, photos, location, createdAt, compensation, author, category }) {
        super(id, docId, title, description, likes, replies, photos, location, createdAt, POST_TYPES.helpRequest, author);
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
    constructor({ id, docId, title, description, likes, replies, photos, location, createdAt, condition, category, author }) {
        super(id, docId, title, description, likes, replies, photos, location, createdAt, POST_TYPES.giveaway, author);
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
            const postDocId = postContainer.dataset?.docId;
            const postId = postContainer.dataset?.id;
            const message = (new Reply({ text, postId })).toJson();
            db.collection('posts').doc(postDocId).update({
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
