import React, { useEffect, useState } from "react";

import { TextField } from '@mui/material';

import { AddPhotoAlternate } from '@mui/icons-material';

import { noop } from 'lodash';

import  '../styles/imageUpload.css';

const ImageUpload = ({ onChange = noop, width = 30, height = 30 }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [inputRef, setInputRef] = useState(null);
    const [textInputRef, setTextInputRef] = useState(null);

    useEffect(() => {
        onChange(selectedFile);
    }, [selectedFile, onChange]);

    function testImage(url) {
        return new Promise(function (resolve) {
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

        setSelectedFile(file);
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
