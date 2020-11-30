export function ajax(method, url, parameters=[], csrftoken='', responseType='', progressCallback=()=>{}) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        let paramString = getParamString(parameters);

        if(method.toLowerCase() == "post") xhr.open("POST", url, true);
        else if (method.toLowerCase() == "get") xhr.open("GET", url + "?" + paramString, true);

        xhr.setRequestHeader(
            "Content-Type",
            "application/x-www-form-urlencoded"
        );
        xhr.upload.addEventListener("progress", progressCallback);
        if(csrftoken != '') xhr.setRequestHeader("X-CSRFToken", csrftoken);
        if(responseType != '') xhr.responseType = responseType;


        if(method.toLowerCase() == "post") xhr.send(paramString);
        else if (method.toLowerCase() == "get") xhr.send();

        xhr.onload = function () {
            resolve(this);
        };
    });
}

export function getParamString(parameters) {
    let paramString = ''
    for (const param in parameters) {
        if (Array.isArray(parameters[param])) {
            parameters[param].forEach((value) => {
                paramString += `${param}=${value}&`;
            });
        } else {
            paramString += `${param}=${parameters[param]}&`;
        }
    }
    paramString = paramString.slice(0, -1);
    return paramString
}