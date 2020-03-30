function transfer() {
    window.location = `${window.location.origin}/profile/${document.getElementsByClassName(`search-player`)[0].value}`;
    return false;
}