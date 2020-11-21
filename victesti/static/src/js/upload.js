import Choices from "choices.js";
import $ from "cash-dom";
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
