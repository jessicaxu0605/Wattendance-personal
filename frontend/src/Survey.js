import { useState } from "react";
import { Link } from 'react-router-dom';
import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import cover from "./images/background.png";
import Slider from './Slider';
import Stack from '@mui/material/Stack';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';

import UserContext from './UserContext.js';
import Unauthorized from "./Unauthorized.js";

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


function Survey(props) {
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
            console.log(result);
            props.login(result.user);
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
    let userID;
    if (props.loginState) {
        userID = user.id;
    }
    
    const [courses, setCourses] = React.useState([]);
    const [dataFetched, setDataFetched] = React.useState(false);

    const getCourses = async() => {
        const options = {
            mode: 'cors',
            method: 'GET',
        }
        const response = await fetch(`http://18.222.148.248:3600/enrolled-courses/${userID}`, options);
        const result = await response.json();
        setCourses(result); 
        setDataFetched(true);
    }


        React.useEffect(() => {
            if (doneAuth) getCourses(); 
        }, [doneAuth]);

        const menuItems = courses.map(course => (
            <MenuItem key={course.idcourses} value={course.idcourses}>
                {`${course.courseCode} (${course.courseName})`}
            </MenuItem>
        ));
      
    const [sliderValues, setSliderValues] = useState({
        q1: 1,
        q2: 1,
        q3: 1,
        q4: 1
    });
    const handleSliderChange = (name, value) => {
        setSliderValues((prevValues) => ({
            ...sliderValues,
            [name]: value,
        }));
    };
    const handleSubmit = async () => {
        const options = {
            mode: 'cors',
            method: 'POST',
            headers: { 'Content-Type': 'application/JSON' },
            body: JSON.stringify({
                'courseID': course,
                'userID': userID,
                'q1': sliderValues['q1'],
                'q2': sliderValues['q2'],
                'q3': sliderValues['q3'],
                'q4': sliderValues['q4'],

            })
        }
        const response = await fetch('http://18.222.148.248:3600/survey-result', options);
        const result = await response.json();
    };

    const [course, setCourse] = React.useState('');

    const handleChange = (event) => {
        setCourse(event.target.value);
    };

    if (doneAuth && props.loginState)
    return (
        <>
            <div style={{
                width: '100%', top: 'calc(0vh-100px)', height: '100%', backgroundImage: `url(${cover})`,
                backgroundSize: 'cover', backgroundRepeat: 'no-repeat', position: 'fixed',
                zIndex: '-1'
            }}>
            </div >

            <ThemeProvider theme={theme}>
                <Stack spacing={2} direction="column" sx={{ pr: '250px', pl: '250px', pt: '100px' }} alignItems="center">

                    <Typography variant="h4" gutterBottom>
                        Academic Survey
                    </Typography>
                    <FormControl>
                        <InputLabel id="course">Course</InputLabel>
                        <Select
                            labelId="course"
                            id="select"
                            value={course}
                            label="Course"
                            onChange={handleChange}
                            sx={{ minWidth: '150px' }}

                        >
                            {dataFetched ? menuItems : menuItems}

                        </Select>
                    </FormControl>
                    <Box >
                        <Typography variant="h6" gutterBottom>
                            On a scale of 1 - 10, how often do you attend lectures for this class?
                        </Typography>
                    </Box>
                    <Slider name='q1' onChange={handleSliderChange} />
                    <Box >
                        <div className='spacer'></div>
                        <Typography variant="h6" gutterBottom>
                            On a scale of 1 - 10, do you think these lectures have made a positive contribution to your academic success?
                        </Typography>
                    </Box>
                    <Slider name='q2' onChange={handleSliderChange} />

                    <Box>
                        <div className='spacer'></div>
                        <Typography variant="h6" gutterBottom>
                            On a scale of 1 - 10, how would you rate the overall importance of attending lectures in your academic journey?
                        </Typography>
                    </Box>

                    <Slider name='q3' onChange={handleSliderChange} />


                    <Box>
                        <div className='spacer'></div>
                        <Typography variant="h6" gutterBottom>
                            On a scale of 1 to 10, to what extent do you believe that missing lectures has negatively impacted your academic performance?
                        </Typography>
                    </Box>
                    <Slider name='q4' onChange={handleSliderChange} />

                    <br></br>
                    <br></br>
                    <Link to='/profile'>
                    <Button variant="contained" color="primary" onClick={handleSubmit}
                        sx={{ ml: '60px', display: 'block', width: "200px" }}>Submit</Button></Link>
                    <br></br>
                    <br></br>
                    <br></br>
                    <br></br>
                </Stack>
            </ThemeProvider>

        </>
    );
    else if (doneAuth) {
        return(
          <Unauthorized/>
        )
      } else return <></>
}
export default Survey;

