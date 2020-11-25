import $ from "cash-dom";
import Choices from "choices.js";
import ajax from "./ajax";

console.log('hi');

// Load the choices for the professor select
const profChoices = new Choices("#professorInput", {
    removeItemButton: true,
    searchPlaceholderValue: "Profesor",
});

professorList.forEach((professor) => {
    profChoices.setChoices([{ value: professor.id, label: professor.name }]);
});

// Load the choices for the professor select
const subjChoices = new Choices("#subjectInput", {
    removeItemButton: true,
    searchPlaceholderValue: "Predmet",
});

subjectList.forEach((subject) => {
    subjChoices.setChoices([{ value: subject.id, label: subject.name }]);
});

// Choices for year
const yearChoices = new Choices("#yearInput", {
    placeholder: true,
    removeItemButton: true,
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