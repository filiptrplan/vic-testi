/* eslint-disable no-undef */
import Choices from "choices.js";
import $ from "cash-dom";
import uploadFile from "./s3upload";
import { ajax } from "./ajax";
import { getCookie } from "./cookies";

// File input selectize
const fileChoices = new Choices("#filesInput", {
    removeItems: true,
    removeItemButton: true,
    duplicateItemsAllowed: false,
    searchEnabled: false,
    placeholder: "Nič datotek izbranih...",
});

fileChoices.showDropdown = function () {
    return;
};
// Prevent focusing on the file list
$("#fileList input").on("focus", (e) => {
    e.srcElement.blur();
    e.stopPropagation();
    e.preventDefault();
});

// File drag and drop functionality
const dropbox = $("#uploadBox");
dropbox.on("drop", (e) => {
    e.stopPropagation();
    e.preventDefault();

    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files[0]) {
        handleFiles(files);
    }
});
$(".uploader").on("change", (e) => {
    const files = e.srcElement.files;
    if (files && files[0]) {
        handleFiles(files);
    }
});
const preventFunc = (e) => {
    e.stopPropagation(), e.preventDefault();
};
dropbox.on("dragenter", preventFunc);
dropbox.on("dragover", preventFunc);

function handleFiles(files) {
    fileChoices.clearStore();
    fileLocations = [];
    for (let i = 0; i < files.length; i++) {
        fileChoices.setValue([{ value: files[i], label: files[i].name }]);
    }
}

// Load the choices for the professor select
const profChoices = new Choices("#professorInput", {
    removeItemButton: false,
    searchPlaceholderValue: "Profesor",
});

professorList.forEach((professor) => {
    profChoices.setChoices([{ value: professor.id, label: professor.name }]);
});

// Choices for year
const yearChoices = new Choices("#yearInput", {
    placeholder: true,
    placeholderValue: "Letnik",
    searchEnabled: false,
});

// Have to do this this way in order to have no default
yearChoices.setChoices([
    { value: 1, label: "1. letnik", selected: false },
    { value: 2, label: "2. letnik", selected: false },
    { value: 3, label: "3. letnik", selected: false },
    { value: 4, label: "4. letnik", selected: false },
]);

$("#uploadButton").on("click", () => {
    if(getCookie('FBConnected') == null || getCookie('FBConnected') == 0){
        // Throw error that you must be logged in to upload
        console.error('Not logged in!');
        return;
    }
    const files = fileChoices.getValue(true);
    if (files.length != 0) {
        uploadAllFiles(files, 0);
        
    }
});

let fileLocations = [];
const uploadFinishEvent = new Event('upload-finished');
document.addEventListener("upload-finished", () => {
    let parameters = {
        professorId: profChoices.getValue(true),
        fileLocations: fileLocations,
        year: yearChoices.getValue(true),
        fb_token: getCookie('FBAccessToken')
    };
    if ($("#noteCheckbox").get()[0].checked && $("#noteInput").val() != ''){
        parameters.note = $("#noteInput").val();
    }
    ajax("POST", createTestURL, parameters, getCookie("csrftoken"), 'json').then(
        (xhr) => {
            if (xhr.status == 200) {
                window.location.pathname = xhr.response.redirect;
            } else {
                // Failed
            }
        }
    );
});

function uploadAllFiles(files, i) {
    if (i == 0) {
        $("#fileProgressContainer").show();
    }
    if (i < files.length) {
        progressBar.data("desired", "0");
        progressBar.attr("value", "0");
        $("#fileUploadText").html(
            `Nalaga se: <code>${files[i].name}</code> [${i + 1}/${
                files.length
            }]`
        );
        uploadFile(files[i], updateProgressBar)
            .then((location) => {
                fileLocations.push(location);
                i++;
                uploadAllFiles(files, i);
            })
            .catch((e) => {
                console.log(e);
                return;
            });
    } else {
        $("#fileUploadText").html("Nalaganje končano!");
        document.dispatchEvent(uploadFinishEvent);
        return;
    }
}

let progressAnimationSpeed = 2;
const progressBar = $("#fileUploadBar");

function updateProgressBar(e) {
    if (e.lengthComputable) {
        let percentComplete = (e.loaded / e.total) * 100;
        $("#fileUploadBar").data("desired", percentComplete.toString());
    }
}

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

$('#noteCheckbox').on('click', (e) => {
    if(e.target.checked) {
        $('#noteInput').show();
    } else {
        $('#noteInput').hide();
    }
});

$('.choices').addClass('is-danger');