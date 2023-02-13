// import "./styles.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import '../css/login.css';
import { useEffect } from 'react';
import { gapi } from 'gapi-script';
import GoogleOauthLogin from "./GoogleOauthLogin";
import GoogleOauthLogout from "./GoogleOauthLogout";

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';


//for google oauth
const clientId = '875061534392-5kpb602jcee44q2dtms181aahsh7lnnk.apps.googleusercontent.com';

function Login() {
  const [inputs, setInputs] = useState({});

  const movePage = useNavigate();

  function goToMainPage() {
    movePage('/MainPage');
}

function goToSignup() {
  movePage('/Signup');
}



  const handleSubmit = (event) => {
    event.preventDefault();
    sendAccount().then(
      () => {
        movePage('/MainPage');
      }
    ).catch(
      (err) => {
        if (err.response.data == 1) {
          alert('password wrong');
        } else if (err.response.data == 2) {
          alert('id wrong');
        } else {
          alert('server down');
        }
      }
    );
  }

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs(values => ({ ...values, [name]: value }))
  }

  let sendAccount = () => {
    const url = '/sendAccount';
    const formData = new FormData();
    formData.append('id', inputs.id);
    formData.append('password', inputs.password);
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }
    return axios.post(url, formData, config);
  }

  //for google oauth
  useEffect(() => {
    function start() {
      gapi.client.init({
        clientId: clientId,
        scope: ''
      })
    };

    gapi.load('client:auth2', start);
  })


  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              깻잎 논쟁
            </Typography>
            <Button color="inherit" onClick={goToMainPage} >MainPage</Button>
          </Toolbar>
        </AppBar>
      </Box>
      <div className="page">
        <form className="cover" onSubmit={handleSubmit}>
          <h1>깻잎 논쟁</h1>
          <input className="loginInput"
            type="text"
            name="id"
            // value={inputs.id || ""}
            onChange={handleChange}
            placeholder="ID"
          />
          <input className="loginInput"
            type="text"
            name="password"
            // value={inputs.password || ""}
            onChange={handleChange}
            placeholder="password"
          />
          <button className="login-btn" type="submit">Login</button>
          <button className="login-btn" type="submit" onClick={goToSignup}>Sign Up</button>
          {/* <GoogleOauthLogin></GoogleOauthLogin>
          <GoogleOauthLogout></GoogleOauthLogout> */}

        </form>
      </div>

    </div>

  )
}

export default Login;