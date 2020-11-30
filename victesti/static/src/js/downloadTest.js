import JsZip from "jszip";
import FileSaver from "file-saver";
import { ajax } from "./ajax";

function download(url) {
    return ajax("GET", url, [], "", "blob").then(
        (xhr) => new Blob([xhr.response])
    );
}

function downloadMany(urls) {
    return Promise.all(urls.map((url) => download(url)));
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

export default function downloadAndZip (urls) {
    let fileNames = urls.map((url) =>
        url.slice(url.lastIndexOf("/") + 1, url.length)
    );
    return downloadMany(urls).then((blobs) => {
        exportZip(blobs, fileNames);
    });
}
