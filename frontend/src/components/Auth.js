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


function Auth() {
    const [inputs, setInputs] = useState({});

    const movePage = useNavigate();

    function goToMainPage() {
        movePage('/MainPage');
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        sendAuthNum();
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

    function sendAuthNum() {
        let body = {
            authNum : inputs.authNum
        }

        axios({
            method: 'post',
            url: '/sendAuthNum',
            validateStatus: function (status) {
                return status >= 200 && status < 300; // default
            },
            data: body,
            timeout: 5000
        }).then(
            (res) => {
               alert('회원가입 되었습니다');
               movePage('/MainPage');
            }
        ).catch(
            (err) => {
                try {
                    if(err.response.status==401){
                        alert('인증 번호가 다릅니다.');
                    }else if(err.response.status==408){
                        alert('입력 시간이 초과하였습니다.');
                    }else{
                        alert('인증이 실패 하였니다.');
                    }
                } catch (error) {
                    //server timeout
                    alert('인증이 실패 하였니다.');
                }
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
                    <p>인증 요청후 3분 이내에 인증하여야 합니다</p>
                    <div>
                        <input
                            type="text"
                            name="telNum"
                            onChange={handleChange}
                            placeholder="- 빼고 숫자만 입력"
                            maxlength="15"
                        />
                        <button type="button" onClick={reqAuth}  >인증 요청</button>
                    </div>
                    <input className="loginInput"
                        type="text"
                        name="authNum"
                        onChange={handleChange}
                        placeholder="인증번호"
                        maxlength="10"
                    />
                    <button className="login-btn" type="submit">회원 가입</button>
                </form>
            </div>
        </div>
    )
}

export default Auth;