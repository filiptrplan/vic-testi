import $ from "cash-dom";
import { setCookie, getCookie } from "./cookies";

let facebookConnected = false;

if(getCookie('FBConnected') == null){
    setCookie('FBConnected', '0');
}

if(getCookie('FBConnected') == 0) {
    facebookConnected = false;
    $("#facebookLoginButton").html("PRIJAVA S FACEBOOKOM");
    $("#facebookName").html("");
} else if (getCookie('FBConnected') == 1){
    facebookConnected = true;
    $("#facebookLoginButton").html("ODJAVA");
    $("#facebookName").html(`(${getCookie('FBName')})`);
}

$(document).ready(function () {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").on("click", function () {
        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");
    });

    $('#facebookLoginButton').on('click', () => {
        if(facebookConnected) {
            FB.logout(handleConnected); 
        } else {
            FB.login(handleConnected)
        }
    });
});

window.fbAsyncInit = function () {
    FB.init({
        appId: "667076580621527",
        autoLogAppEvents: true,
        xfbml: true,
        version: "v9.0",
    });
    FB.getLoginStatus(handleConnected);
};

function handleConnected(response){
    if (response.status == "connected") {
        facebookConnected = true;
        $('#facebookLoginButton').html('ODJAVA');
        FB.api('/me', (response) => {
            $('#facebookName').html(`(${response.name})`);
            setCookie('FBName', response.name);
        })
        setCookie('FBConnected', '1');
    } else {
        facebookConnected = false;
        $('#facebookLoginButton').html('PRIJAVA S FACEBOOKOM');
        $('#facebookName').html('');
        setCookie('FBConnected', '0');
    }
}
