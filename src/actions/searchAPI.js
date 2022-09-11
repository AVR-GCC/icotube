import APIcall from './server';

export const deletePostAPI = async (postId) => {
    const response = await APIcall({ method: 'DELETE', url: `posts/${postId}`, withCredentials: true });
    if (response.data?.success) return { success: true };
    return response;
};

export const getPostAPI = async (postId) => {
    const response = await APIcall({ method: 'GET', url: `posts/${postId}` });
    if (response.data?.success) return response?.data?.data;
    return response;
};

export const getPostsAPI = async ({
    skip = 0,
    limit,
    sort = { startDate: -1 },
    filter = {},
    category
}) => {
    const today = new Date();
    let categoryFilter = { startDate: { $gt: today } };
    if (category === 'running') {
        categoryFilter = { startDate: { $lte: today }, $or: [{ endDate: null }, { endDate: { $gte: today } }] };
    }
    if (category === 'ended') {
        categoryFilter = { endDate: { $lt: today } };
    }
    let url = `posts?skip=${skip}&sort=${JSON.stringify(sort)}&filter=${JSON.stringify({ ...filter, ...categoryFilter })}`;
    if (limit) {
        url += `&limit=${limit}`;
    }
    return await APIcall({ method: 'GET', url });
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
