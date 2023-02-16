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

    const reqAuth = (event) => {
        event.preventDefault();
        let body = {
            telNum: inputs.telNum
        }

        axios({
            method: 'post',
            url: '/reqAuth',
            validateStatus: function (status) {
                return status >= 200 && status < 300; // default
            },
            data: body,
            timeout: 5000
        }).then(
            (res) => {
                    alert('인증 요청하였습니다');
            }
        ).catch(
            () => {
                //logic have not been completed
                alert('인증 요청 실패하였습니다.');
            }
        )


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
                    alert('회원가입 되었습니다');
                    movePage('/MainPage');
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
                    <div>
                        <input
                            type="text"
                            name="telNum"
                            onChange={handleChange}
                            placeholder="- 빼고 숫자만 입력"
                        />
                        <button type="button" onClick={reqAuth}  >인증 요청</button>
                    </div>
                    <input className="loginInput"
                        type="text"
                        name="authNum"
                        onChange={handleChange}
                        placeholder="인증번호"
                    />
                    <button className="login-btn" type="submit">Sign UP</button>
                </form>
            </div>
        </div>


    )
}

export default Signup;