import React from 'react';
import { Component } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  elements,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import axios from "axios";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

class RadarChart extends Component {

  constructor(props) {
    super(props);

    this.state = {
      labels: [
        'option1',
        'option2',
        'option3',
        'option4',
        'option5',
        'option6'
      ],
      datasets: [{
        label: 'woman',
        data: [50, 70, 50, 70, 50, 50],
        fill: true,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)',
        pointBackgroundColor: 'rgb(255, 99, 132)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(255, 99, 132)'
      }, {
        label: 'man',
        data: [50, 70, 50, 70, 50, 50],
        fill: true,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        pointBackgroundColor: 'rgb(54, 162, 235)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(54, 162, 235)'
      }]
    }
  }

 
  componentDidMount() {
    let body = {
      gender: 'male',
      questionNum: this.props.questionNum
    }
    axios.post(process.env.REACT_APP_BACKEND+'/api/responseResult', body)
      .then(
        (res) => {
          this.setState(
            (prevStat) => {

              let responseResult = [];
              for (let key in res.data[0]) {
                if (key !== 'questionnum') {
                  responseResult.push(res.data[0][key]);
                }
              }

              return {
                datasets: prevStat.datasets.map(
                  eli => {
                    return {
                      ...eli,
                      data: responseResult
                    }
                  }
                )
              }
            }
          )
        }
      )
  }


  render() {
    return <Radar data={this.state} />;
  }
}

export default RadarChart;
