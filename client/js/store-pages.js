$(document).ready(function () {
    'use strict';

    function clickFeatured() {
        'use strict';
        document.getElementsByClassName("featured")[0].classList.add("active");
        document.getElementsByClassName("characters")[0].classList.remove("active");
        document.getElementsByClassName("icons")[0].classList.remove("active");
        document.getElementsByClassName("crates")[0].classList.remove("active");
        document.getElementsByClassName("purchase")[0].classList.remove("active");
        $('#featured-page').fadeIn('slow');
        $('#characters-page').fadeOut('fast');
        $('#icons-page').fadeOut('fast');
        $('#crates-page').fadeOut('fast');
        $('#purchase-page').fadeOut('fast');
    }

    function clickCharacters() {
        'use strict';
        document.getElementsByClassName("featured")[0].classList.remove("active");
        document.getElementsByClassName("characters")[0].classList.add("active");
        document.getElementsByClassName("icons")[0].classList.remove("active");
        document.getElementsByClassName("crates")[0].classList.remove("active");
        document.getElementsByClassName("purchase")[0].classList.remove("active");
        $('#featured-page').fadeOut('fast');
        $('#characters-page').fadeIn('slow');
        $('#icons-page').fadeOut('fast');
        $('#crates-page').fadeOut('fast');
        $('#purchase-page').fadeOut('fast');
    }

    function clickIcons() {
        'use strict';
        document.getElementsByClassName("featured")[0].classList.remove("active");
        document.getElementsByClassName("characters")[0].classList.remove("active");
        document.getElementsByClassName("icons")[0].classList.add("active");
        document.getElementsByClassName("crates")[0].classList.remove("active");
        document.getElementsByClassName("purchase")[0].classList.remove("active");
        $('#featured-page').fadeOut('fast');
        $('#characters-page').fadeOut('fast');
        $('#icons-page').fadeIn('slow');
        $('#crates-page').fadeOut('fast');
        $('#purchase-page').fadeOut('fast');
    }

    function clickCrates() {
        'use strict';
        document.getElementsByClassName("featured")[0].classList.remove("active");
        document.getElementsByClassName("characters")[0].classList.remove("active");
        document.getElementsByClassName("icons")[0].classList.remove("active");
        document.getElementsByClassName("crates")[0].classList.add("active");
        document.getElementsByClassName("purchase")[0].classList.remove("active");
        $('#featured-page').fadeOut('fast');
        $('#characters-page').fadeOut('fast');
        $('#icons-page').fadeOut('fast');
        $('#crates-page').fadeIn('slow');
        $('#purchase-page').fadeOut('fast');
    }

    function clickPurchase() {
        'use strict';
        document.getElementsByClassName("featured")[0].classList.remove("active");
        document.getElementsByClassName("characters")[0].classList.remove("active");
        document.getElementsByClassName("icons")[0].classList.remove("active");
        document.getElementsByClassName("crates")[0].classList.remove("active");
        document.getElementsByClassName("purchase")[0].classList.add("active");
        $('#featured-page').fadeOut('fast');
        $('#characters-page').fadeOut('fast');
        $('#icons-page').fadeOut('fast');
        $('#crates-page').fadeOut('fast');
        $('#purchase-page').fadeIn('slow');
    }

    $('.featured').click(function () {
        clickFeatured();
    });
    $('.characters').click(function () {
        clickCharacters();
    });
    $('.icons').click(function () {
        clickIcons()
    });
    $('.crates').click(function () {
        clickCrates()
    });
    $('.purchase').click(function () {
        clickPurchase();
    });
});