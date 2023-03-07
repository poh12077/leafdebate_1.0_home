import { useNavigate } from 'react-router-dom';
import Tabs from './Tabs';
import '../css/mainPage.css';

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import axios from "axios";

let MainPage = () => {

    const movePage = useNavigate();

    function goToLogin() {
        movePage('/Login');
    }

    function goToSignup() {
        movePage('/Signup');
    }

    function goToContact() {
        movePage('/Contact');
    }

    function logout(){
        axios({
            method: 'get',
            url: '/logout',
            validateStatus: function (status) {
              return status >= 200 && status < 300; // default
            },
            timeout: 5000
          }).then(
            ()=>{
                alert('로그 아웃 되었습니다');
                let target = document.getElementById('logoutBtn');
                target.style.display='none';

                target = document.getElementById('loginBtn');
                target.style.display='inline';

                target = document.getElementById('signupBtn');
                target.style.display='inline';
            }
          ).catch(
          
          )
    }

    function checkLoginStatusOfSignedCookie(){
        let cookie = document.cookie;
        if(cookie.indexOf('login=')>-1){
            // login cookie exist
            let loginStatus = cookie.substring( cookie.indexOf('login=') + 10 ).charAt(0);
            if(loginStatus==='t'){
                return true
            }else if (loginStatus ==='f'){
                return false
            }else{
                return false
            }
        }else{
            // login cookie doesn't exist
            return false;
        }
    }

    function getCookie(name) {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : false;
    }

    function loginVisibility(boolean){
        if(boolean){
            return 'none'
        }else{
            return 'inline'
        }
    }

    function signupVisibility(boolean){
        if(boolean){
            return 'none'
        }else{
            return 'inline'
        }
    }

    function logoutVisibility(boolean){
        if(boolean){
            return 'inline'
        }else{
            return 'none'
        }
    }
  
    return (
        <div  >
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static">
                    <Toolbar>
                        {/* <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton> */}
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            깻잎논쟁
                        </Typography>
                        <Button id='loginBtn' color="inherit" onClick={goToLogin} style={{ display : loginVisibility(getCookie("login"))  }}  >로그인</Button>
                        <Button id='signupBtn' color="inherit" onClick={goToSignup} style={{  display : signupVisibility(getCookie("login"))  }} >회원가입</Button>
                        <Button id ='logoutBtn' color="inherit" onClick={logout} style={{ display : logoutVisibility(getCookie("login"))  }}  >로그아웃</Button>
                        <Button color="inherit" onClick={goToContact} >Contact</Button>
                    </Toolbar>
                </AppBar>
            </Box>

            <Tabs className='mainPage' ></Tabs>
        </div>
    );

}

export default MainPage;