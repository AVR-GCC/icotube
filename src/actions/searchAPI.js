
import axios from 'axios';
import APIcall from './server';

// export const getHistoryServer = (setSearchHistory) => {
//     APIcall({
//         method: "GET",
//         url: 'history',
//         events: [
//             async () => {
//             },
//             async res => {
//                 await setSearchHistory(res.data.slice(1));
//             }
//         ]
//     });
// }

// export const searchServer = (search, setLoading, doSearch, setList) => {
//     APIcall({
//         method: "GET",
//         url: `search/${search}`,
//         events: [
//             async () => {
//                 await setLoading(true);
//                 doSearch(search)
//             },
//             async res => {
//                 await setList(res.data);
//                 await setLoading(false);
//             }
//         ]
//     });
// }

// export const searchServerPersist = (search, setLoading, doSearch, setList) => {
//     APIcall({
//         method: "POST",
//         url: `search/${search}`,
//         events: [
//             async () => {
//                 await setLoading(true);
//                 doSearch(search)
//             },
//             async res => {
//                 await setList(res.data);
//                 await setLoading(false);
//             }
//         ]
//     });
// }

const baseURL = 'http://localhost:5000';

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
}
