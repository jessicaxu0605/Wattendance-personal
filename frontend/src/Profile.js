import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
// import Divider from "@material-ui/core/Divider";
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Heatmap from './components/Github';
import NoOfSubmissions from './components/userCard';
import { Avatar } from '@mui/material';
import UserContext from './UserContext';
import ProfileClassesTable from './components/ProfileClassesTable';
import cover from "./images/background.png";
import Button from '@mui/material/Button';
import Unauthorized from './Unauthorized';
import SurveyLink from './components/SurveyLink';



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


function stringToColor(string) {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

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


export default function Profile(props) {
  const [doneAuth, setDoneAuth] = React.useState(false);
  const tryAuthenticate = async (event) => {
    const token = localStorage.getItem('token')
    if (token) {
      const options = {
        mode: 'cors',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
      const response = await fetch('http://18.222.148.248:3600/authenticate', options);
      
      const result = await response.json();
      const status = await response.status;
      if (status === 200) {
        //setUser();
        console.log(result.user);
        props.login(result.user);
        console.log(props.loginState);
      }
      setDoneAuth(true);
    }
  }  
  
  React.useEffect(()=> {
    if (!props.loginState) {
        tryAuthenticate();
    } else {
        setDoneAuth(true);
    }
}, []);


  const user = React.useContext(UserContext).value;
  const componentStyles = {
    backgroundImage: 'url("./images/background-2.png")',
    backgroundRepeat: 'no-repeat',
  };
  
  if (props.loginState)
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
                  <SurveyLink/>
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
          </Box>
          {/* End footer */}
        </ThemeProvider>
      </>
    );
  else if (doneAuth) {
    return(
      <Unauthorized/>
    )
  } else return <></>
}

