import React, { useEffect, useRef, useState } from 'react';
import { findIndex, orderBy } from 'lodash';
import  '../styles/home.css';
import { getPostsAPI } from '../actions/searchAPI';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';
import SelectedPost from '../components/selectedPost';
import { useParams, useNavigate } from 'react-router-dom';
import Post from '../components/post';
import Loader from '../components/loader';

function Home({ currentUser, openLogin }) {
    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState([]);

    const [hoveredPost, setHoveredPost] = useState(null);
    const [autoplayTimer, setAutoplayTimer] = useState(null);
    const [selectedPost, setSelectedPost] = useState(-1);
    const [loadingPost, setLoadingPost] = useState(0);
    const [postsPerRow, setPostsPerRow] = useState(4);

    const isMobile = useRef(window.matchMedia("only screen and (max-width: 760px)").matches);
    const mainRef = useRef(null);
    const runningIndex = useRef(0);
    const endedIndex = useRef(0);

    const { postId } = useParams();
    const scrollTo = new URLSearchParams(window.location.search).get('scrollTo');
    const navigate = useNavigate();

    const toDate = str => new Date(str);
    const isRunning = (post) => toDate(post.startDate) <= today && today <= toDate(post.endDate);
    const isEnded = (post) => toDate(post.endDate) < today;

    const today = toDate();

    useEffect(() => {
        const tryGetPosts = async () => {
            setLoading(true);
            const res = await getPostsAPI();
            const gotPosts = res?.data?.data;
            const sortedPosts = orderBy(gotPosts, p => p.endDate, 'desc');
            setPosts(sortedPosts);
            clearInterval(interval);
            for (let i = 0; i < sortedPosts.length; i++) {
                if (!runningIndex.current && isRunning(sortedPosts[i])) runningIndex.current = i;
                if (!endedIndex.current && isEnded(sortedPosts[i])) {
                    endedIndex.current = i;
                }
            }
            setLoading(false);
        };
        const interval = setInterval(tryGetPosts, 10000);
        tryGetPosts();
    }, [setLoading, setPosts]);

    useEffect(() => {
        if (scrollTo) {
            setTimeout(() => {
                const correctRef = scrollTo === 'running' ? runningIndex : endedIndex;
                scrollToIndex(correctRef.current);
                navigate('/');
            }, 500);
        }
    })

    useEffect(() => {
        if (postId && posts.length) {
            const index = findIndex(posts, post => post._id === postId);
            setSelectedPost(index);
        }
    }, [postId, posts, setSelectedPost]);

    useEffect(() => {
        if (selectedPost !== -1) {
            navigate(`/${posts[selectedPost]._id}`);
        }
    }, [selectedPost, posts, navigate]);

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
        navigate('/');
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
                        {posts.map((post, index) => _post(post, index))}
                    </div>
                </div>
            </div>
        );
    };

    const scrollToIndex = (index) => {
        const line = Math.floor((index - 1) / postsPerRow);
        const pixels = line * 490;
        mainRef.current.scroll({ top: pixels });
    }

    if (loading) {
        return (
            <div className={'loaderContainer'}>
                <Loader />
            </div>
        );
    }

    return (
        <div>
            <TopBar currentUser={currentUser} />
            <div className={'topContainer'}>
                {selectedPost !== -1 && (
                    <SelectedPost
                        post={posts[selectedPost]}
                        rightClick={selectedPost >= posts.length - 1 ? null : () => setSelectedPost(selectedPost + 1)}
                        leftClick={selectedPost <= 0 ? null : () => setSelectedPost(selectedPost - 1)}
                        XClick={leavePost}
                        removePost={removePost}
                    />
                )}
                {!isMobile.current && (
                    <SideBar
                        clickUpcoming={() => {
                            scrollToIndex(0);
                        }}
                        clickRunning={() => {
                            scrollToIndex(runningIndex.current);
                        }}
                        clickEnded={() => {
                            scrollToIndex(endedIndex.current);
                        }}
                        currentUser={currentUser}
                        openLogin={openLogin}
                    />
                )}
                {_main()}
            </div>
        </div>
    );
}

export default Home;