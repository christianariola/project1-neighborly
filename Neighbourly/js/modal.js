const TEMPLATE = '/components/modal.html';

const modalState = {
    open : async (content, baseTemplate = TEMPLATE) => {
        const response = await fetch(baseTemplate);
        const txt = await response.text();
        modal.innerHTML = txt.replace('{children}', content);
    },
    close : () => {
        modal.innerHTML = '';
    },
    changeContent: (content) => {
        document.querySelector('#modal .modal-body').innerHTML = content;
    }
};
