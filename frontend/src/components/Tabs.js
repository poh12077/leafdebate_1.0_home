import React, { useState, useEffect, useRef } from "react";
import "../css/tab.css";
import Question from "./Question";
import contentFile from "../data/content.json";
import TypeTestQn from "./TypeTestQn";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
// import contentFile from "../data/testContent.json";

function Tabs() {

    function parseContentFile(content, qnStatement, tabSize, tabNames, tabPages, optionStatement, qnTypes) {
        for (let i = 0; i < content.tabs.length; i++) {
            tabNames.push(content.tabs[i].tabName);
            tabPages.push(i);
            let qnList = [];
            let statement = [];
            let optionsInsingleTab = [];
            let types = [];
            for (let j = 0; j < content.tabs[i].qn.length; j++) {
                qnList.push(j);
                statement.push(content.tabs[i].qn[j].statement);
                types.push(content.tabs[i].qn[j].qnType);
                let optionsInsingleQn = [];
                for (let k = 0; k < content.tabs[i].qn[j].options.length; k++) {
                    optionsInsingleQn.push({ num: k, statement: content.tabs[i].qn[j].options[k] });
                }
                optionsInsingleTab.push(optionsInsingleQn);
            }
            tabSize.push(qnList);
            qnStatement.push(statement);
            qnTypes.push(types);
            optionStatement.push(optionsInsingleTab);
        }
    }

    const [tabNum, setTabNum] = useState(0);
    const content = contentFile;

    let qnStatement = [];
    let tabSize = [];
    let tabNames = [];
    let tabPages = [];
    let optionStatement = [];
    let qnTypes = [];

    parseContentFile(content, qnStatement, tabSize, tabNames, tabPages, optionStatement, qnTypes);

    return (
        <div className="tabContainer">
            <div className="tabMenu">
                {tabPages.map(
                    (tabPage) => {
                        return <TabMenuButton tabNum={tabNum} setTabNum={setTabNum} clickedTabNum={tabPage} tabName={tabNames[tabPage]} ></TabMenuButton>
                    }
                )}
            </div>

            <div className="tabContentWrapper">
                {tabPages.map(
                    (tabPage) => {
                        return <Tab tabNum={tabNum} clickedTabNum={tabPage} tabName={tabNames[tabPage]} optionsInsingleTab={optionStatement[tabPage]} qnList={tabSize[tabPage]} qnStatement={qnStatement[tabPage]} qnTypes={qnTypes[tabPage]} ></Tab>
                    }
                )}
            </div>
        </div>
    );
}


function Tab(props) {
    const movePage = useNavigate();
    function goToTypeResult() {
        movePage('/TypeResult');
    }

    function reqType() {
        let body = {
        }
        axios({
            method: 'post',
            url: process.env.REACT_APP_BACKEND+'/reqType',
            validateStatus: function (status) {
                return status >= 200 && status < 300; // default
            },
            data: body,
            timeout: 5000
        }).then(
            (res) => {
                goToTypeResult();
            }
        ).catch(
            (err) => {
                try {
                    if (err.response.status == 401) {
                        alert('????????? ??? ?????? ???????????????');
                    } else if (err.response.status == 400) {
                        alert('???????????? ?????? ????????? ????????????');
                    } else {
                        alert('????????? ??? ?????? ???????????????');
                    }
                } catch (error) {
                    //server timeout
                    alert('????????? ??? ?????? ???????????????');
                }
            }
        )
    }

    function getTypeBtnVisibility(tabName) {
        if (tabName === 'love') {
            return 'visible'
        } else {
            return 'hidden'
        }
    }

    function getCookie(name) {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : false;
    }


    const child = useRef();

    useEffect(() => {
        if ( JSON.parse( getCookie('login') ) )  {
            child.current.checkPreviosAnswer();
        } 
    });

    return (
        <div className={props.tabNum === props.clickedTabNum ? "tabContent  activeTabcontent" : "tabContent"}   >
            {props.qnList.map(
                (qnNum) =>
                    <div  >
                        {props.tabName === 'love'
                            ? <TypeTestQn key={qnNum} ref={child} questionNum={qnNum} tabName={props.tabName} qnStatement={props.qnStatement[qnNum]} options={props.optionsInsingleTab[qnNum]} qnType={props.qnTypes[qnNum]} ></TypeTestQn>
                            : <Question key={qnNum} ref={child} questionNum={qnNum} tabName={props.tabName} qnStatement={props.qnStatement[qnNum]} options={props.optionsInsingleTab[qnNum]} qnType={props.qnTypes[qnNum]} ></Question>
                        }
                    </div>
            )}
            <button id="getTypeBtn" type="button" onClick={reqType} style={{ visibility: getTypeBtnVisibility(props.tabName) }}  >TYPE ??????</button>
        </div>
    )
}

function TabMenuButton(props) {

    function translateTabName(tabName) {
        switch (tabName) {
            case 'love':
                return '??????';
            case 'marriage':
                return "??????";
            case 'politics':
                return "??????";
            case 'work':
                return '???';
            case 'social_issue':
                return '?????? ??????';
            default:
                return 'tab';
        }
    }

    return (
        <button className={props.tabNum === props.clickedTabNum ? "tab activeTab" : "tab"} onClick={() => props.setTabNum(props.clickedTabNum)}> {translateTabName(props.tabName)} </button>
    )
}

export default Tabs;
