import { useState, useEffect } from 'react';
import '../styles/menu.css';

const WIDTH = 200;
const MAX_HEIGHT = 500;

const Menu = ({ getSetter }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [state, setState] = useState({
        top: 0,
        left: 0,
        items: []
    });

    const close = () => {
        setIsOpen(false);
        window.removeEventListener('click', close);
    }

    const {
        top = 0,
        left = 0,
        items = []
    } = state;

    useEffect(() => {
        getSetter((newState) => {
            setState(newState);
            if (!isOpen) {
                setTimeout(() => {
                    window.addEventListener('click', close);
                });
            }
            setIsOpen(true);
        });
    }, [isOpen]);


    const _item = (item) => (
        <div
            className='menuItem'
            key={item.key || item.text}
            onClick={item.onClick}
            style={{ width: WIDTH - 10 }}
        >
            {item.icon}
            {item.text}
        </div>
    )

    return (
        <div
            className='menuContainer'
            style={{
                display: isOpen ? 'flex' : 'none',
                top,
                left: left + WIDTH > window.innerWidth ? left - WIDTH - 10 : left,
                maxHeight: MAX_HEIGHT,
                width: WIDTH
            }}
        >
            {items.map(_item)}
        </div>
    );
}

export default Menu;

