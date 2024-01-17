import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import * as React from 'react';

const marks = [
    {
        value: 1,
        label: '1',
    },
    {
        value: 10,
        label: '10'
    }
];

const CustomSlider = ({ name, value, onChange }) => {
    const handleChange = (_, newValue) => {
        onChange(name, newValue);
    };

    return (
        <>
            <Slider
                value={value}
                onChange={handleChange}
                aria-label="Temperature"
                defaultValue={0}
                valueLabelDisplay="auto"
                step={1}
                marks={marks}
                min={1}
                max={10}
            />
        </>
    )

}

export default CustomSlider;