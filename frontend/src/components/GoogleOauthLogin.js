import {GoogleLogin} from 'react-google-login';

const clientId = '875061534392-5kpb602jcee44q2dtms181aahsh7lnnk.apps.googleusercontent.com';

function GoogleOauthLogin() {

    const onSuccess=(res) =>{
        console.log('login',res.profileObj);
    }

    const onFailure = (res) =>{
        console.log('failed',res);
    }

    return(
        <div id='signInButton' >
            <GoogleLogin
                clientId={clientId}
                buttonText='Google Login'
                onSuccess={onSuccess}
                onFailure={onFailure}
                cookiePolicy={'single_host_origin'}
                isSignedIn={true}
            />
        </div>
    )
}

export default GoogleOauthLogin;