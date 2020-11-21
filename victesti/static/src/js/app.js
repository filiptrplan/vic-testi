import "choices.js";
import $ from "cash-dom";
import Choices from "choices.js";

// For now this document will contain all the javascript, when it gets too
// much, split it into smaller files

// Bulma mobile menu toggle
$(document).ready(function () {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").on('click', function () {
        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        $(".navbar-burger").toggleClass("is-active");
        $(".navbar-menu").toggleClass("is-active");
    });
});

// File input selectize
const fileChoices = new Choices('#filesInput', {
    removeItems: true,
    removeItemButton: true,
    duplicateItemsAllowed: false,
    searchEnabled: false,
    placeholder: 'Nič datotek izbranih...'
});

fileChoices.showDropdown = function(){
    return;
}

$('#fileList input').on('focus', (e) => {
    e.srcElement.blur();
    e.stopPropagation();
    e.preventDefault();
});

const dropbox = $('#uploadBox');
dropbox.on('drop', (e) => {
    e.stopPropagation();
    e.preventDefault();

    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files[0]) {
        handleFiles(files);
    }
});
$('.uploader').on('change', (e) => {
    const files = e.srcElement.files;
    if (files && files[0]) {
        handleFiles(files);
    }
});
const preventFunc = (e) => { e.stopPropagation(), e.preventDefault(); }
dropbox.on('dragenter', preventFunc);
dropbox.on('dragover', preventFunc);

function handleFiles(files){
    console.log(files);
    fileChoices.clearStore();
    for(let i = 0; i < files.length; i++){
        fileChoices.setValue([{ value: files[i], label: files[i].name }]);
    }
}

const profChoices = new Choices("#professorInput", {
    removeItemButton: false,
    searchPlaceholderValue: "Profesor",
    choices: [
        // Only placeholder for now
        {
            value: 0,
            label: "Barbara Černe Gresl",
        },
        {
            value: 1,
            label: "Alenka Mozer",
        },
        {
            value: 2,
            label: "Tadeja Rudolf",
        },
    ],
    callbackOnInit: () => {
        // Load ajax choices
    },
});