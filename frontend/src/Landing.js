import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Link } from "react-router-dom";
import Button from '@mui/material/Button';
import cover from "./images/background.png";

const font = "'Poppins', sans-serif";

const theme = createTheme({
    typography: {
        fontFamily: font,
    },
    palette: {
        primary: {
            main: "#000000"
        }
    },
});

export default function Types() {
    return (
        <>
            <div style={{
                width: '100%', top: 'calc(0vh-100px)', height: '100%', backgroundImage: `url(${cover})`,
                backgroundSize: 'cover', backgroundRepeat: 'no-repeat', position: 'fixed',
                zIndex: '-1'
            }}>
            </div >
            <ThemeProvider theme={theme}>
                <Stack direction="column" align="center" spacing={4} sx={{ pt: "20%", fontFamily: 'Poppins' }}>
                    <Typography variant="h3" gutterBottom >
                        Welcome to <br /> Wattendance
                    </Typography>

                    <Link style={{ textDecoration: "none" }} to={`/signup`}>
                        <Button variant="contained" color="primary" sx={{ display: 'block', width: "200px" }}>Sign Up</Button>
                    </Link>

                    <Typography variant="body1" gutterBottom >
                        Track your attendance easily from University of Waterloo.
                    </Typography>

                </Stack>

            </ThemeProvider>


        </>




    );
}