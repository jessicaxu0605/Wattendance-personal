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
function SurveyLink() {
    return(
        <>
            <ThemeProvider theme={theme}>
                    <Link style={{ textDecoration: "none" }} to={`/survey`}>
                        <Button variant="contained" color="primary" sx={{ display: 'block', width: "300px" }}>Complete a survey about yourself</Button>
                    </Link>
            </ThemeProvider>
      </>
    )
}
export default SurveyLink;