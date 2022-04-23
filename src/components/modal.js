import { useState } from 'react';
import '../styles/modal.css';

const Modal = ({
    children,
    clickOutside,
    height = 500,
    width = 500
}) => {
    // 15 is half of the padding
    const top = window.innerHeight / 2 - height / 2 - 15;
    const left = window.innerWidth / 2 - width / 2 - 15;
    return (
        <div
            className="modalBackdrop"
            onClick={(e) => {
                const x = e.clientX;
                const y = e.clientY;
                const horizontal = x > left && x < left + width;
                const vertical = y > top && y < top + height;
                if (!horizontal || !vertical) {
                    clickOutside();
                }
            }}
        >
            <div
                className="modalBox"
                style={{ top, left, height, width }}
            >
                {children}
            </div>
        </div>
    );
}

export default Modal;