import React, { useEffect, useState, useRef } from 'react';
import {
    TextField,
    Button,
    CircularProgress
} from '@mui/material';
import { validateEmail } from '../utils';
import { addAlertAPI, removeAlertAPI } from '../actions/searchAPI';

function Alert() {
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false);
    const valueValid = useRef(false);

    useEffect(() => {
        valueValid.current = validateEmail(value);
    }, [value]);

    const handleSubmit = async () => {
        setLoading(true);
        await addAlertAPI(value);
        setValue('');
        setLoading(false);
    }

    const handleDelete = async () => {
        setLoading(true);
        await removeAlertAPI(value);
        setValue('');
        setLoading(false);
    }

    return (
        <div className="mainContainer">
            <TextField
                // error={!!errors[`${field.name}Other`]}
                // key={`${inputId}Other`}
                // id={`${inputId}Other`}
                label={'Email'}
                required
                variant='outlined'
                margin='normal'
                value={value}
                onChange={event => setValue(event.target.value)}
                // helperText={errors[`${field.name}Other`]}
            />
            <div>
                <Button
                    variant='outlined'
                    style={{ marginTop: 20 }}
                    onClick={handleSubmit}
                    disabled={!valueValid.current}
                >
                    <span style={{ fontSize: 14 }}>Submit</span>
                </Button>
                <Button
                    variant='outlined'
                    style={{ marginTop: 20, marginLeft: 20 }}
                    onClick={handleDelete}
                    disabled={!valueValid.current}
                    color='error'
                >
                    <span style={{ fontSize: 14 }}>Delete</span>
                </Button>
            </div>
            {loading && <div className='loadingIndicator' style={{ margin: 20 }}><CircularProgress size={20} /></div>}
        </div>
    );
}

export default Alert;