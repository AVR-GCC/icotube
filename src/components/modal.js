import { useState, useEffect } from 'react';
import '../styles/modal.css';

const Modal = ({
    children,
    clickOutside,
    height = 500,
    width = 500
}) => {
    const [renders, setRenders] = useState(0);

    useEffect(() => {
        const forceUpdate = () => {
            setRenders(renders + 1);
        };
        window.addEventListener('resize', forceUpdate);
        return () => window.removeEventListener('resize', forceUpdate);
    }, [renders]);

    const padding = 60;
    const top = window.innerHeight / 2 - height / 2 - padding / 2;
    const left = window.innerWidth / 2 - width / 2 - padding / 2;
    return (
        <div
            className="modalBackdrop"
            onMouseDown={(e) => {
                const x = e.clientX;
                const y = e.clientY;
                const horizontal = x > left && x < left + width + padding * 2;
                const vertical = y > top && y < top + height + padding * 2;
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