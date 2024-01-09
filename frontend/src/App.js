import ScrollTop from './ScrollTop';
import Homepage from './Homepage';
import Loginpage from './Loginpage';
import Profile from './Profile';
import Navbar from './Navbar';
import './App.css';
import * as React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import SignUp from './SignUp';
import Landing from './Landing';
import Survey from './Survey'
import UserContext from './UserContext.js';


function App() {
  const location = useLocation();
  const [loginState, setLoginState] = React.useState(false);
  const [user, setUser] = React.useState(null);

  const handleLogin = (newUser) => {
    if (!loginState)
      setLoginState(true);
    setUser(newUser);
  }
  const handleLogout = () => {
    if (loginState)
      setLoginState(false);
    setUser(null);
  }


  let AvailableRoutes;
  if (loginState) {
    AvailableRoutes = () => (
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='/home' element={<Homepage />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/survey' element={<Survey />} />
      </Routes>
    );
  } else {
    AvailableRoutes = () => (
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='/home' element={<Homepage />} />
        <Route path='/survey' element={<Survey />} />
        <Route path='/login' element={<Loginpage loginState={loginState} login={handleLogin} />} />
        <Route path='/signup' element={<SignUp loginState={loginState} login={handleLogin} />} />
        <Route path='/profile' element={<Profile />} />
      </Routes>
    );
  }

  return (
    <UserContext.Provider value={{ value: user, function: setUser }}>
      <div className="App">
        <Navbar loginState={loginState} logout={handleLogout} clear={location.pathname === '/' || location.pathname === '/signup' || location.pathname === '/login' ? true : false} />
        <ScrollTop /> {/*listens for change in route; if detected, scroll to top of page; does not render any HTML*/}
        <AvailableRoutes />
      </div>
    </UserContext.Provider>
  );
}

export default App;
