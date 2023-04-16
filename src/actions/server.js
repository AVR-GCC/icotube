import axios from 'axios';

const verbose = false;
export const baseURL = process.env.SERVER_URL;

const functions = {
    GET: axios.get,
    PUT: axios.put,
    POST: axios.post,
    DELETE: axios.delete
}

const withBody = ['PUT', 'POST'];

const print = (...strs) => {
    if (verbose) {
        console.log(...strs);
    }
}

const APIcall = async ({
    url,
    method,
    body,
    withCredentials = true
}) => {
    print('----- API Call -----');
    print('url:', url);
    print('method:', method);
    print('body:', body);
    let res = null;
    const headers = { "Content-Type": "application/json" };
    const fullUrl = `${baseURL}/${url}`;
    const options = {
        withCredentials,
        headers
    };
    const params = withBody.includes(method)
        ? [fullUrl, body, options]
        : [fullUrl, options];
    try {
        res = await functions[method](...params);
    } catch (e) {
        res = e;
    }
    print(`| API Call ${url} returned |`);
    print('res:', res);
    print('--------------------');
    return res;
}

export default APIcall;