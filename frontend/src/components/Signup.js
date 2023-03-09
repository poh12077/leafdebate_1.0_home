// import "./styles.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import '../css/login.css';
import Auth from './Auth';

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
        if( isInputValid() ){
            sendSignupInfo();
        }else{
            alert("입력되지 않은 정보가 있거나 잘못된 입력 정보가 있습니다.")
        }
        
    }
   
    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({ ...values, [name]: value }))
    }
    
    function isInputValid(){
        let pattern = /\s/g; // tab, space

        if(inputs.id===undefined || inputs.password===undefined || inputs.gender===undefined){
            return false;
        }else if(inputs.id==="" || inputs.password==="" ){
            return false;
        }else if ( inputs.id.match(pattern) || inputs.password.match(pattern) ){
            return false;
        }
        else{
            return true;
        }
    }

    function sendSignupInfo() {
        let body = {
            id: inputs.id,
            password: inputs.password,
            gender: inputs.gender,
            // birthday: inputs.birthday
            birthday : '1993'
        }

        axios({
            method: 'post',
            url: process.env.REACT_APP_BACKEND+'/sendSignupInfo',
            validateStatus: function (status) {
                return status >= 200 && status < 300; // default
            },
            data: body,
            timeout: 5000
        }).then(
            (res) => {
                movePage('/Auth');
            }
        ).catch(
            (err) => {
                try {
                    if(err.response.status==400){
                        alert('이미 사용중인 ID 입니다.');
                    }else if(err.response.status==500){
                        alert('서버에 문제가 있습니다')
                    }else{
                        alert('서버에 문제가 있습니다')
                    }
                } catch (error) {
                    alert('서버에 문제가 있습니다')
                }
            }
        )
    }

    return (
        <div>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            {/* 회원가입 */}
                        </Typography>
                        <Button id="mainPageBtn" color="inherit" onClick={goToMainPage} >mainPage</Button>
                    </Toolbar>
                </AppBar>
            </Box>
            <div className="page">
                <form className="signupCover" onSubmit={handleSubmit}>
                    <h1>깻잎 논쟁</h1>
                    <input className="loginInput"
                        type="text"
                        name="id"
                        // value={inputs.id || ""}
                        onChange={handleChange}
                        placeholder="아이디"
                        maxlength="15"
                        minlength="1"
                    />
                    <input className="loginInput"
                        type="password"
                        name="password"
                        // value={inputs.password || ""}
                        onChange={handleChange}
                        placeholder="비밀번호"
                        maxlength="15"
                        minlength="1"
                    />
                    <input className="loginInput"
                        // type="number" min="1900" max="2099" step="1"
                        type="hidden"
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
                    <button className="login-btn" type="submit">가입</button>
                </form>
            </div>
        </div>
    )
}

export default Signup;