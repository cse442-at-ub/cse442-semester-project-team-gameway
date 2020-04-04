function hideChat() {
    document.getElementsByClassName("social-chat")[0].classList.add(`hidden`);
}

function showChat() {
    document.getElementsByClassName("social-chat")[0].classList.remove(`hidden`);
}

function logout() {
    return 0;
}

function transfer() {
    window.location = `${window.location.origin}/profile/${document.getElementsByClassName(`search-player`)[0].value}`;
    return false;
}