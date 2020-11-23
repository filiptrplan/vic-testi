export default function ajax(method, url, parameters, csrftoken, progressCallback=()=>{}) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        if(method.toLowerCase() == "post"){
            let paramString = "";
            for (const param in parameters) {
                paramString += `${param}=${parameters[param]}&`;
            }
            paramString = paramString.slice(0, -1);
            
            xhr.open("POST", url, true);
            xhr.setRequestHeader(
                "Content-Type",
                "application/x-www-form-urlencoded"
            );
            xhr.upload.addEventListener("progress", progressCallback);
            xhr.setRequestHeader("X-CSRFToken", csrftoken);

            xhr.send(paramString);
            xhr.onload = function () {
                resolve(this.responseText);
            };
        } else if (method.toLowerCase() == "get") {
            let paramString = "";
            for (const param in parameters) {
                paramString += `${param}=${parameters[param]}&`;
            }
            paramString = paramString.slice(0, -1);

            xhr.open("GET", url+'?'+paramString, true);
            xhr.setRequestHeader(
                "Content-Type",
                "application/x-www-form-urlencoded"
            );
            xhr.upload.addEventListener("progress", progressCallback);
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
            xhr.send();
            xhr.onload = function () {
                resolve(this.responseText);
            };
        }
    });
}