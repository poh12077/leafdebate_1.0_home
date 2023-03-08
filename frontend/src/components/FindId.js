// import "./styles.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import '../css/login.css';
import '../css/auth.css';

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

    function disableBtn()  {
        const target = document.getElementById('reqAuthBtn');
        target.disabled = true;
      }

    const reqAuth = (event) => {
        event.preventDefault();
        disableBtn();
        let body = {
            telNum: inputs.telNum
        }

        axios({
            method: 'post',
            url: process.env.REACT_APP_BACKEND+'/reqAuthToFindId',
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
            (err) => {
                if(err.response.status==401){
                    alert('가입된적 없는 휴대폰 번호입니다.');
                }else if(err.response.status==400){
                    alert('sens sms api server error.');
                }else if(err.response.status==429){
                    alert('3분후에 다시 요청하시기 바랍니다')
                }else if (err.response.status==500){
                    alert('서버에 문제가 있습니다.');
                }else{
                    alert('서버에 문제가 있습니다.');
                }
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
            url: process.env.REACT_APP_BACKEND+'/sendAuthNumToFindId',
            validateStatus: function (status) {
                return status >= 200 && status < 300; // default
            },
            data: body,
            timeout: 5000
        }).then(
            (res) => {
                let id = res.data.id;
                let password = res.data.password;
               alert(`아이디 : ${id}\n비밀번호 : ${password}`);
               movePage('/MainPage');
            }
        ).catch(
            (err) => {
                try {
                    if(err.response.status==401){
                        alert('인증 번호가 다릅니다.');
                    }else if(err.response.status==408){
                        alert('전화번호를 잘못 입력하였거나 입력시간이 초과하였습니다.');
                    }else{
                        alert('인증이 실패하였습니다.');
                    }
                } catch (error) {
                    //server timeout
                    alert('인증이 실패하였습니다.');
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
                            회원가입
                        </Typography>
                        <Button color="inherit" onClick={goToMainPage} >mainPage</Button>
                    </Toolbar>
                </AppBar>
            </Box>
            <div className="page">
                <form className="authCover" onSubmit={handleSubmit}>
                    <h2>핸드폰 문자 인증</h2>
                    <div id="reqAuth">
                        <input id="reqAuthInput"
                            type="text"
                            name="telNum"
                            onChange={handleChange}
                            placeholder="핸드폰번호 숫자만 입력"
                            maxlength="15"
                            minlength="6"
                        />
                        <button id="reqAuthBtn" type="button" onClick={reqAuth}>인증 요청</button>
                    </div>
                    <input className="loginInput"
                        type="text"
                        name="authNum"
                        onChange={handleChange}
                        placeholder="인증번호"
                        maxlength="10"
                        minlength="3"
                    />
                    <button className="login-btn" type="submit">아이디 찾기</button>
                </form>
            </div>
        </div>
    )
}

export default Auth;