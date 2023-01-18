import { Component } from 'react';
import axios from "axios";
// import React from 'react';

class App extends Component{

  constructor(){
    super();
    this.state={
      isChecked : false
    }
  }

  handleChange = (e) =>{
    this.setState({
      isChecked: e.target.checked
    })
  }

  handleFormSubmit = (e) =>{
    e.preventDefault();
    this.check();
  }

  check = () =>{
    const url = '/check';
    const formData = new FormData();
    formData.append('isChecked', this.state.isChecked);
    const config = {
        headers: {
            'content-type': 'multipart/form-data'
        }
    }
    return axios.post(url, formData, config);
  }

  render(){
    return(
      <form onSubmit={this.handleFormSubmit}>
      <label>
      <input 
          type="checkbox"
          // checked={this.state.isChecked}
          onChange={this.handleChange}
        /> {this.state.isChecked.toString()}
      </label>
      <br/>
      <button type="submit">adding</button>
      </form>
    )
  }

}

export default App;
