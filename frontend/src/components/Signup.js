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

    let goToMainPage = ()=>{
        movePage('/MainPage')
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
            birthday: inputs.birthday
        }

        axios({
            method: 'post',
            url: '/sendSignupInfo',
            validateStatus: function (status) {
                return status >= 200 && status < 300; // default
            },
            data: body,
            timeout: 5000
        }).then(
            (res) => {
                if (res.data.signup === true) {
                    // alert('');
                    movePage('/Auth');
                } else if (res.data.code === '23505') {
                    alert('이미 사용중인 ID 입니다.');
                } else {
                    alert('회원가입 실패하였습니다다.');
                }
            }
        ).catch(
            () => {
                //logic have not been completed
                alert('서버에 문제가 있습니다.');
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
                            깻잎논쟁
                        </Typography>
                        <Button color="inherit" onClick={goToMainPage} >mainPage</Button>
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
                        placeholder="아이디"
                        maxlength="15"
                    />
                    <input className="loginInput"
                        type="text"
                        // type="password"
                        name="password"
                        // value={inputs.password || ""}
                        onChange={handleChange}
                        placeholder="비밀번호"
                        maxlength="15"
                    />
                    <input className="loginInput"
                        type="number" min="1900" max="2099" step="1"
                        // type="month"
                        name="birthday"
                        // value={inputs.birthday || ""}
                        onChange={handleChange}
                        placeholder="태어난 년도 ex)1993"
                    />
                    <div id="genderSignup" >
                        남자 <input className="genderRadio"
                            type="radio"
                            name="gender"
                            value="male"
                            onChange={handleChange}
                        />
                        여자 <input className="genderRadio"
                            type="radio"
                            name="gender"
                            value="female"
                            onChange={handleChange}
                        />
                    </div>
                    <button className="login-btn" type="submit">다음</button>
                </form>
            </div>
        </div>
    )
}

export default Signup;