import React from 'react';
import ReactPlayer from 'react-player';
import  '../styles/post.css';

const height = 313;
const width = 313;

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
    const _postContent = (post, index) => {
        const showPlayer = post.videoUrl && index <= loadingPost;
        const showImage = !showPlayer && !!post.logo;

        let content = <div style={{ height, width }} />;

        if (showPlayer) {
            content = (
                <ReactPlayer
                    onReady={() => {
                        setLoadingPost(index + 1);
                    }}
                    playing={hoveredPost === post._id}
                    height={height}
                    width={width}
                    url={post.videoUrl}
                    muted={true}
                    controls={false}
                />
            )
        }

        if (showImage) {
            content = (
                <img
                    style={{ height, width }}
                    src={post.logo}
                    alt={post.title}
                />
            )
        }

        return content;
    }

    const _postText = (post) => (
        <div className={'boxICOTextSection'}>
            <div className={'boxICOTitle'}>{post.title}</div>
            <div className={'boxICODescriptionHolder'}>{post.shortDescription}</div>
        </div>
    )

    const content = _postContent(post, index);

    return (
        <div
            key={post._id}
            className={'postContainer'}
            onMouseEnter={() => onMouseEnter(post)}
            onMouseLeave={onMouseLeave}
            onClick={() => onClick(index)}
        >
            {content}
            {_postText(post)}
        </div>
    );
}

export default Post;
