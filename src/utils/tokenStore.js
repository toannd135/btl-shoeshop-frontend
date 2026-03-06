let accessToken = null;
let currentUser = null;

export const setAccessToken = (token) => {
    accessToken = token;
};

export const getAccessToken = () => {
    return accessToken;
};

export const clearAccessToken = () => {
    accessToken = null;
};

export const setCurrentUser = (user) => {
    currentUser = user;
};
export const getCurrentUser = () => {
    return currentUser;
};
export const clearCurrentUser = () => {
    currentUser = null;
};