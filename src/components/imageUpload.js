import React, { useState } from "react";

import {
    TextField,
    Fab,
} from '@mui/material';

import {
    AddPhotoAlternate,
} from '@mui/icons-material';

import  '../styles/imageUpload.css';

const ImageUpload = (props) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [inputRef, setInputRef] = useState(null);
    const [textInputRef, setTextInputRef] = useState(null);

    function testImage(url) {
        return new Promise(function (resolve, reject) {
            var timeout = 2000;
            var timer, img = new Image();
            img.onerror = img.onabort = function () {
                clearTimeout(timer);
                resolve("error");
            };
            img.onload = function () {
                clearTimeout(timer);
                resolve("success");
            };
            timer = setTimeout(function () {
                // reset .src to invalid URL so it stops previous
                // loading, but doesn't trigger new load
                img.src = "//!!!!/test.jpg";
                resolve("timeout");
            }, timeout);
            img.src = url;
        });
    }

    const handleUploadClick = event => {
        var file = event.target.files[0];
        const reader = new FileReader();
        var url = reader.readAsDataURL(file);

        reader.onloadend = () => setSelectedFile(reader.result);
        console.log('image url', url);

        setSelectedFile(event.target.files[0]);
        console.log('textInputRef', textInputRef.value);
        textInputRef.value = '';
    };

    const renderInitialState = () => (
        <div className="card">
            <input
                ref={ref => setInputRef(ref)}
                accept="image/*"
                className="input"
                id="contained-button-file"
                type="file"
                onChange={handleUploadClick}
            />
            <label htmlFor="contained-button-file">
                <div className="button" onClick={() => inputRef.value = null}>
                    <AddPhotoAlternate />
                </div>
            </label>
        </div>
    );

    const renderSearchState = () => (
        <div className="url-container">
            <TextField
                inputRef={ref => setTextInputRef(ref)}
                key="search-input"
                id="search-input"
                label="Image URL"
                variant='outlined'
                margin='normal'
                fullWidth
                onChange={async (event) => {
                    const url = event.target.value;
                    const result = await testImage(url);
                    if (result === 'success') {
                        inputRef.value = null;
                        setSelectedFile(url);
                    }
                }}
            />
        </div>
    );

    const renderUploadedState = () => {
        const { width = 30, height = 30 } = props;
        return selectedFile ? (
            <img
                width={width}
                height={height}
                className="media"
                src={selectedFile}
                alt="Choose"
                onClick={imageResetHandler}
            />
        ) : (
            <div style={{ margin: 10, width, height }} />
        )
    }

    const imageResetHandler = () => {
        inputRef.value = null;
        setSelectedFile(null);
    };

    return (
        <div className="root">
            {renderUploadedState()}
            {renderInitialState()}
            {renderSearchState()}
        </div>
    );
}

export default ImageUpload;
