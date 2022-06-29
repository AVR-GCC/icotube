import axios from 'axios';
import { getToken } from '../utils'
export const baseURL = process.env.NODE_ENV === 'production' ? 'https://icotube-server.herokuapp.com' : 'http://localhost:5000';

const functions = {
    GET: axios.get,
    PUT: axios.put,
    POST: axios.post
}

const APIcall = async ({
    url,
    method,
    body,
    withCredentials = false,
    token = getToken()
}) => {
    console.log('----- API Call -----');
    console.log('url:', url);
    console.log('method:', method);
    console.log('body:', body);
    let res = null;
    const headers = { "Content-Type": "application/json" };
    if (withCredentials) headers.Authorization = token;
    const fullUrl = `${baseURL}/${url}`;
    const options = {
        withCredentials,
        headers
    };
    const params = method === 'GET'
        ? [fullUrl, options]
        : [fullUrl, body, options];
    try {
        res = await functions[method](...params);
    } catch (e) {
        res = e;
    }
    console.log(`API Call ${url} returned::`);
    console.log('res:', res);
    console.log('--------------------');
    return res;
}

export default APIcall;