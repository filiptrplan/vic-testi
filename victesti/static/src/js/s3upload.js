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
const getPresignedPostData = (fileName) => {
    return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();

        // Set the proper URL here.
        const url = s3signatureURL;

        xhr.open("POST", url, true);
        xhr.setRequestHeader(
            "Content-Type",
            "application/x-www-form-urlencoded"
        );
        xhr.setRequestHeader("X-CSRFToken", csrftoken);
        xhr.send(`file_name=${fileName}`);
        xhr.onload = function () {
            resolve(JSON.parse(this.responseText));
        };
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
        getPresignedPostData(file.name).then((presignedPostData) => {
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
