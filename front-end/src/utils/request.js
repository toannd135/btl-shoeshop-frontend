const API_DOMAIN = "http://localhost:8080/api/v1/";
export const get = async (path) => {
    const response = await fetch(API_DOMAIN + path);
    const result = await response.json();
    return result;
}

export const post = async (path, options) => {
    const response = await fetch(API_DOMAIN + path, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(options)
    });
    const result = await response.json();
    return result;
}
export const del = async (path) => {
    const response = await fetch(API_DOMAIN + path, {
        method: "DELETE",
    })
    const result = await response.json();
    return result;
}
export const dele = async (path) => {
    const response = await fetch(API_DOMAIN + path, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Request failed");
    }

    return true; 
}

export const edit = async (path, options) => {
    const response = await fetch(API_DOMAIN + path, {
        method: "PUT",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(options)
    })

    const result = await response.json();
    return result;
}
export const getPage = async (path, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_DOMAIN + path}?${queryString}` : API_DOMAIN + path;
    const response = await fetch(url);
    const res = await response.json();
    return res;
}