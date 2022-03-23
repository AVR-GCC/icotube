import Axios from 'axios';

const baseURL = 'http://localhost:5000';

const APIcall = async ({ url, method, events, body }) => {
    console.log('----- API Call -----');
    console.log('url:', url);
    console.log('method:', method);
    console.log('body:', body);
    if (events && events.length) {
        events[0]()
    }
    const res = await Axios({
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