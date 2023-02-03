import React, { useCallback, useEffect, useRef, useState } from 'react';
import { findIndex } from 'lodash';
import { useParams, useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import  '../styles/home.css';
import { getPostsAPI } from '../actions/searchAPI';
import SelectedPost from '../components/selectedPost';
import Post from '../components/post';
import Loader from '../components/loader';
import { retryUntilSuccess } from '../utils';

const BATCH_SIZE = 8;

const startCategoryState = {
    curCategory: 'upcoming',
    posts: [],
    selectedPost: -1,
    loadingPost: 0,
    fetchedPost: 0,
    gotLastPost: false
}

function Home({
    isMobile
}) {
    const [categoryState, setCategoryState] = useState({ ...startCategoryState });
    const {
        curCategory,
        posts,
        loadingPost,
        fetchedPost,
        gotLastPost
    } = categoryState;

    const [loading, setLoading] = useState(false);

    const [hoveredPost, setHoveredPost] = useState(null);
    const [autoplayTimer, setAutoplayTimer] = useState(null);
    const [selectedPost, setSelectedPost] = useState(-1);
    const [postsPerRow, setPostsPerRow] = useState(4);

    const mainRef = useRef(null);
    const lastLoaded = useRef(0);
    const pauseNavigate = useRef(false);

    const { postId, category = 'upcoming' } = useParams();

    useEffect(() => {
        lastLoaded.current = 0;
        setCategoryState({ ...startCategoryState, curCategory: category });
    }, [category]);

    const navigate = useNavigate();

    const fetchPosts = async () => {
        if (category === curCategory) {
            setLoading(true);
            const res = await retryUntilSuccess(() => {
                getPostsAPI({ category: curCategory, skip: fetchedPost, limit: BATCH_SIZE })
            });
            const gotPosts = res?.data?.data;
            if (gotPosts) {
                const newPosts = [...posts, ...gotPosts];
                setCategoryState({
                    curCategory,
                    posts: newPosts,
                    fetchedPost: fetchedPost + gotPosts.length,
                    gotLastPost: gotPosts.length < BATCH_SIZE,
                    loadingPost: categoryState.loadingPost
                });
                setLoading(false);
            }
        }
    };

    const fetchPostsToId = async (id) => {
        pauseNavigate.current = true;
        const singleRes = await retryUntilSuccess(() => getPostsAPI({ filter: { _id: id } }));
        const gotSelectedPost = (singleRes?.data?.data || []);
        setCategoryState({
            ...categoryState,
            posts: [...posts, ...gotSelectedPost],
            selectedPost: posts.length
        });
        const rest = await retryUntilSuccess(() => getPostsAPI({ filter: { startDate: { $lte: gotSelectedPost.startDate } } }));
        const gotPosts = rest?.data?.data;
        const selectedIndex = findIndex(gotPosts, p => p._id === id);
        if (selectedIndex !== -1) {
            setCategoryState({
                ...categoryState,
                posts: gotPosts,
                selectedPost: selectedIndex,
                fetchedPost: selectedIndex + 1
            });
        }
    }

    const setLoadingPost = (newLoadingPost) => {
        setCategoryState({ ...categoryState, loadingPost: newLoadingPost });
    }

    const setPosts = useCallback((newPosts) => {
        setCategoryState({ ...categoryState, posts: newPosts });
    }, [setCategoryState, categoryState])

    useEffect(() => {
        fetchPosts();
    }, [curCategory]);

    useEffect(() => {
        if (postId && posts.length) {
            let index = findIndex(posts, post => post._id === postId);
            if (index === -1) {
                fetchPostsToId(postId);
            } else {
                setSelectedPost(index);
            }
        }
    }, [postId, posts]);

    useEffect(() => {
        if (selectedPost !== -1 && posts.length) {
            const post = posts[selectedPost];
            navigate(`/${curCategory}/${post._id}`);
        }
    }, [selectedPost, posts]);

    useEffect(() => {
        if (selectedPost !== -1 && posts[selectedPost]._id !== postId && !pauseNavigate.current) {
            pauseNavigate.current = true;
            navigate(`/${curCategory}/${posts[selectedPost]._id}`);
        }
    }, [selectedPost, posts, navigate, curCategory]);

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

    const toggleSelectedPostLike = useCallback(() => {
        const togglePostLike = (index) => {
            const newPosts = [...posts];
            newPosts[index] = {
                ...newPosts[index],
                isLiked: !newPosts[index].isLiked,
                likes: newPosts[index].likes + (newPosts[index].isLiked ? -1 : 1)
            }
            setPosts(newPosts);
        }
        togglePostLike(selectedPost)
    }, [selectedPost, setPosts, posts]);

    const leavePost = () => {
        setSelectedPost(-1);
        navigate(`/${curCategory}`);
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
        <div key={`${index}_post`} style={{ width: isMobile ? '100%' : 'unset' }}>
            <Post
                post={post}
                index={index}
                onMouseEnter={onMouseEnterPost}
                onMouseLeave={onMouseLeavePost}
                onClick={onClickPost}
                loadingPost={loadingPost}
                setLoadingPost={setLoadingPost}
                hoveredPost={hoveredPost}
                isMobile={isMobile}
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
                className={`mainContainer${isMobile ? ' mobileMainContainer' : ''}`}
                ref={mainRef}
                onScroll={(arg) => {
                    const node = arg.target;
                    const isBottom = node.scrollTop + node.offsetHeight === node.scrollHeight;
                    if (isBottom && !gotLastPost && lastLoaded.current !== fetchedPost) {
                        lastLoaded.current = fetchedPost;
                        fetchPosts();
                    }
                }}
            >
                <div
                    className="subMainContainer"
                    style={{ width: isMobile ? '100%' : numPosts * postWidth }}
                >
                    <div className="postsContainer">
                        {posts.map(_post)}
                    </div>
                    {loading && (
                        <div className="bottomLoaderContainer">
                            <CircularProgress size={50} />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (loading && !posts.length) {
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
                    isMobile={isMobile}
                    flipLike={toggleSelectedPostLike}
                />
            )}
            {_main()}
        </React.Fragment>
    );
}

export default Home;