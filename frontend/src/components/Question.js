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
      this.checkOnlyOne(e);
      this.setState({
        checkedOption: e.target.value,
        questionNum: this.props.questionNum,
        qnType: e.target.form[e.target.form.length-1].value  //qnType : formButton's value
      }, this.check)
    }
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
            // alert("투표 되었습니다")
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

  getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

  // componentDidMount() {
  //   if(this.getCookie('login')){
  //     if(n===0){
  //       this.checkPreviosAnswer();
  //       n++;
  //     }

  //   }else{

  //   }

  // }

  
  checkPreviosAnswer(){
    let body = {
      tabName: this.props.tabName
    }

      axios({
        method: 'post',
        url: '/getPreviosAnswer',
        validateStatus: function (status) {
          return status >= 200 && status < 300; // default
        },
        data: body,
        timeout: 5000
      }).then(
        (res) => {
          let previousAnswer = res.data;
          for (let qnNum in previousAnswer) {
            if(qnNum!=='id' && previousAnswer[qnNum]!==null){
              let elementId= this.props.tabName+'_'+qnNum+"Checkbox"+previousAnswer[qnNum];
              document.getElementById(elementId).setAttribute('checked',true);
            }
          }
        }
      ).catch(
        (err) => {
          alert('서버에 문제가 있습니다');
        }
      )
  }



  render() {
    return (
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
                      id={this.props.tabName+"_qn_"+this.props.questionNum+"Checkbox"+option.num}  
                      value={option.num}
                      onChange={this.handleChange}
                    /> {option.statement}
                  </label>
                  <br />
                </div>
              ))
            }
            <br />
            <button className="formButton" type="submit" value={this.props.qnType} style={{display:"none"}} >제출</button>
          </fieldset>
          {/* <RadarChart questionNum={this.props.questionNum} ></RadarChart> */}
          <BarChart questionNum={this.props.questionNum} ref={this.child} tabName={this.props.tabName} numOfOptions={this.state.options.length} ></BarChart>
        </form>
    )
  }
}

export default Question;