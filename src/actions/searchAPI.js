import APIcall from './server';

export const getPostAPI = async (postId) => {
    return await APIcall({ method: 'GET', url: `posts/${postId}` });
};

export const getPostsAPI = async () => {
    return await APIcall({ method: 'GET', url: 'posts' });
};

export const submitPostAPI = async (body) => {
    return await APIcall({
        method: 'PUT',
        url: 'posts',
        body,
        withCredentials: true
    });
};

export const getMeAPI = async (token) => {
    return await APIcall({
        method: 'GET',
        url: 'auth/get-me',
        withCredentials: true,
        token
    });
};

export const loginAPI = async ({ email, password, googleToken, imageUrl }) => {
    const body = { email, password, googleToken, imageUrl };
    return await APIcall({
        method: 'POST',
        url: 'auth/login',
        body,
        withCredentials: true
    });
};

export const loginSuccessAPI = async () => {
    return await APIcall({
        method: 'GET',
        url: 'auth/login/success',
        withCredentials: true
    });
};

export const signupAPI = async (email, password) => {
    return await APIcall({
        body: { email, password },
        method: 'POST',
        url: 'auth/signup'
    });
};

export const testAuthAPI = async (before, after) => {
    return await APIcall({
        method: 'GET',
        url: 'check-auth'
    });
};

export const logoutAPI = async () => {
    return await APIcall({
        method: 'GET',
        url: 'auth/logout',
        withCredentials: true
    });
};

export const getConfigAPI = async () => {
    return await APIcall({
        method: 'GET',
        url: 'config'
    });
};
