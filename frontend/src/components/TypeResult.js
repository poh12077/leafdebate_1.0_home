import { useNavigate } from 'react-router-dom';
import '../css/typeResult.css';

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

let TypeResult = () => {

    const movePage = useNavigate();

    function goToMainPage() {
        movePage('/MainPage');
    }

    function getCookie(name) {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
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


            <div id='wholeTypeResult' >
                <h1 id='typeResultH1'>당신의 type 은 {getCookie('yhti')}입니다</h1>
                <div id='typeResultDiscription' >
                    <div className='type'>
                        <h3>사랑받기(<mark>T</mark>ake) vs 사랑하기(<mark>G</mark>ive)</h3>
                        <p>사랑 받기 : 상대방을 사랑하는 것 보다 사랑 받는것이 중요한 타입</p>
                        <p>사랑 하기 : 사랑 받는것 보다 사랑 하는것이 더 중요한 타입</p>
                    </div>

                    <div className='type'>
                        <h3>애정표현이 많은( <mark>E</mark>xpressive)  vs 애정표현이 적은( <mark>L</mark>ess Expressive)</h3>
                    </div>

                    <div className='type'>
                        <h3>함께( t<mark>O</mark>gether) vs 개인적인(<mark>I</mark>ndividual) </h3>
                        <p>함께 : 연락 많이 하고 싶고 더 자주 많나고 싶은 타입 </p>
                        <p>개인적인 : 개인적인 시간이 더 필요한 타입</p>
                    </div>

                    <div className='type'>
                        <h3>현재지향(at the <mark>M</mark>oment) vs 미래지향(<mark>F</mark>uture) </h3>
                        <p>현재지향 : 현재 상대방이 좋으면 만난다</p>
                        <p>미래지향 : 오래 함께할 수 있는 사람을 만난다</p>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default TypeResult;