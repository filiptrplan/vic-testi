import Choices from "choices.js";
import $ from "cash-dom";
import uploadFile from "./s3upload";
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
    console.log(files);
    fileChoices.clearStore();
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

$('#testButton').on('click', () => {
    const files = fileChoices.getValue(true);
    if (files.length != 0){
        uploadAllFiles(files, 0);
    }
});

function uploadAllFiles(files, i){
    if(i == 0) {
        $('#fileProgressContainer').show()
    }
    if(i < files.length){
        progressBar.data("desired", "0");
        progressBar.attr("value", "0");
        $('#fileUploadText').html(`Nalaga se: <code>${files[i].name}</code> [${i+1}/${files.length}]`);
        uploadFile(files[i], updateProgressBar).then(() => {
            i++;
            uploadAllFiles(files, i);
        }).catch((e) => {
            console.log(e);
            return;
        });
    } else {
        $('#fileUploadText').html('Nalaganje končano!');
        return;
    }
}

let progressAnimationSpeed = 2;
const progressBar = $('#fileUploadBar');

function updateProgressBar(e){
    if (e.lengthComputable) 
    {  
        let percentComplete = (e.loaded / e.total) * 100;  
        $("#fileUploadBar").data("desired", percentComplete.toString());
    }
}

setInterval(() => {
    let progressComplete = parseFloat(progressBar.data('desired'));
    let progressCurrent = parseFloat(progressBar.attr('value'));
    if(progressComplete !== progressCurrent){
        if(Math.abs(progressCurrent - progressComplete) > progressAnimationSpeed){
            progressCurrent += progressAnimationSpeed;
        } else {
            progressCurrent = progressComplete;
        }
        progressBar.attr("value", progressCurrent.toString());
    }
}, 5);