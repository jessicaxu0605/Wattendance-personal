import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
// import Divider from "@material-ui/core/Divider";
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { Link } from "react-router-dom";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Heatmap from './Github';
import NoOfSubmissions from './userCard';
import { Avatar } from '@mui/material';
import UserContext from './UserContext';
import ProfileClassesTable from './ProfileClassesTable';
import cover from "./images/background.png";
import Button from '@mui/material/Button';



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

function Copyright() {

  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Wattendance
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

function stringToColor(string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

function stringAvatar(name) {
  return {
    sx: {
      bgcolor: stringToColor(name),
      width: 120,
      height: 120,
      fontSize: 40,

    },
    children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
  };
}

export default function Album() {

  const user = React.useContext(UserContext).value;
  const componentStyles = {
    backgroundImage: 'url("./images/background-2.png")',
    backgroundRepeat: 'no-repeat',
  };
  return (
    <>
      <div style={{
        width: '100%', top: 'calc(0vh-100px)', height: '100%', backgroundImage: `url(${cover})`,
        backgroundSize: 'cover', backgroundRepeat: 'no-repeat', position: 'fixed',
        zIndex: '-1'
      }}>
      </div >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <main>
          {/* Hero unit */}
          <Box
            sx={{
              pt: 16,
              pb: 6,
              horizontalAlign: 'middle',
              // verticalAlignalign: 'middle',
              marginLeft: 5,
              marginRight: 5,
              marginBottom: 0,
              paddingBottom: 0,
              // height: '100vh'
            }}
          >
            <Stack
              direction="row"
              spacing={4}
              justifyContent="center"
              sx={{
                marginBottom: 5,

              }}
            >
              {user === null ?
                <Avatar {...stringAvatar('Jed Watson')} /> :
                <Avatar {...stringAvatar(`${user.firstName} ${user.lastName}`)} />}

              <Stack
                direction="column"
                justifyContent="center"
                align="left"
                spacing={1}
              >
                <Typography
                  component="h4"
                  variant="h4"
                  fontWeight="bold"
                  color="text.primary"
                >
                  {user === null ? 'Jed Watson' : `${user.firstName} ${user.lastName}`}
                </Typography>
                <Typography
                  component="h4"
                  variant="h4"
                  color="text.primary"
                >
                  Software Engineering
                </Typography>
                <Link style={{ textDecoration: "none" }} to={`/survey`}>
                  <Button variant="contained" color="primary" sx={{ display: 'block', width: "320px" }}>Complete a survey about yourself</Button>
                </Link>
              </Stack>
            </Stack>
            <NoOfSubmissions />
          </Box>
          <Container sx={{ py: 8 }} maxWidth="lg">
            <ProfileClassesTable />
            {/* End hero unit */}
          </Container>
        </main>
        {/* Footer */}
        <Box sx={{ p: 6 }} component="footer">
          <Typography variant="h6" align="center" gutterBottom>
            Wattendance
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            color="text.secondary"
            component="p"
          >
            Track your attendance
          </Typography>
          <Copyright />
        </Box>
        {/* End footer */}
      </ThemeProvider>
    </>
  );
}
