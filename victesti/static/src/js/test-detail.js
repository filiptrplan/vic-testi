/* eslint-disable no-undef */
import $ from "cash-dom";
import Glide from "@glidejs/glide";
import JsZip from "jszip";
import FileSaver from "file-saver";
import ajax from "./ajax";

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
    console.log(docString);
    popup.document.write(docString);
    popup.document.close();
    popup.focus(); //required for IE
    popup.print();
    setTimeout(() => {
        popup.close()
    }, 1000);
});

function download(url) {
    return ajax("GET", url, [], '', 'blob').then((xhr) => new Blob([xhr.response]));
}

function downloadMany(urls) {
    return Promise.all(urls.map(url => download(url)));
}

function exportZip(blobs, fileNames) {
    const zip = JsZip();
    blobs.forEach((blob, i) => {
        zip.file(fileNames[i], blob);
    });
    zip.generateAsync({ type: "blob" }).then((zipFile) => {
        const currentDate = new Date().getTime();
        const fileName = `test-${currentDate}.zip`;
        return FileSaver.saveAs(zipFile, fileName);
    });
}

function downloadAndZip (urls) {
    let fileNames = urls.map(url => url.slice(url.lastIndexOf("/")+1, url.length))
    console.log(fileNames);
    return downloadMany(urls).then((blobs) => {
        exportZip(blobs, fileNames)
    });
}