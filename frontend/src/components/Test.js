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

let CheckBoxOne = () => {
  const checkOnlyOne = (checkThis) => {
    const checkboxes = document.getElementsByClassName('test')
    for (let i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i] !== checkThis) {
        checkboxes[i].checked = false
      }
    }
  }
  return (
    <>
      <input type="checkbox" class="test" value="1" onChange={(e) => checkOnlyOne(e.target)} /> 1
      <br />
      <input type="checkbox" class="test" value="2" onChange={(e) => checkOnlyOne(e.target)} /> 2
      <br />
      <input type="checkbox" class="test" value="3" onChange={(e) => checkOnlyOne(e.target)} /> 3
      <br />
    </>
  )
}


export default CheckBoxOne;