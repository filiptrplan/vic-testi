import $ from "cash-dom";
import { setCookie, getCookie, eraseCookie } from "./cookies";
import BulmaNotification from './bulma-notification';

let facebookConnectedInit = false;
let facebookInitCheck = false;

if(getCookie('FBConnected') == null){
    setCookie('FBConnected', '0');
}

if(getCookie('FBConnected') == 0) {
    facebookConnectedInit = false;
    $("#facebookLoginButton").html("PRIJAVA S FACEBOOKOM");
    $("#facebookName").html("");
} else if (getCookie('FBConnected') == 1){
    facebookConnectedInit = true;
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
        if(getCookie('FBConnected') == 1) {
            FB.api('/me/permissions', 'delete', handleConnected);
        } else {
            FB.login(handleConnected, { scope: "groups_access_member_info" });
        }
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
    FB.getLoginStatus(handleConnected);
};

function handleConnected(response){
    if (response.status == "connected") {
        $('#facebookLoginButton').html('ODJAVA');
        FB.api('/me', (response) => {
            $('#facebookName').html(`(${response.name})`);
            setCookie('FBName', response.name);
        });
        setCookie('FBConnected', '1');
        setCookie('FBAccessToken', response.authResponse.accessToken);
    } else {
        if(facebookConnectedInit && !facebookInitCheck) {
            const warning = new BulmaNotification(`
            Za pravilno delovanje strani prosim dovolite VSE piškotke.
            `, '.content', {
                prepend: true,
                type: 'warning'
            });
        } else {
            $('#facebookLoginButton').html('PRIJAVA S FACEBOOKOM');
            $('#facebookName').html('');
            setCookie('FBConnected', '0');
            eraseCookie('FBAccessToken');
        }
        facebookInitCheck = true;
    }
}
