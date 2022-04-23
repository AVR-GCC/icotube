
import axios from 'axios';
import APIcall from './server';

const baseURL = process.env.NODE_ENV === 'production' ? 'https://icotube-server.herokuapp.com' : 'http://localhost:5000';

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

export const loginAPI = async (email, password, googleToken, before, after) => {
    try {
        before();
        const result = await axios.post(`${baseURL}/auth/login`, { email, password, googleToken });
        after(result);
    } catch (e) {
        after(e);
    }
};

export const signupAPI = async (email, password, before, after) => {
    before();
    const result = await axios.post(`${baseURL}/auth/signup`, { email, password });
    after(result);
};

export const getConfigAPI = (before, after) => {
    APIcall({
        method: "GET",
        url: 'config',
        events: [before, after]
    });
};
