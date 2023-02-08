// import "./styles.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import '../css/login.css';

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';


function Signup() {
    const [inputs, setInputs] = useState({});

    const movePage = useNavigate();

    function goToMainPage() {
        movePage('/MainPage');
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        sendSignupInfo();
    }

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({ ...values, [name]: value }))
    }

   

    function sendSignupInfo() {
        let body = {
            id: inputs.id,
            password: inputs.password,
            gender: inputs.gender,
            birthday : inputs.birthday
        }

        axios({
            method:'post',
            url: '/sendSignupInfo',
            validateStatus: function (status) {
                return status >= 200 && status < 300; // default
              },
              data: body,
              timeout: 5000
        }).then(
            (res)=>{
                alert('your are signed up');
                movePage('/MainPage');
            }
        ).catch(
            ()=>{
                alert('something wrong');
            }
        )

    }


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
                            leaf debate
                        </Typography>
                        <Button color="inherit" onClick={goToMainPage} >mainPage</Button>
                    </Toolbar>
                </AppBar>
            </Box>
            <div className="page">
                <form className="cover" onSubmit={handleSubmit}>
                    <h1>leaf debate</h1>
                    <input className="loginInput"
                        type="text"
                        name="id"
                        // value={inputs.id || ""}
                        onChange={handleChange}
                        placeholder="ID"
                    />
                    <input className="loginInput"
                        type="text"
                        // type="password"
                        name="password"
                        // value={inputs.password || ""}
                        onChange={handleChange}
                        placeholder="password"
                    />
                    <input className="loginInput"
                        type="number" min="1900" max="2099" step="1"
                        // type="month"
                        name="birthday"
                        // value={inputs.birthday || ""}
                        onChange={handleChange}
                        placeholder="birthday ex)1993"
                    />
                    <div id="genderSignup" >
                        male <input className="genderRadio"
                            type="radio"
                            name="gender"
                            value="male"
                            onChange={handleChange}
                        />
                        female <input className="genderRadio"
                            type="radio"
                            name="gender"
                            value="female"
                            onChange={handleChange}
                        />
                    </div>
                    <button className="login-btn" type="submit">Sign UP</button>
                </form>
            </div>
        </div>


    )
}

export default Signup;