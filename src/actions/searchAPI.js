import axios from 'axios';
import APIcall from './server';
import { getToken } from '../utils'

export const baseURL = process.env.NODE_ENV === 'production' ? 'https://icotube-server.herokuapp.com' : 'http://localhost:5000';

export const getPostsAPI = (before, after) => {
    APIcall({
        method: "GET",
        url: 'posts',
        events: [before, after]
    });
};

export const submitPostAPI = async (body, before, after) => {
    before();
    const result = await axios.put(`${baseURL}/posts`, body);
    after(result);
};

export const loginAPI = async ({ email, password, googleToken, imageUrl, before = () => {}, after = () => {} }) => {
    try {
        before();
        const result = await axios.post(`${baseURL}/auth/login`, { email, password, googleToken, imageUrl }, { withCredentials: true });
        after(result);
    } catch (e) {
        after(e);
    }
};

export const loginSuccessAPI = async () => {
    try {
        const result = await axios.get(`${baseURL}/auth/login/success`, { withCredentials: true });
        return (result);
    } catch (e) {
        return e;
    }
};

export const signupAPI = async (email, password, before, after) => {
    before();
    const result = await axios.post(`${baseURL}/auth/signup`, { email, password });
    after(result);
};

export const testAuthAPI = async (before, after) => {
    before();
    const result = await axios.get(`${baseURL}/check-auth`, { withCredentials: true, headers: { Authorization: `Bearer ${getToken()}` } });
    after(result);
};

export const logoutAPI = async () => {
    try {
        await axios.get(`${baseURL}/auth/logout`, {}, { withCredentials: true });
    } catch (e) {
        console.log('e', e);
    }
};

export const getConfigAPI = (before, after) => {
    APIcall({
        method: "GET",
        url: 'config',
        events: [before, after]
    });
};
