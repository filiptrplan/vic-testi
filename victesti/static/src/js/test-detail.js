/* eslint-disable no-undef */
import $ from "cash-dom";
import Glide from "@glidejs/glide";
import downloadAndZip  from "./downloadTest";

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
    downloadAndZip(urls);
});

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

