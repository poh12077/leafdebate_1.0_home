import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import axios from "axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

class BarChart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      labels: [
        '1번',
        '2번',
        '3번',
        '4번',
        '5번',
        '6번'
      ],
      datasets: [
        {
          key:'female',
          label: 'woman',
          data: null,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
        {
          key:'male',
          label: 'man',
          data: null,
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
      ],
    }

  }

  options = {
    animation: {
      //time
      duration: 1000  
    },
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
        text: 'Chart.js Bar Chart',
      },
    },
  };

  callApi = (gender) => {
    let body = {
      gender: gender,
      questionNum: this.props.questionNum,
      tabName : this.props.tabName
    }

    axios({
      method:'post',
      url: '/api/responseResult',
      validateStatus: function (status) {
        return status >= 200 && status < 300; // default
      },
      data: body,
      timeout: 5000
    }) .then(
      (res) => {
        this.setState(
          (prevStat) => {

            let responseResult = [];
            for (let key in res.data[0]) {
              if (key !== 'qn_num') {
                responseResult.push(res.data[0][key]);
              }
            }

            return {
              datasets: prevStat.datasets.map(
                eli => {
                  if(eli.key===body.gender){
                    return {
                      ...eli,
                      data: responseResult
                    }
                  }else{
                    return eli;
                  }
                 
                }
              )
            }
          }
        )
      }
    ).catch(()=>{
      alert('서버에 문제가 있습니다');
    })
    
  }

  componentDidMount() {
    this.callApi('male');
    this.callApi('female');
  }

  stateRefresh = () => {
    this.callApi('male');
    this.callApi('female');
  }



  render() {
    return <Bar options={this.options} data={this.state} />;
  }
}

export default BarChart;