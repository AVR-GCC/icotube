import React, { useEffect, useRef, useState } from 'react';
import '../styles/notification.css';

const SLIDE_TIME = 1500;

const Notifications = ({ getUpdate }) => {
    const [note, setNote] = useState(null);
    const [show, setShow] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        getUpdate(setNote);
    }, [getUpdate]);

    useEffect(() => {
        const showNote = async () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
            setShow(true);
            timerRef.current = setTimeout(() => {
                setShow(false);
                timerRef.current = null;
            }, note.timeout || 5000);
        }
        if (note) {
            showNote();
        }
    }, [note]);

    return (
        <div className='notificationContainer' style={{ transition: `${SLIDE_TIME}ms`, top: show ? 0 : '-100%' }}>
            <div className={`notification${note ? ` ${note.type}` : 'info'}`}>
                {note ? note.text : ''}
            </div>
        </div>
    );
}

export default Notifications;
