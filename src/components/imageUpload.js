import React, { useEffect, useState, useRef } from "react";

import { TextField } from '@mui/material';

import { AddPhotoAlternate } from '@mui/icons-material';

import { isString, noop } from 'lodash';

import  '../styles/imageUpload.css';

const ImageUpload = ({ onChange = noop, width = 30, height = 30, enableFileUpload = false, value }) => {
    const [selectedFile, setSelectedFile] = useState(value);
    const inputRef = useRef(null);
    const textInputRef = useRef(null);

    useEffect(() => {
        if (selectedFile === undefined) return;
        if (isString(selectedFile) && selectedFile.startsWith('data:image')) return;
        onChange(selectedFile);
    }, [selectedFile, onChange]);

    useEffect(() => {
        if (value) {
            setSelectedFile(value);
            textInputRef.current.value = value;
        }
    }, [setSelectedFile, value]);

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
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onloadend = () => setSelectedFile(reader.result);

        setSelectedFile(file);
        if (textInputRef?.current) textInputRef.current.value = '';
    };

    const renderInitialState = () => (
        <div className="card">
            <input
                ref={inputRef}
                accept="image/*"
                className="input"
                id="contained-button-file"
                type="file"
                onChange={handleUploadClick}
            />
            <label htmlFor="contained-button-file">
                <div className="button" onClick={() => inputRef.current.value = null}>
                    <AddPhotoAlternate />
                </div>
            </label>
        </div>
    );

    const renderSearchState = () => (
        <div className="url-container">
            <TextField
                inputRef={textInputRef}
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
                        if (inputRef?.current) inputRef.current.value = null;
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
        if (inputRef?.current) inputRef.current.value = null;
        if (textInputRef?.current) textInputRef.current.value = null;
        setSelectedFile(null);
    };

    return (
        <div className="root">
            {renderUploadedState()}
            {enableFileUpload && renderInitialState()}
            {renderSearchState()}
        </div>
    );
}

export default ImageUpload;
