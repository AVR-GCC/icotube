import APIcall from './server';

export const resetPasswordAPI = async (email) => {
    const body = { email };
    const response = await APIcall({
        method: 'PUT',
        url: 'auth/reset-password',
        body,
        withCredentials: true
    });
    return response;
};

export const changeAvatarAPI = async (avatarUrl) => {
    const response = await APIcall({ method: 'PUT', url: 'auth/change-avatar', body: { avatarUrl } });
    if (response.data?.success) return { success: true };
    return response;
};

export const likePostAPI = async (postId) => {
    const response = await APIcall({ method: 'PUT', url: `posts/${postId}/like` });
    if (response.data?.success) return response?.data?.data;
    return response;
};

export const deletePostAPI = async (postId) => {
    const response = await APIcall({ method: 'DELETE', url: `posts/${postId}`, withCredentials: true });
    if (response.data?.success) return { success: true };
    return response;
};

export const resendConfirmationAPI = async (email) => {
    const response = await APIcall({ method: 'PUT', body: { email }, url: `auth/resend-confirmation` });
    if (response.data?.success) return { success: true };
    return response;
}

export const getPostAPI = async (postId) => {
    return await APIcall({ method: 'GET', url: `posts/${postId}` });
};

export const getPostsAPI = async ({
    skip = 0,
    limit,
    sort = { startDate: -1 },
    filter = {},
    category,
    noVideo = false
}) => {
    const today = new Date();
    let categoryFilter = { startDate: { $gt: today } };
    if (category === 'running') {
        categoryFilter = { startDate: { $lte: today }, $or: [{ endDate: null }, { endDate: { $gte: today } }] };
    }
    if (category === 'ended') {
        categoryFilter = { endDate: { $lt: today } };
    }
    let videoFilter = { $and: [{ videoUrl: { $ne: '' } }, { videoUrl: { $exists: true } }] };
    if (noVideo) {
        videoFilter = { $or: [{ videoUrl: '' }, { videoUrl: { $exists: false } }] };
    }
    const allFilters = { $and: [] };
    allFilters.$and.push(categoryFilter);
    allFilters.$and.push(videoFilter);
    let url = `posts?skip=${skip}&sort=${JSON.stringify(sort)}&filter=${JSON.stringify({ ...filter, ...allFilters })}`;
    // let url = `posts?skip=${skip}&sort=${JSON.stringify(sort)}&filter=${JSON.stringify({ ...filter, ...categoryFilter })}`;
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

export const addAlertAPI = async (email) => {
    return await APIcall({
        method: 'PUT',
        url: `alert/${email}`
    });
};

export const removeAlertAPI = async (email) => {
    return await APIcall({
        method: 'DELETE',
        url: `alert/${email}`
    });
};
