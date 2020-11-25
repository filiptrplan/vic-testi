import { sha256 } from "js-sha256";
import "./ajax";
import ajax from "./ajax";
import getCookie from "./upload";

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

            ajax('POST', url, { file_name: fileName }, csrftoken).then((xhr)=>{
                resolve(JSON.parse(xhr.responseText));
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
            this.status === 204
                ? resolve(this.getResponseHeader("Location"))
                : reject(this.responseText);
        };
    });
};

export default function uploadFile(file, updateProgressBar) {
    return new Promise((resolve, reject) => {
        getPresignedPostData(file).then((presignedPostData) => {
            uploadFileToS3(presignedPostData, file, updateProgressBar)
                .then((location) => {
                    resolve(location);
                })
                .catch((e) => {
                    reject(e);
                });
        });
    });
}
