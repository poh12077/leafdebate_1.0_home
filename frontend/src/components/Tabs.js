import { useState } from "react";
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
            url: '/reqType',
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
                        alert('로그인을 먼저 해야 투표할수 있습니다');
                    } else if (err.response.status == 400) {
                        alert('제출하지 않은 문제가 있습니다');
                    } else {
                        alert('서버에 문제가 있습니다');
                    }
                } catch (error) {
                    //server timeout
                    alert('서버에 문제가 있습니다');
                }
            }
        )
    }

    return (
        <div className={props.tabNum === props.clickedTabNum ? "tabContent  activeTabcontent" : "tabContent"}   >
            {props.qnList.map(
                (qnNum) =>
                    <div  >
                        {/* <Question key={qnNum} questionNum={qnNum} tabName={props.tabName} qnStatement={props.qnStatement[qnNum]} options={props.optionsInsingleTab[qnNum]} qnType={props.qnTypes[qnNum]} ></Question> */}
                        <TypeTestQn key={qnNum} questionNum={qnNum} tabName={props.tabName} qnStatement={props.qnStatement[qnNum]} options={props.optionsInsingleTab[qnNum]} qnType={props.qnTypes[qnNum]} ></TypeTestQn>
                    </div>
            )}
            <button id="getTypeBtn" type="button" onClick={reqType}>TYPE 확인</button>
        </div>
    )
}

function TabMenuButton(props) {

    function translateTabName(tabName) {
        switch (tabName) {
            case 'love':
                return '연애';
            case 'marriage':
                return "결혼";
            case 'politics':
                return "정치";
            case 'work':
                return '일';
            case 'social_issue':
                return '사회 이슈';
            default:
                return 'tab';
        }
    }

    return (
        <button className={props.tabNum === props.clickedTabNum ? "tab activeTab" : "tab"} onClick={() => props.setTabNum(props.clickedTabNum)}> {translateTabName(props.tabName)} </button>
    )
}

export default Tabs;
