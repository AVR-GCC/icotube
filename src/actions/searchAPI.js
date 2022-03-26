
import axios from 'axios';
import APIcall from './server';

const baseURL = process.env.SERVER_URL || 'http://localhost:5000';

export const getPostsAPI = (before, after) => {
    console.log('env!');
    console.log(process.env);
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
}
