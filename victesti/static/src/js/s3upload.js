import { sha256 } from "js-sha256";
import "./ajax";
import ajax from "./ajax";

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === name + "=") {
                cookieValue = decodeURIComponent(
                    cookie.substring(name.length + 1)
                );
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie("csrftoken");

/**
 * Retrieve pre-signed POST data from a dedicated API endpoint.
 * @returns {Promise<any>}
 */
const getPresignedPostData = (file) => {
    return new Promise((resolve) => {
        // Set the proper URL here. Is set on the HTML template
        const url = s3signatureURL;

        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        fileReader.onload = () => {
            let arrayBuffer = fileReader.result;
            let fileHash = sha256(arrayBuffer);
            let fileName = fileHash + '.' + file.name.split(".").pop();

            ajax('POST', url, { file_name: fileName }, csrftoken).then((responseText)=>{
                resolve(JSON.parse(responseText));
            });
        }
    });
};
/**
 * Upload file to S3 with previously received pre-signed POST data.
 * @param presignedPostData
 * @param file
 * @returns {Promise<any>}
 */
const uploadFileToS3 = (presignedPostData, file, updateProgressBar) => {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        Object.keys(presignedPostData.fields).forEach((key) => {
            formData.append(key, presignedPostData.fields[key]);
        });
        // Actual file has to be appended last.
        formData.append("file", file);
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", updateProgressBar);
        xhr.open("POST", presignedPostData.url, true);
        xhr.send(formData);
        xhr.onload = function () {
            this.status === 204 ? resolve() : reject(this.responseText);
        };
    });
};

export default function uploadFile(file, updateProgressBar) {
    return new Promise((resolve, reject) => {
        getPresignedPostData(file).then((presignedPostData) => {
            uploadFileToS3(presignedPostData, file, updateProgressBar)
                .then(() => {
                    resolve();
                })
                .catch((e) => {
                    reject(e);
                });
        });
    });
}
