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
      options: this.props.options,
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
        if (!res.data.login) {
          console.log(typeof res.data.login);
          // login have not been done
          alert("you should login first");
        }else if (res.data.didUserCheck){
          //votiong was already done
          alert("you cannot vote more than two times");
        } else {
          //voting is working 
          alert("It's been voted")
          this.child.current.stateRefresh();
          // window.location.reload();
        }
      }
    ).catch(
      () => {
        console.log('no response from server');
      }
    )
  }

  render() {
    return (
      <div className='question'>
        <form className="form" onSubmit={this.handleFormSubmit}>
          <fieldset className="fieldset" >
            <legend>{this.props.questionNum + ". " + this.props.questionStatement}</legend>
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