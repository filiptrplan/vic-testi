import JsZip from "jszip";
import FileSaver from "file-saver";
import { ajax } from "./ajax";
import { getCookie } from "./cookies";

function download(url, progressCallback) {
    return ajax("GET", url, [], "", "blob", progressCallback).then(
        (xhr) => new Blob([xhr.response])
    );
}

function downloadMany(urls, progressCallback) {
    return Promise.all(urls.map((url) => download(url, progressCallback)));
}

function exportZip(blobs, fileNames, zipFileName) {
    const zip = JsZip();
    blobs.forEach((blob, i) => {
        let extension = fileNames[i].split('.').slice(-1)[0];
        zip.file(`${zipFileName}-${i}.${extension}`, blob);
    });
    zip.generateAsync({ type: "blob" }).then((zipFile) => {
        const fileName = `${zipFileName}.zip`;
        return FileSaver.saveAs(zipFile, fileName);
    });
}

export default function downloadAndZip (urls, testId, progressCallback={}) {
    let fileCountProgress = 1;
    const fileCountTotal = urls.length;
    const customCallback = (e) => {
        let isComplete = false;
        let percentComplete = (e.loaded / e.total) * 100;
        let totalPercentComplete = (percentComplete / fileCountTotal) + (fileCountProgress - 1) * (100 / fileCountTotal);
        if(e.loaded == e.total && fileCountProgress == fileCountTotal){
            isComplete = true;
        }

        progressCallback({
            fileNumber: fileCountProgress+1,
            fileTotal: fileCountTotal,
            percentComplete: percentComplete,
            totalPercentComplete: totalPercentComplete,
            isComplete: isComplete
        });
        if (e.loaded == e.total) {
            fileCountProgress++;
        }
    }

    let fileNames = urls.map((url) =>
        url.slice(url.lastIndexOf("/") + 1, url.length)
    );
    return downloadMany(urls, customCallback).then((blobs) => {
        ajax('GET', `/tests/${testId}/ajax`, [], getCookie('csrftoken'), 'json').then((xhr) => {
            let r = xhr.response;
            let zipFileName = `test-${r.id}-${r.professor_first_name.toLowerCase()}-${r.professor_last_name.toLowerCase()}-${r.year}-letnik`;
            exportZip(blobs, fileNames, zipFileName);
        })
    });
}
