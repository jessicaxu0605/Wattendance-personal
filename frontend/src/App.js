import ScrollTop from './components/ScrollTop.js';
import Homepage from './Homepage';
import Loginpage from './Loginpage';
import Profile from './Profile';
import Navbar from './components/Navbar.js';
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
    setLoginState(true);
    setUser(newUser);
  }
  const handleLogout = () => {
    localStorage.removeItem('token');
    setLoginState(false);
    setUser(null);
  }


  return (
    <UserContext.Provider value={{ value: user, function: setUser }}>
      <div className="App">
        <Navbar loginState={loginState} login={handleLogin} logout={handleLogout} clear={location.pathname === '/' || location.pathname === '/signup' || location.pathname === '/login' ? true : false} />
        <ScrollTop /> {/*listens for change in route; if detected, scroll to top of page; does not render any HTML*/}
        <Routes>
          <Route path='/' element={<Landing loginState={loginState}/>} />
          <Route path='/home' element={<Homepage />} />
          <Route path='/survey' element={<Survey loginState={loginState} login={handleLogin}/>} />
          <Route path='/login' element={<Loginpage loginState={loginState} login={handleLogin} />} />
          <Route path='/signup' element={<SignUp loginState={loginState} login={handleLogin} />} />
          <Route path='/profile' element={<Profile loginState={loginState} login={handleLogin}/>} />
        </Routes>
      </div>
    </UserContext.Provider>
  );
}

export default App;
