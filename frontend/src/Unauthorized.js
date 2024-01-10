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
    },
  },
});

function Unauthorized() {
    return(
        <>
        <div style={{
                width: '100%', top: 'calc(0vh-100px)', height: '100%', backgroundImage: `url(${cover})`,
                backgroundSize: 'cover', backgroundRepeat: 'no-repeat', position: 'fixed',
                zIndex: '-1'
            }}>
            </div >
            <ThemeProvider theme={theme}>
                <Stack direction="column" align="center" spacing={4} sx={{ pt: "20%", fontFamily: 'Poppins' }}>
                    <Typography variant="h5" gutterBottom >
                        Sorry, you do not have access to this page!
                    </Typography>

                    <Link style={{ textDecoration: "none" }} to={`/`}>
                        <Button variant="contained" color="primary" sx={{ display: 'block', width: "200px" }}>Home</Button>
                    </Link>

                </Stack>

            </ThemeProvider>
      </>
    )
}
export default Unauthorized;