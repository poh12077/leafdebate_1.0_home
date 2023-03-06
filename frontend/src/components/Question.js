import React from "react";
import axios from "axios";
import '../css/question.css';
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
      checkedOption: 0,
      questionNum: 0,
      qnType:""
    }
  }

  handleChange = (e) => {
    if (e.target.checked) {
      this.setState({
        checkedOption: e.target.value
      })
    }
    this.checkOnlyOne(e);
  }

  checkOnlyOne = (e) => {
    const checkboxes = document.getElementsByClassName(e.target.className)
    for (let i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i] !== e.target) {
        checkboxes[i].checked = false
      }
    }
  }

  handleFormSubmit = (e) => {
    e.preventDefault();
    this.setState({
      questionNum: this.props.questionNum,
      qnType: e.target[e.target.length-1].value  //qnType : formButton's value
    }, this.check)
  }

  check = () => {
    let body = {
      checkedOption: this.state.checkedOption,
      questionNum: this.state.questionNum,
      tabName: this.props.tabName,
      qnType : this.state.qnType
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
            //voting is working 
            alert("투표 되었습니다")
            this.child.current.stateRefresh();
            // window.location.reload();
        }
      ).catch(
        (err) => {
          try {
            if(err.response.status==401){
              alert('로그인을 먼저 해야 투표할수 있습니다');
            }else if(err.response.status==400){
              alert('');
            }else{
              alert('서버에 문제가 있습니다');
            }
          } catch (error) {
            //server timeout
            alert('서버에 문제가 있습니다');
          }
        }
      )

  }

  render() {
    return (
      <div className='question'>
        <form className="form" onSubmit={this.handleFormSubmit}>
          <fieldset className="fieldset" >
            <legend>{this.props.questionNum + ". " + this.props.qnStatement}</legend>
            {
              this.state.options.map(option => (
                <div>
                  <label>
                    <input
                      type="checkbox"
                      className= {this.props.tabName+"Qn"+this.props.questionNum+"Checkboxs"}  
                      value={option.num}
                      onChange={this.handleChange}
                    /> {option.statement}
                  </label>
                  <br />
                </div>
              ))
            }
            <br />
            <button className="formButton" type="submit" value={this.props.qnType} >제출</button>
          </fieldset>
          {/* <RadarChart questionNum={this.props.questionNum} ></RadarChart> */}
          <BarChart questionNum={this.props.questionNum} ref={this.child} tabName={this.props.tabName} numOfOptions={this.state.options.length} ></BarChart>
        </form>
      </div>
    )
  }
}

export default Question;