import '../style.css';
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
                alert('you are logout');
            }
          ).catch(
          
          )
    }

    return (

        <div  >
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
                        <Button color="inherit" onClick={goToLogin} >Login</Button>
                        <Button color="inherit" onClick={goToSignup} >Sign-up</Button>
                        <Button color="inherit" onClick={logout} >Logout</Button>
                    </Toolbar>
                </AppBar>
            </Box>

            <Tabs className='mainPage' ></Tabs>

        </div>
    );

}

export default MainPage;