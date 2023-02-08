import React from "react";
import axios from "axios";
import '../style.css';
import DoughnutChart from "./DoughnutChart";
import RadarChart from "./RadarChart";
import BarChart from "./BarChart";
import Test from './Test';

class Question extends React.Component {

  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.state = {
      options: this.props.options ,
      checkedOption: "",
      questionNum: 0
    }
  }

  handleChange = (e) => {
    if (e.target.checked) {
      this.setState({
        checkedOption: e.target.value
      })
    }
  }

  handleFormSubmit = (e) => {
    e.preventDefault();
    this.setState({
      questionNum: this.props.questionNum
    }, this.check)
  }

  check = () => {
    let body = {
      checkedOption: this.state.checkedOption,
      questionNum: this.state.questionNum,
      gender: 'female',
      tabName: this.props.tabName
    }

    axios({
      method: 'post',
      url: '/questionAnswer',
      validateStatus: function (status) {
        return status >= 200 && status < 300; // default
      },
      data: body,
      timeout: 5000
    }).then(
      (res) => {
        this.child.current.stateRefresh();
        // window.location.reload();
      }
    ).catch(
        () =>{
          console.log('no response from server');
        }
    )
  }

  // check = () => {
  //   const url = '/questionAnswer';
  //   const formData = new FormData();
  //   formData.append('checkedOption', this.state.checkedOption);
  //   formData.append('questionNum', this.state.questionNum);
  //   // formData.append('gender','male');
  //   formData.append('gender','female');
  //   formData.append('tabName', this.props.tabName);

  //   const config = {
  //     headers: {
  //       'content-type': 'multipart/form-data'
  //     }
  //   }
  //   axios.post(url, formData, config).then(
  //     (res)=>{
  //           this.child.current.stateRefresh();
  //       // window.location.reload();
  //     }
  //   );
  // }



  render() {
    return (
      <div className='question'>
        <form className="form" onSubmit={this.handleFormSubmit}>
          <fieldset className="fieldset" >
            <legend>{this.props.questionNum+". "+this.props.questionStatement }</legend>
            {
              this.state.options.map(option => (
                <div>
                  <label>
                    <input
                      type="checkbox"
                      value={option.num}
                      onChange={this.handleChange}
                    /> {option.statement}
                  </label>
                  <br />
                </div>
              ))
            }
            <br />
            <button className="formButton" type="submit"  >adding</button>
          </fieldset>
          {/* <RadarChart questionNum={this.props.questionNum} ></RadarChart> */}
          <BarChart questionNum={this.props.questionNum} ref={this.child} tabName={this.props.tabName} ></BarChart>
        </form>

      </div>

    )

  }
}

export default Question;