/* eslint-disable no-undef */
import $ from "cash-dom";
import Glide from "@glidejs/glide";
import downloadAndZip  from "./downloadTest";
import {ajax} from "./ajax";
import { getCookie } from "./cookies";
import BulmaNotification from "./bulma-notification";

const glide = new Glide(".glide").mount();

const pageStyle = `<style>@media print {  
  img {
      height:99vh;
      width:auto;
      page-break-after: always;
  }
}</style>`;


$('#openImageButton').on('click', () => {
    window.open($(".gallery-image").eq(glide.index).attr('src'));
});

$('#downloadTestButton').on('click', () => {
    let urls = [];
    $(".gallery-image").each((ind, el) => {
        urls.push($(el).attr('src'));
    });
    $('#fileProgressContainer').show();
    let id = window.location.href.split("/").slice(-1)[0];
    downloadAndZip(urls, id, updateProgressBar);
});

function updateProgressBar(e) {
    $('#fileUploadText').html(`Prenaša se datoteka...[${e.fileNumber}/${e.fileTotal}]`);
    progressBar.data("desired", e.totalPercentComplete.toString());
    if(e.isComplete) {
        $('#fileUploadText').html('Prenašanje končano!');
        setTimeout(() => {
            $('#fileProgressContainer').hide()
        }, 300);
    }
}

let progressAnimationSpeed = 2;
const progressBar = $("#fileUploadBar");

// Animate progress bar
setInterval(() => {
    let progressComplete = parseFloat(progressBar.data("desired"));
    let progressCurrent = parseFloat(progressBar.attr("value"));
    if (progressComplete !== progressCurrent) {
        if (
            Math.abs(progressCurrent - progressComplete) >
            progressAnimationSpeed
        ) {
            progressCurrent += progressAnimationSpeed;
        } else {
            progressCurrent = progressComplete;
        }
        progressBar.attr("value", progressCurrent.toString());
    }
}, 5);


$('#printTestButton').on('click', () => {
    let docString = "";
    docString += pageStyle;
    
    $(".gallery-image").each((ind, el) => {
        docString += el.outerHTML;
    });

    let popup = window.open();
    popup.document.write(docString);
    popup.document.close();
    popup.focus(); //required for IE
    popup.print();
    setTimeout(() => {
        popup.close()
    }, 1000);
});

$(document).ready(checkIfTestOwner)

function checkIfTestOwner() {
    if(!loggedIn){
        return;
    }

    let id = window.location.href.split("/").slice(-1)[0];
    ajax('POST', `/tests/api/${id}/is-owner`, [], getCookie('csrftoken'), 'json').then((xhr) => {
        if(xhr.status == 200) {
            if(xhr.response.owner){
                $('#deleteButton').show();
            }
        }
    });
}

$('#deleteButton').on('click', () => {
    $('#deleteModal').addClass('is-active');
})

$('.cancel-modal').on('click', (e) => {
    $(e.target).parents('.modal').removeClass('is-active')
})

$('#deleteModalButton').on('click', () => {
    let id = window.location.href.split("/").slice(-1)[0];
    ajax('POST', `/tests/api/${id}/delete`, [], getCookie('csrftoken'), 'json').then((xhr) => {
        if(xhr.status == 200) {
            const notification = new BulmaNotification('Test je bil uspešno odstranjen!', '.content', {
                type: 'success',
                prepend: true
            });
            $('#deleteModal').removeClass('is-active');
        } else {
            console.error('User is not owner of test!');
        }
    })
});
