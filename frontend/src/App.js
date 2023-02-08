import { Component } from 'react';
import MainPage from './components/MainPage';
import Login from './components/Login';
import Signup from './components/Signup';
import Test from './components/Test';
import './style.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

class App extends Component {

    render() {
        return (
            <div className="App">
     
            <BrowserRouter>
                  <Routes>
                      <Route path={"/MainPage"} element={<MainPage />}></Route>
                      <Route path={"/Login"} element={<Login />}></Route>
                      <Route path={"/Signup"} element={<Signup />}></Route>
                      <Route path={"/"} element={<MainPage />}></Route>
                      <Route path={"/test"} element={<Test />}></Route>
                  </Routes>
                </BrowserRouter>
              </div>

        )
    }


}

export default App;