import React, { useEffect, useState } from 'react';
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
    hoveredPost,
    isMobile
}) {
    const [buffering, setBuffering] = useState(false);

    useEffect(() => {
        if (!post.videoUrl && index === loadingPost) {
            setLoadingPost(index + 1);
        };
    }, [post, index, loadingPost, setLoadingPost]);

    const incrementLoadingPost = () => {
        console.log('incrementing', index);
        if (loadingPost < index + 1) {
            setLoadingPost(index + 1);
        }
    }

    const _postContent = (post, index) => {
        const showPlayer = post.videoUrl && index <= loadingPost;
        const showImage = !showPlayer && !!post.logo;
        console.log(index, 'postId', post._id, 'hovered', hoveredPost, 'buffering', buffering);

        let content = <div style={{ height, width }} />;

        if (showPlayer) {
            content = (
                <div>
                    <div
                        style={{
                            position: 'relative',
                            height,
                            width: isMobile ? '100%' : width,
                            cursor: 'pointer'
                        }}
                    />
                    <div style={{ marginTop: -height }}>
                        <ReactPlayer
                            onReady={incrementLoadingPost}
                            onError={incrementLoadingPost}
                            onBuffer={() => {
                                console.log('buffering', index);
                                setBuffering(true);
                            }}
                            onBufferEnd={() => {
                                console.log('buffering done', index);
                                setBuffering(false)
                            }}
                            playing={hoveredPost === post._id && !buffering}
                            height={height}
                            width={isMobile ? '100%' : width}
                            url={post.videoUrl}
                            muted={true}
                            controls={false}
                        />
                    </div>
                </div>
            )
        }

        if (showImage) {
            content = (
                <img
                    style={{ height, width: isMobile ? '100%' : width }}
                    src={post.logo}
                    alt={post.title}
                />
            )
        }

        return content;
    }

    const _postText = (post) => (
        <div className={'boxICOTextSection'}>
            <div
                className={'boxICOTitle'}
                title={post.title}
            >
                {post.title}
            </div>
            <div
                className={'boxICODescriptionHolder'}
                title={post.shortDescription}
            >
                {post.shortDescription}
            </div>
        </div>
    )

    const content = _postContent(post, index);

    return (
        <div
            key={post._id}
            className={`postContainer${isMobile ? ' mobilePostContainer' : ''}`}
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
