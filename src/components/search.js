import React from 'react';
import '../styles/search.css';
import { getPostsAPI } from '../actions/searchAPI.js';

function Search(props) {
    const { search, setSearchText, setLoading, setPosts } = props;

    const doSearch = () => {
        getPostsAPI(
            () => {
                setLoading(true);
            },
            (res) => {
                console.log('res', res);
                setPosts(res.data.data);
                setLoading(false);
            }
        );
    }

    return (
        <div className={'searchLineContainer'}>
            <input
                style={{ width: 295, height: 30, margin: 5, marginBottom: 10 }}
                id={'search-input'}
                type="text"
                value={search}
                placeholder={'Search'}
                onChange={(comp) => setSearchText(comp.target.value)}
                onKeyDown={event => {
                    if (event.keyCode === 13) {
                        doSearch()
                    }
                }}
            />
            <div
                className="sButton"
                onClick={() => doSearch()}
            >
                <span style={{ fontSize: 14 }}>Search</span>
            </div>
        </div>
    );
}

export default Search;