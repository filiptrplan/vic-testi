import $ from "cash-dom";
import Choices from "choices.js";
import ajax from "./ajax.js";
import downloadAndZip from "./downloadTest.js";
import { slideToggle } from "./slideAnimations";
import { findFirst } from "find-object";
import { getCookie } from "./cookies";

const pageStyle = `<style>@media print {  
  img {
      height:99vh;
      width:auto;
      page-break-after: always;
  }
}</style>`;
// Delay between input events before ajax query executes
const searchDelay = 1000;
const csrftoken = getCookie('csrftoken');
const testTemplate = $("#test-search-template").contents();
const resultsContainer = $("#resultsContainer");

refreshHandlers();

const sortChoices = new Choices("#sortInput", {
    searchEnabled: false,
    shouldSort: false
});

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


let prevInputTime = 0;

$('#searchInput').on('input', (e) => {
    let d = new Date();
    prevInputTime = d.getTime();
    setTimeout(() => {
        let dn = new Date();
        if (dn.getTime() - prevInputTime > searchDelay) {
            search(e.target.value);
        }
    }, searchDelay + 5)
});

$("#searchButton").on('click', () => {
    search($('#searchInput').val());
})

function search(query){
    const yearParam = yearChoices.getValue(true);
    const profParam = profChoices.getValue(true);
    const subjectParam = subjChoices.getValue(true);

    let paramData = { query: query , sort: sortChoices.getValue(true) };

    if(typeof(yearParam) != "undefined") paramData['year'] = yearParam;
    if(typeof(profParam) != "undefined") paramData['prof'] = profParam;
    if(typeof(subjectParam) != "undefined") paramData['subject'] = subjectParam;
    
    ajax('GET', '/tests/search/ajax', paramData, csrftoken, 'json').then((xhr) => {
        let response = xhr.response;
        resultsContainer.html('');

        for(let testID in response.tests){
            let newResult = testTemplate.clone();
            let test = response.tests[testID];
            resultsContainer.append(newResult);
            // Necessary to make the dropdown buttons work
            $(newResult).contents().find('input[name="testId"]').val(test.id);

            // Set the test link
            $(newResult).contents().find('.test-link').attr('href', `/tests/${test.id}`)
            
            // Set the ID number 
            $(newResult).contents().find('.test-id').html(`ID: ${test.id}`);
            
            let professor = findFirst(professorList, {id: test.professor_id});
            $(newResult).contents().find('.test-title').html(
                `${professor.name} - ${test.year}. letnik`
            );
        }
        refreshHandlers();
    });
}

function refreshHandlers() {
    $(".test-result").on("click", (e) => {
        if($(e.target).hasClass('test-title')) return;
        let dropdown = $(e.target)
            .parents(".test-result")
            .siblings(".test-dropdown")
            .get()[0];
        slideToggle(dropdown);
    });
    $(".downloadTestButton").on("click", (e) => {
        let id = $(e.target).siblings('input[type="hidden"]').attr("value");
        ajax("GET", `/tests/${id}/links`, [], csrftoken, "json").then((xhr) => {
            downloadAndZip(xhr.response.links);
        });
    });

    $(".openTestButton").on("click", (e) => {
        let id = $(e.target).siblings('input[type="hidden"]').attr("value");
        window.location.href = `/tests/${id}`;
    });

    $(".printTestButton").on("click", (e) => {
        let docString = "";
        docString += pageStyle;

        let id = $(e.target).siblings('input[type="hidden"]').attr("value");
        ajax("GET", `/tests/${id}/links`, [], csrftoken, "json").then((xhr) => {
            xhr.response.links.forEach((link) => {
                docString += `<img src="${link}">`;
            });

            let popup = window.open();
            popup.document.write(docString);
            popup.document.close();
            popup.focus(); //required for IE
            popup.print();
            setTimeout(() => {
                popup.close();
            }, 1000);
        });
    });
}