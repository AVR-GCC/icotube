import React from 'react';
import ReactPlayer from 'react-player';
import  '../styles/post.css';

function Post({
    post,
    index,
    onMouseEnter,
    onMouseLeave,
    onClick,
    loadingPost,
    setLoadingPost,
    hoveredPost
}) {
    const _postContent = (post, index) => post.videoUrl && index <= loadingPost ? (
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
    )

    const _postText = (post) => (
        <div className={'boxICOTextSection'}>
            <div className={'boxICOTitle'}>{post.title}</div>
            <div>{post.type}</div>
            <div>Fundraising Goal: {
                post.fundraisingGoal === undefined ?
                'NOT SET' : post.fundraisingGoal
            }</div>
            <div className={'boxICODescriptionHolder'}>{post.description}</div>
        </div>
    )

    return (
        <div
            key={post._id}
            className={'postContainer'}
            onMouseEnter={() => onMouseEnter(post)}
            onMouseLeave={onMouseLeave}
            onClick={() => onClick(index)}
        >
            {_postContent(post, index)}
            {_postText(post)}
        </div>
    );
}

export default Post;
