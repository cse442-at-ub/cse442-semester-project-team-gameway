// FRONT-END CHAT FUNCTIONALITY
function hideChat() {
    document.getElementsByClassName("social-chat")[0].classList.add(`hidden`);
}
function showChat() {
    document.getElementsByClassName("social-chat")[0].classList.remove(`hidden`);
}


// LOGOUT BUTTON
function logout() {
    return 0;
}


// RANK SEARCH FUNCTION
function transfer() {
    window.location = `${window.location.origin}/profile/${document.getElementsByClassName(`search-player`)[0].value}`;
    return false;
}


// SUB-MENU CHANGES
// ---------- homepage ---------- //
function changePageHome(pageName) {
    let
    overview = document.getElementsByClassName("overview")[0],
    patchnotes = document.getElementsByClassName("patchnotes")[0];

    if (overview.classList.contains(pageName)) { overview.classList.remove("hidden"); patchnotes.classList.add("hidden"); }
    else { overview.classList.add("hidden"); patchnotes.classList.remove("hidden"); }
}
// ---------- shop ---------- //
let
    featured = document.getElementsByClassName("featured")[0],
    characters = document.getElementsByClassName("characters")[0],
    icons = document.getElementsByClassName("icons")[0],
    crates = document.getElementsByClassName("crates")[0],
    purchase = document.getElementsByClassName("purchase")[0],
    featuredPage = document.getElementById("featured-page"),
    charactersPage = document.getElementById("characters-page"),
    iconsPage = document.getElementById("icons-page"),
    cratesPage = document.getElementById("crates-page"),
    purchasePage = document.getElementById("purchase-page"),
    submenu = [featured, characters, icons, crates, purchase],
    subpage = [featuredPage, charactersPage, iconsPage, cratesPage, purchasePage];

function changePage(pageName) {
    submenu.forEach( item => {
        if (item.classList.contains("active")){ item.classList.remove("active"); }      // resets all submenu opacity to default
        if (item.className.includes(pageName)) { item.classList.add("active"); }   // sets targeted page submenu opacity to 100%
    })
    subpage.forEach( item => {
        if (item.classList.contains("grid")){ item.classList.remove("grid"); }      // resets all submenu display to default
        if (item.id.includes(pageName)) { item.classList.add("grid"); }   // sets targeted page display to grid
    })
}