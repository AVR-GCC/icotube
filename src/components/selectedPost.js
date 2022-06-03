import React, { useState, useRef, useEffect } from 'react';
import '../styles/selectedPost.css';
import { FullscreenRounded, ReplyRounded, ArrowBackIosNewRounded, ArrowForwardIosRounded } from '@mui/icons-material';
import ReactPlayer from 'react-player';

function SelectedPost({
    post,
    rightClick,
    leftClick,
    XClick
}) {
    const [playerSize, setPlayerSize] = useState({ height: 360, width: 640 });
    const playerPartRef = useRef();

    useEffect(() => {
        if (playerPartRef.current) {
            const goodRatio = 64 / 36;
            const thisRatio = playerPartRef.current.offsetWidth / playerPartRef.current.offsetHeight;
            let height = 360;
            let width = 640;
            if (thisRatio > goodRatio) {
                height = playerPartRef.current.offsetHeight;
                width = goodRatio * height;
            } else {
                width = playerPartRef.current.offsetWidth;
                height = width / goodRatio;
            }
            setPlayerSize({ width, height });
        }
    }, []);

    const arrowStyle = {
        fontSize: 50,
        cursor: 'pointer'
    }

    return (
        <div className='selectedPost'>
            <div className='postTopBar'>
                <div className='social'>
                    <div className='socialButton'><FullscreenRounded /></div>
                    <div className='socialButton'><ReplyRounded /></div>
                </div>
                <div className='XButton' onClick={XClick}>X</div>
            </div>
            <div className='bottomPart'>
                <div className='videoSection'>
                    <div className='arrowPart'>
                        {!!leftClick && (
                            <ArrowBackIosNewRounded
                                style={arrowStyle}
                                onClick={leftClick}
                            />
                        )}
                    </div>
                    <div
                        className='playerPart'
                        ref={playerPartRef}
                    >
                        <ReactPlayer
                            url={post.videoUrl}
                            muted={false}
                            controls={true}
                            height={playerSize.height}
                            width={playerSize.width}
                        />
                    </div>
                    <div className='arrowPart'>
                        {!!rightClick && (
                            <ArrowForwardIosRounded
                                style={arrowStyle}
                                onClick={rightClick}
                            />
                        )}
                    </div>
                </div>
                <div className='infoSection'>
                    <div className='infoBox'>
                        <div className='titleText'>{post.title}</div>
                        <div className='infoText'>{post.description}</div>
                        <div className='linkText'>{post.homepage}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SelectedPost;