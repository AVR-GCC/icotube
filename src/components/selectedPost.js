import React, { useState, useRef, useEffect, useContext } from 'react';
import '../styles/selectedPost.css';
import {
    FullscreenRounded,
    ReplyRounded,
    ArrowBackIosNewRounded,
    ArrowForwardIosRounded,
    Close,
    ThumbUp,
    ThumbUpOffAlt
} from '@mui/icons-material';
import { deletePostAPI, likePostAPI } from '../actions/searchAPI';
import { Button, Divider } from '@mui/material';
import ReactPlayer from 'react-player';
import { AppContext } from '../App';
import { useNavigate } from 'react-router-dom';
import { fields } from '../constants/postFields';
import { noop } from 'lodash';

const fieldsToNotShow = [
    'title',
    'email',
    'shortDescription',
    'videoUrl',
    'homepage',
    'importantNote',
    'logo'
];

function SelectedPost({
    post,
    rightClick,
    leftClick,
    XClick,
    removePost,
    isMobile,
    flipLike
}) {
    const [playerSize, setPlayerSize] = useState({ height: 360, width: 640 });
    const playerPartRef = useRef();
    const appContext = useContext(AppContext);
    const currentUser = appContext?.user;
    const allowEdit = currentUser && !!post && (
        currentUser.email === post.email
        || appContext?.config?.freePostWhitelist?.includes(currentUser.email)
    );
    const navigate = useNavigate();

    const adjustPlayerSize = () => {
        if (playerPartRef.current) {
            const goodRatio = 64 / 36;
            const endOfScreenBuffer = 95;
            const availableHeight = window.innerHeight - 126 - endOfScreenBuffer;
            const availableWidth = window.innerWidth - (isMobile ? 20 : 100);
            const thisRatio = availableWidth / availableHeight;
            let height = 360;
            let width = 640;
            if (thisRatio > goodRatio) {
                height = availableHeight;
                width = goodRatio * height;
            } else {
                width = availableWidth;
                height = width / goodRatio;
            }
            setPlayerSize({ width, height });
        }
    }

    useEffect(() => {
        adjustPlayerSize();
    }, [playerPartRef.current]);

    useEffect(() => {
        window.addEventListener('resize', adjustPlayerSize);
        return () => window.removeEventListener('resize', adjustPlayerSize);
    }, []);

    const arrowStyle = {
        fontSize: 50,
        cursor: 'pointer',
        color: '#DCDCDC'
    }

    const _link = (uri) => (
        <div
            className='linkText'
            onClick={() => window.open(uri)}
            style={{ height: 18 }}
        >
            {uri}
        </div>
    )

    const _topIcons = () => (
        <React.Fragment>
            {allowEdit ? (
                <div className='ownerButtons'>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            navigate(`/publish/${post._id}`);
                        }}
                    >
                        Edit
                    </Button>
                    <Button
                        color="error"
                        variant="outlined"
                        style={{ marginLeft: 10 }}
                        onClick={async () => {
                            const res = await deletePostAPI(post._id);
                            if (res?.success) {
                                removePost(post._id);
                            } else {
                                console.log('ress', res);
                                alert(res?.data?.error?.message);
                            }
                        }}
                    >
                        Delete
                    </Button>
                </div>
            ) : null}
            {!allowEdit && (
                <div className='hide'>
                    <div className='social'>
                        <div className='socialButton'><FullscreenRounded /></div>
                        <div className='socialButton'><ReplyRounded /></div>
                    </div>
                </div>
            )}
        </React.Fragment>
    );

    const _XButton = () => <div style={{ color: '#DCDCDC' }} className='XButton' onClick={XClick}><Close /></div>;

    const _postTopBar = () => (
        <div className='postTopBar'>
            {_topIcons()}
            {_XButton()}
        </div>
    );

    const _leftArrow = () => (
        <div className='arrowPart'>
            {!!leftClick && (
                <ArrowBackIosNewRounded
                    style={arrowStyle}
                    onClick={leftClick}
                />
            )}
        </div>
    );

    const _rightArrow = () => (
        <div className='arrowPart'>
            {!!rightClick && (
                <ArrowForwardIosRounded
                    style={arrowStyle}
                    onClick={rightClick}
                />
            )}
        </div>
    );

    const _player = () => (
        <div
            className='playerPart'
            ref={playerPartRef}
        >
            {post.videoUrl ? (
                <ReactPlayer
                    url={post.videoUrl}
                    muted={false}
                    controls={true}
                    height={playerSize.height}
                    width={playerSize.width}
                />
            ) : (
                <img
                    style={{ height: playerSize.height, width: playerSize.width }}
                    src={post.logo}
                    alt={post.title}
                />
            )}
        </div>
    );

    const _videoSection = () => (
        <div className='videoSection' style={{ maxHeight: playerSize.height }}>
            {!!post && _player()}
        </div>
    );

    const _showField = (field, post) => {
        const value = post[field.name];
        if (field.type === 'boolean') {
            return value ? 'Yes' : 'No';
        }
        if (field.type === 'date') {
            return new Date(value).toLocaleDateString();
        }
        if (field.type === 'image') {
            return (
                <img
                    width={50}
                    height={50}
                    src={value}
                    style={{ marginLeft: 20 }}
                    alt="Logo"
                />
            );
        }
        if (field.type === 'number') {
            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
        if (field.multiple) {
            return value.join(', ');
        }
        return field.link ? _link(value) : value;
    }

    const _likeButton = () => {
        const isLiked = post.isLiked;
        let likes = post.likes;
        let letter = '';
        if (likes > 1000) {
            likes = likes / 1000;
            letter = 'K';
        }
        if (likes > 1000) {
            likes = likes / 1000;
            letter = 'M';
        }
        const className = `likeButton${currentUser ? '' : ' disabled'}`;
        const onClick = currentUser ? () => {
            flipLike();
            likePostAPI(post._id);
        } : noop;
        return (
            <div
                className={className}
                onClick={onClick}
            >
                {isLiked ? <ThumbUp /> : <ThumbUpOffAlt />}
                {likes}{letter}
            </div>
        )
    };

    const _infoSection = () => {
        return (
            <div className='infoSection' style={{ width: playerSize.width }}>
                {!!post && (
                    <div className='infoBox'>
                        <div className='titleText' style={{ fontSize: isMobile ? 30 : 25 }}>{post.title}</div>
                        <div className='subtitleSection'>
                            <div className='infoText'>{post.shortDescription}</div>
                            {/* {_likeButton()} */}
                        </div>
                        {_link(post.homepage)}
                        <div className='spacer' />
                        <div className='infoText'>{post.importantNote}</div>
                        <Divider style={{ marginBottom: 20, background: '#ffffff50' }} />
                        {fields.ICO.map(field => !fieldsToNotShow.includes(field.name) && !!post[field.name] && (
                            <div className='showFieldContainer' key={`${field.name}_show`}>
                                <div
                                    className='infoText'
                                    style={{
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        minWidth: 'fit-content',
                                        textDecoration: 'underline',
                                        marginBottom: 5
                                    }}
                                >
                                    {field.label}:
                                </div>
                                <div className='infoText'>{_showField(field, post)}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    };

    const _bottomPart = () => (
        <div className='bottomPart' style={{ height: window.innerHeight - 126 }}>
            {!isMobile && _leftArrow()}
            <div className='bottomPartCenter'>
                {_videoSection()}
                {_infoSection()}
            </div>
            {!isMobile && _rightArrow()}
        </div>
    );

    return (
        <div className='selectedPost'>
            {_postTopBar()}
            {_bottomPart()}
        </div>
    );
}

export default SelectedPost;