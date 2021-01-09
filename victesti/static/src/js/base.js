import $ from "cash-dom";
import {ajax} from './ajax';
import getCookie from './cookies';

$(document).ready(function () {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").on("click", function () {
        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");
    });
});

window.fbAsyncInit = function () {
    FB.init({
        appId: "667076580621527",
        //autoLogAppEvents: true,
        xfbml: true,
        cookie: true,
        version: "v9.0",
    });
};

function login() {
    FB.login(handleConnected);
}

function logout() {
    FB.api("/me/permissions", "delete", handleConnected);
    ajax("POST", "/api/logout", [], getCookie('csrftoken'), 'json')
}

function handleConnected(response){
    if (response.status == "connected") {
        ajax("POST", "/api/login", {
            fb_token: response.authResponse.accessToken,
        }, getCookie('csrftoken'), 'json');
    }
}
