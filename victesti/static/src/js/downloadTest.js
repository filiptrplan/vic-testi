import JsZip from "jszip";
import FileSaver from "file-saver";
import { ajax } from "./ajax";

function download(url, progressCallback) {
    return ajax("GET", url, [], "", "blob", progressCallback).then(
        (xhr) => new Blob([xhr.response])
    );
}

function downloadMany(urls, progressCallback) {
    return Promise.all(urls.map((url) => download(url, progressCallback)));
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

export default function downloadAndZip (urls, progressCallback={}) {
    let fileCountProgress = 1;
    const fileCountTotal = urls.length;
    const customCallback = (e) => {
        let isComplete = false;
        let percentComplete = (e.loaded / e.total) * 100;
        let totalPercentComplete = (percentComplete / fileCountTotal) * fileCountProgress;
        if(e.loaded == e.total && fileCountProgress == fileCountTotal){
            isComplete = true;
        }

        progressCallback({
            fileNumber: fileCountProgress,
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
        exportZip(blobs, fileNames);
    });
}
