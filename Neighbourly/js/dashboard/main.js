// Logout
const logout = document.querySelector('#logout');
logout.addEventListener('click', (e) => {
    e.preventDefault();

    auth.signOut().then(() => { 
        sessionStorage.removeItem("uid");
        alert('You have succesfully logout.');
        console.log('user signed out');
        window.location.href = "/index.html";
    }).catch(error => {
        alert(error.message);
        return false;
    });

    return false;
})