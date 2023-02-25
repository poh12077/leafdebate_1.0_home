import { useNavigate } from 'react-router-dom';
import '../css/contact.css';

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import profile from "../data/profile.jpg";

let Contact = () => {

    const movePage = useNavigate();

    function goToMainPage() {
        movePage('/MainPage');
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
                        <Button color="inherit" onClick={goToMainPage} >Main Page</Button>
                    </Toolbar>
                </AppBar>
            </Box>

            <img id='profileImg' src={profile} alt="profile"  />

            <div id='profileInfo' >
                <p>개발자 : 박영화</p>
                <p>contact : 010-9416-2506</p>
                <p>email : poh1207@gmail.com</p>
                <p>insta : poh12077 </p>
                <p>skill : Full-Stack </p>
                <p  style={{ color: "Tomato" }} >구글인사팀 연락바람</p>
            </div>
        </div>
    );
}

export default Contact;