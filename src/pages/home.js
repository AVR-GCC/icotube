import React, { useEffect, useRef, useState } from 'react';
import { findIndex } from 'lodash';
import { useParams, useNavigate } from 'react-router-dom';
import  '../styles/home.css';
import { getPostsAPI } from '../actions/searchAPI';
import SelectedPost from '../components/selectedPost';
import Post from '../components/post';
import Loader from '../components/loader';
import { retryUntilSuccess } from '../utils';

function Home() {
    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState([]);

    const [hoveredPost, setHoveredPost] = useState(null);
    const [autoplayTimer, setAutoplayTimer] = useState(null);
    const [selectedPost, setSelectedPost] = useState(-1);
    const [loadingPost, setLoadingPost] = useState(0);
    const [postsPerRow, setPostsPerRow] = useState(4);

    const mainRef = useRef(null);
    const runningIndex = useRef(0);
    const endedIndex = useRef(0);

    const { postId, category = 'upcoming' } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const toDate = str => new Date(str);
        const isRunning = (post) => toDate(post.startDate) <= today && today <= toDate(post.endDate);
        const isEnded = (post) => toDate(post.endDate) < today;

        const today = new Date();
        retryUntilSuccess(async () => {
            setLoading(true);
            const res = await getPostsAPI({ category });
            const gotPosts = res?.data?.data;
            if (gotPosts) {
                setPosts(gotPosts);
                for (let i = 0; i < gotPosts.length; i++) {
                    if (!runningIndex.current && isRunning(gotPosts[i])) {
                        runningIndex.current = i;
                    }
                    if (!endedIndex.current && isEnded(gotPosts[i])) {
                        endedIndex.current = i;
                    }
                }
                setLoading(false);
            }
            return ({ success: !!gotPosts });
        });
    }, [setLoading, setPosts, category]);

    useEffect(() => {
        if (postId && posts.length) {
            const index = findIndex(posts, post => post._id === postId);
            setSelectedPost(index);
        }
    }, [postId, posts, setSelectedPost]);

    useEffect(() => {
        if (selectedPost !== -1) {
            navigate(`/${category}/${posts[selectedPost]._id}`);
        }
    }, [selectedPost, posts, navigate, category]);

    const removePost = (id) => {
        const removePostIndex = findIndex(posts, post => post._id === id);
        if (removePostIndex !== -1) {
            const newPosts = [...posts];
            newPosts.splice(removePostIndex, 1);
            if (removePostIndex === selectedPost) {
                leavePost();
            }
            setPosts(newPosts);
        }
    }

    const leavePost = () => {
        setSelectedPost(-1);
        navigate(`/${category}`);
    }

    const onMouseEnterPost = (post) => {
        setHoveredPost(null);
        setAutoplayTimer(setTimeout(() => {
            setHoveredPost(post._id);
        }, 3000));
    }

    const onMouseLeavePost = () => {
        clearTimeout(autoplayTimer);
        setHoveredPost(null);
        setAutoplayTimer(null);
    }

    const onClickPost = (index) => {
        setSelectedPost(index);
    }

    const _post = (post, index) => (
        <div key={`${index}_post`}>
            <Post
                post={post}
                index={index}
                onMouseEnter={onMouseEnterPost}
                onMouseLeave={onMouseLeavePost}
                onClick={onClickPost}
                loadingPost={loadingPost}
                setLoadingPost={setLoadingPost}
                hoveredPost={hoveredPost}
            />
        </div>
    );

    const _main = () => {
        const postWidth = 353;
        let numPosts = 4;
        if (mainRef.current) {
            numPosts = Math.floor(mainRef.current.clientWidth / postWidth);
        }
        if (numPosts !== postsPerRow) {
            setPostsPerRow(numPosts);
        }
        return (
            <div
                className="mainContainer"
                ref={mainRef}
            >
                {/* <Search /> */}
                <div className="subMainContainer" style={{ width: numPosts * postWidth }}>
                    <div className="postsContainer">
                        {posts.map(_post)}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className={'loaderContainer'}>
                <Loader />
            </div>
        );
    }

    return (
        <React.Fragment>
            {selectedPost !== -1 && (
                <SelectedPost
                    post={posts[selectedPost]}
                    rightClick={selectedPost >= posts.length - 1 ? null : () => setSelectedPost(selectedPost + 1)}
                    leftClick={selectedPost <= 0 ? null : () => setSelectedPost(selectedPost - 1)}
                    XClick={leavePost}
                    removePost={removePost}
                />
            )}
            {_main()}
        </React.Fragment>
    );
}

export default Home;