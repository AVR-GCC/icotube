import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { findIndex } from 'lodash';
import  '../styles/home.css';
import { getPostsAPI } from '../actions/searchAPI';
import Search from '../components/search';
import SideBar from '../components/sideBar';
import SelectedPost from '../components/selectedPost';
import { useParams, useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';

function Home({ currentUser }) {
    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState([]);

    const [hoveredPost, setHoveredPost] = useState(null);
    const [selectedPost, setSelectedPost] = useState(-1);

    // const videoRefresher = useRef(null);

    // useEffect(() => {
    //     videoRefresher.current = setInterval(() => {
    //         const curHoveredPost = hoveredPost;
    //         setHoveredPost(null);
    //         setHoveredPost(curHoveredPost);
    //     }, 5000);
    //     return () => clearInterval(videoRefresher.current);
    // }, [hoveredPost])

    const { postId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        getPostsAPI(
            () => {
                setLoading(true);
            },
            (res) => {
                setPosts(res.data.data);
                setLoading(false);
            }
        );
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

    const _post = (post, index) => {
        // console.log('index', index);
        // console.log('hoveredPost', hoveredPost);
        return (
            <div
                key={post._id}
                className={'postContainer'}
                onMouseEnter={() => setHoveredPost(post._id)}
                onMouseLeave={() => setHoveredPost(null)}
                onClick={() => {
                    setSelectedPost(index);
                }}
            >
                <ReactPlayer
                    playing={hoveredPost === post._id}
                    height={313}
                    width={313}
                    url={post.videoUrl}
                    muted={true}
                    controls={false}
                />
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
        return (
            <div className={'mainContainer'}>
                <Search />
                <div className={'postsContainer'}>
                    {posts.map((post, index) => _post(post, index))}
                </div>
            </div>
        );
    };

    if (loading || true) {
        return (
            <div className={'loaderContainer'}>
                <CircularProgress size={50} />
            </div>
        );
    }

    return (
        <div className={'topContainer'}>
            {selectedPost !== -1 && (
                <SelectedPost
                    post={posts[selectedPost]}
                    rightClick={selectedPost >= posts.length - 1 ? null : () => setSelectedPost(selectedPost + 1)}
                    leftClick={selectedPost <= 0 ? null : () => setSelectedPost(selectedPost - 1)}
                    XClick={() => {
                        setSelectedPost(-1);
                        navigate('/');
                    }}
                />
            )}
            <SideBar currentUser={currentUser} />
            {_main()}
        </div>
    );
}

export default Home;