import {GoogleLogin, GoogleLogout} from 'react-google-login';

const clientId = '875061534392-5kpb602jcee44q2dtms181aahsh7lnnk.apps.googleusercontent.com';

function GoogleOauthLogout() {

    const onSuccess=() =>{
        console.log('logout');
    }

    return(
        <div id='signOutButton' >
            <GoogleLogout
                clientId={clientId}
                buttonText='Google Logout'
                onLogoutSuccess={onSuccess}
            />
        </div>
    )
}

export default GoogleOauthLogout;