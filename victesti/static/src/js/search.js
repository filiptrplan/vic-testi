import $ from "cash-dom";
import Choices from "choices.js";
import { ajax, getParamString } from "./ajax.js";
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
const searchEnterDelay = 1000;
const csrftoken = getCookie("csrftoken");
const testTemplate = $("#testSearchTemplate").contents();
const resultsContainer = $("#resultsContainer");
let currentPage = 1;
let searchFromEnterTimestamp = 0;

const sortChoices = new Choices("#sortInput", {
    searchEnabled: false,
    shouldSort: false
});
const paginationChoices = new Choices("#paginationInput", {
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

$("#searchInput").on("input", (e) => {
    let d = new Date();
    prevInputTime = d.getTime();
    setTimeout(() => {
        let dn = new Date();
        // If they hit enter after a query, don't search twice
        if(dn.getTime() - searchFromEnterTimestamp < searchDelay + searchEnterDelay){
            return;
        }
        if (dn.getTime() - prevInputTime > searchDelay) {
            search(e.target.value);
        }
    }, searchDelay + 5)
});

$("#searchButton").on("click", () => {
    search($("#searchInput").val());
})

function search(query){
    resultsContainer.html("");
    $(".loader-wrapper").addClass("is-active");
    $("#noResultsContainer").hide();
    $("#searchPagination").hide();

    const yearParam = yearChoices.getValue(true);
    const profParam = profChoices.getValue(true);
    const subjectParam = subjChoices.getValue(true);

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("page")) {
        currentPage = parseInt(urlParams.get("page"));
    }

    let paramData = { 
        query: query,
        sort: sortChoices.getValue(true),
        pagination: paginationChoices.getValue(true),
        page: currentPage
    };

    if(typeof(yearParam) != "undefined") paramData["year"] = yearParam;
    if(typeof(profParam) != "undefined") paramData["prof"] = profParam;
    if(typeof(subjectParam) != "undefined") paramData["subject"] = subjectParam;

    // Reflect the search in the history
    let params = 'search?search&' + getParamString(paramData);
    history.pushState({}, 'Iskanje', params);
    
    ajax("GET", "/tests/search/ajax", paramData, csrftoken, "json").then((xhr) => {
        let response = xhr.response;
        if(response.tests.length != 0) {
            for(let testID in response.tests){
                let newResult = testTemplate.clone();
                let test = response.tests[testID];
                resultsContainer.append(newResult);

                // Necessary to make the dropdown buttons work
                $(newResult).contents().find("input[name='testId']").val(test.id);

                // Set the test link
                $(newResult).contents().find(".test-link").attr("href", `/tests/${test.id}`)

                // Set the upload date
                let uploadDate = new Date(test.created_at);
                let uploadDateString = new Intl.DateTimeFormat("sl-SI").format(uploadDate);
                $(newResult).contents().find(".test-date").html(uploadDateString);
                
                let professor = findFirst(professorList, {id: test.professor_id});
                $(newResult).contents().find(".test-title").html(
                    `${professor.name} - ${test.year}. letnik`
                );

                let subject = findFirst(subjectList, {id: professor.subject_id});
                let subtitleText = `Test - ${subject.name}`;
                if(test.additional_note) {
                    subtitleText += ` (${test.additional_note})`;
                }
                $(newResult).contents().find(".test-subtitle").html(subtitleText);
            }
            refreshHandlers();
            generatePagination(currentPage, response.page_count);
        } else {
            $("#noResultsContainer").show();
        }
        $(".loader-wrapper").removeClass("is-active");
    });
}

$("#advancedSearchButton").on("click", () => {
    slideToggle($("#advancedSearch").get()[0]);
})

function getSearchFromParams() {
    const urlParams = new URLSearchParams(window.location.search);
    if(urlParams.has("page")) {
        currentPage = parseInt(urlParams.get("page"));
    }
    if(urlParams.has("pagination")){
        paginationChoices.setChoiceByValue(parseInt(urlParams.get("pagination")));
    }
    if(urlParams.has("sort")){
        sortChoices.setChoiceByValue(urlParams.get("sort"));
    }
    if(urlParams.has("professor")){
        profChoices.setChoiceByValue(parseInt(urlParams.get("professor")));
    }
    if(urlParams.has("subject")){
        subjChoices.setChoiceByValue(parseInt(urlParams.get("subject")));
    }
    if(urlParams.has("year")){
        console.log(urlParams.get("year"));
        yearChoices.setChoiceByValue(parseInt(urlParams.get("year")));
    }
    if(urlParams.has("search")){
        search("");
    }
    if (urlParams.has("advanced")) {
        $("#advancedSearch").show();
    }
}

function updateProgressBar(e, progressContainer) {
    let progressBar = progressContainer.children(".file-upload-bar");
    let progressText = progressContainer.children('.file-upload-text');
    progressText.html(
        `Prenaša se datoteka...[${e.fileNumber}/${e.fileTotal}]`
    );
    progressBar.data("desired", e.totalPercentComplete.toString());
    console.log(e.totalPercentComplete.toString());
    if (e.isComplete) {
        progressText.html("Prenašanje končano!");
        setTimeout(() => {
            progressContainer.hide();
        }, 300);
    }
}

const progressAnimationSpeed = 2;

function animateProgressBar(progressBar) {
    // Animate progress bar
    setInterval(
        (progressBar) => {
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
        },
        5,
        progressBar
    );
}

function refreshHandlers() {
    $(".test-result").on("click", (e) => {
        if($(e.target).hasClass("test-title")) return;
        let dropdown = $(e.target)
            .parents(".test-result")
            .siblings(".test-dropdown")
            .get()[0];
        slideToggle(dropdown);
    });
    $(".downloadTestButton").on("click", (e) => {
        let id = $(e.target).siblings("input[type='hidden']").attr("value");
        let progressContainer = $(e.target).parents('.test-dropdown').children('.file-progress-container');
        progressContainer.show();
        let progressBar = progressContainer.children(".file-upload-bar");
        animateProgressBar(progressBar);
        ajax("GET", `/tests/${id}/links`, [], csrftoken, "json").then((xhr) => {
            downloadAndZip(xhr.response.links, (e) => {
                updateProgressBar(e, progressContainer);
            });
        });
    });

    $(".openTestButton").on("click", (e) => {
        let id = $(e.target).siblings("input[type='hidden']").attr("value");
        window.location.href = `/tests/${id}`;
    });

    $(".printTestButton").on("click", (e) => {
        let docString = "";
        docString += pageStyle;

        let id = $(e.target).siblings("input[type='hidden']").attr("value");
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

const paginationLink = $('#paginationLinkTemplate').contents();
const paginationEllipsis = $('#paginationEllipsisTemplate').contents();

function generatePagination(currPage, totalPages) {
    const searchPagination = $('#searchPagination');
    const paginationList = $('#searchPagination ul');
    searchPagination.css('display', 'flex');
    paginationList.html('');
    
    if(currPage != 1){
        searchPagination.children('.pagination-previous').attr('href', makePageLink(currPage-1));
    }
    if(currPage != totalPages){
        searchPagination.children('.pagination-next').attr('href', makePageLink(currPage+1));
    }

    if(totalPages > 3) {
        if(currPage >= 3 && totalPages - currPage > 1) {
            addPaginationLink(paginationList, 1);
            addPaginationLink(paginationList, 0, false, true);
            
            addPaginationLink(paginationList, currPage-1);
            addPaginationLink(paginationList, currPage, true);
            addPaginationLink(paginationList, currPage+1);

            addPaginationLink(paginationList, 0, false, true);
            addPaginationLink(paginationList, totalPages);
        } else if (currPage == 2) {
            addPaginationLink(paginationList, currPage - 1);
            addPaginationLink(paginationList, currPage, true);
            addPaginationLink(paginationList, currPage + 1);

            addPaginationLink(paginationList, 0, false, true);
            addPaginationLink(paginationList, totalPages);
        } else if (totalPages - currPage == 1) {
            addPaginationLink(paginationList, 1);
            addPaginationLink(paginationList, 0, false, true);
            
            addPaginationLink(paginationList, currPage - 1);
            addPaginationLink(paginationList, currPage, true);
            addPaginationLink(paginationList, currPage + 1);
        } else if (currPage == 1){
            addPaginationLink(paginationList, currPage, true);
            addPaginationLink(paginationList, currPage + 1);
            addPaginationLink(paginationList, currPage + 2);

            addPaginationLink(paginationList, 0, false, true);
            addPaginationLink(paginationList, totalPages);
        } else if (currPage == totalPages) {
            addPaginationLink(paginationList, 1);
            addPaginationLink(paginationList, 0, false, true);

            addPaginationLink(paginationList, currPage - 2);
            addPaginationLink(paginationList, currPage - 1);
            addPaginationLink(paginationList, currPage, true);
        }
    } else {
        for(let i = 1; i <= totalPages; i++){
            if(i == currPage) {
                addPaginationLink(paginationList, i, true);
            } else {
                addPaginationLink(paginationList, i);
            }
        }
    }
}

function addPaginationLink(paginationList, linkNumber, isCurrent=false, isEllipsis=false) {
    if(!isEllipsis){
        let link = paginationLink.clone();
        paginationList.append(link);

        let linkA = link.contents();
        linkA.html(linkNumber);

        if(isCurrent) {
            linkA.addClass('is-current');
            linkA.attr('href', '#');
        } else {

            linkA.attr('href', makePageLink(linkNumber));
        }
    } else {
        let link = paginationEllipsis.clone();
        paginationList.append(link)
    }
}

function makePageLink(pageNumber) {
    let urlParams = new URLSearchParams(window.location.search);
    urlParams.set("page", pageNumber);
    return window.location.origin + window.location.pathname + '?' + urlParams.toString()
}

$(window).on("load", () => {
    refreshHandlers();
    getSearchFromParams();
})

$(document).on('keydown', (e) => {
    // 13 is Enter key
    if(e.keyCode == 13) {
        e.preventDefault();
        e.stopPropagation();
        searchFromEnterTimestamp = new Date().getTime();
        console.log(searchFromEnterTimestamp);
        search($("#searchInput").val());
    }
});