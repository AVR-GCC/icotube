import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { findIndex } from 'lodash';
import  '../styles/home.css';
import { getPostsAPI } from '../actions/searchAPI';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';
import SelectedPost from '../components/selectedPost';
import { useParams, useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';

function Home({ currentUser }) {
    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState([]);

    const [hoveredPost, setHoveredPost] = useState(null);
    const [autoplayTimer, setAutoplayTimer] = useState(null);
    const [selectedPost, setSelectedPost] = useState(-1);
    const [loadingPost, setLoadingPost] = useState(0);

    const isMobile = useRef(window.matchMedia("only screen and (max-width: 760px)").matches);
    const mainRef = useRef(null);

    const { postId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const tryGetPosts = async () => {
            setLoading(true);
            const res = await getPostsAPI();
            setPosts(res.data.data);
            clearInterval(interval);
            setLoading(false);
        };
        const interval = setInterval(tryGetPosts, 10000);
        tryGetPosts();
    }, [setLoading, setPosts]);

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

    const _post = (post, index) => {
        // console.log('index', index);
        // console.log('hoveredPost', hoveredPost);
        return (
            <div
                key={post._id}
                className={'postContainer'}
                onMouseEnter={() => {
                    setHoveredPost(null);
                    setAutoplayTimer(setTimeout(() => {
                        setHoveredPost(post._id);
                    }, 3000));
                }}
                onMouseLeave={() => {
                    clearTimeout(autoplayTimer);
                    setHoveredPost(null);
                    setAutoplayTimer(null);
                }}
                onClick={() => {
                    setSelectedPost(index);
                }}
            >
                {post.videoUrl && index <= loadingPost ? (
                    <ReactPlayer
                        onReady={() => {
                            setLoadingPost(index + 1);
                        }}
                        playing={hoveredPost === post._id}
                        height={313}
                        width={313}
                        url={post.videoUrl}
                        muted={true}
                        controls={false}
                    />
                ) : (
                    <img
                        style={{ height: 313, width: 313 }}
                        src={post.logo}
                        alt={post.title}
                    />
                )}
                <div className={'boxICOTextSection'}>
                    <div className={'boxICOTitle'}>{post.title}</div>
                    <div>{post.type}</div>
                    <div>Fundraising Goal: {
                        post.fundraisingGoal === undefined ?
                        'NOT SET' : post.fundraisingGoal
                    }</div>
                    <div className={'boxICODescriptionHolder'}>{post.description}</div>
                </div>
            </div>
        );
    }

    const _main = () => {
        const postWidth = 353;
        let numPosts = 4;
        if (mainRef.current) {
            numPosts = Math.floor(mainRef.current.clientWidth / postWidth);
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

    if (loading) {
        return (
            <div className={'loaderContainer'}>
                <CircularProgress size={50} />
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
                {!isMobile.current && <SideBar currentUser={currentUser} />}
                {_main()}
            </div>
        </div>
    );
}

export default Home;