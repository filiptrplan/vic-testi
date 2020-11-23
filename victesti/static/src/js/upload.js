import Choices from "choices.js";
import $ from "cash-dom";
import uploadFile from "./s3upload";
import ajax from "./ajax";
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
        year: yearChoices.getValue(true)
    };
    ajax("POST", createTestURL, parameters, getCookie("csrftoken")).then((text, status) => {
        if(status == 200){
            // Success
        } else {
            // Failed
        }
    });
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


export default function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === name + "=") {
                cookieValue = decodeURIComponent(
                    cookie.substring(name.length + 1)
                );
                break;
            }
        }
    }
    return cookieValue;
}