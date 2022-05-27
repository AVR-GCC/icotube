import Axios from 'axios';

const baseURL = process.env.NODE_ENV === 'production' ? 'https://icotube-server.herokuapp.com' : 'http://localhost:5000';

const APIcall = async ({ url, method, events, body, withCredentials }) => {
    console.log('----- API Call -----');
    console.log('url:', url);
    console.log('method:', method);
    console.log('body:', body);
    if (events && events.length) {
        events[0]()
    }
    const res = await Axios({
        withCredentials,
        method,
        url: `${baseURL}/${url}`,
        headers: {
            "Content-Type": "application/json"
        },
        body
    });
    console.log(`API Call ${url} returned::`);
    console.log('res:', res);
    console.log('----- -------- -----');
    if (events && events.length > 1) {
        events[1](res)
    }
}

export default APIcall;