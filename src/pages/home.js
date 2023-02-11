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
    noVideoPosts: [],
    selectedPost: -1,
    loadingPost: 0,
    fetchedPost: 0,
    gotLastVideoPost: false,
    gotLastPost: false
}

function Home({
    isMobile
}) {
    const [categoryState, setCategoryState] = useState({ ...startCategoryState });
    const {
        curCategory,
        posts,
        noVideoPosts,
        loadingPost,
        fetchedPost,
        gotLastVideoPost,
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
                return getPostsAPI({ category: curCategory, skip: fetchedPost - (gotLastVideoPost ? posts.length : 0), limit: BATCH_SIZE, noVideo: gotLastVideoPost });
            });
            const gotPosts = res?.data?.data;
            if (gotPosts) {
                const newPosts = gotLastVideoPost ? posts : [...posts, ...gotPosts];
                const newNoVideoPosts = gotLastVideoPost ? [...noVideoPosts, ...gotPosts] : noVideoPosts;
                setCategoryState({
                    curCategory,
                    posts: newPosts,
                    noVideoPosts: newNoVideoPosts,
                    fetchedPost: fetchedPost + gotPosts.length,
                    gotLastVideoPost: gotPosts.length < BATCH_SIZE,
                    gotLastPost: gotLastVideoPost && gotPosts.length < BATCH_SIZE,
                    loadingPost: categoryState.loadingPost + 1
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
    }, [setCategoryState, categoryState]);

    const setNVPosts = useCallback((newPosts) => {
        setCategoryState({ ...categoryState, noVideoPosts: newPosts });
    }, [setCategoryState, categoryState]);

    const getSelectedPost = useCallback(() => {
        if (selectedPost === -1) return null;
        const hasVid = selectedPost < posts.length;
        const arr = hasVid ? posts : noVideoPosts;
        const index = selectedPost - (hasVid ? 0 : posts.length);
        if (arr.length <= index) return null;
        return arr[index];
    }, [selectedPost, posts, noVideoPosts]);

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
        const post = getSelectedPost();
        if (post) {
            navigate(`/${curCategory}/${post._id}`);
        }
    }, [selectedPost, posts, noVideoPosts]);

    useEffect(() => {
        const post = getSelectedPost();
        if (post && post._id !== postId && !pauseNavigate.current) {
            pauseNavigate.current = true;
            navigate(`/${curCategory}/${post._id}`);
        }
    }, [selectedPost, posts, noVideoPosts, curCategory]);

    const removePost = (id) => {
        let removePostIndex = findIndex(posts, post => post._id === id);
        let arr = posts;
        let func = setPosts;
        if (removePostIndex === -1) {
            removePostIndex = findIndex(noVideoPosts, post => post._id === id);
            arr = noVideoPosts;
            func = setNVPosts;
        }
        if (removePostIndex !== -1) {
            const newPosts = [...arr];
            newPosts.splice(removePostIndex, 1);
            if (removePostIndex === selectedPost || removePostIndex === selectedPost - posts.length) {
                leavePost();
            }
            func(newPosts);
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
                    {gotLastVideoPost && !!noVideoPosts.length && (
                        <>
                            <div className='topBarTitle' style={{ alignSelf: 'center', fontSize: 30 }}>Video Coming Soon:</div>
                            <div className="postsContainer">
                                {noVideoPosts.map((post, index) => _post(post, index + posts.length))}
                            </div>
                        </>
                    )}
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
                    post={getSelectedPost()}
                    rightClick={selectedPost >= posts.length + noVideoPosts.length - 1 ? null : () => setSelectedPost(selectedPost + 1)}
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