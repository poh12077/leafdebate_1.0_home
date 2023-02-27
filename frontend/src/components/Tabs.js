import { useState } from "react";
import "../css/tab.css";
import Question from "./Question";
import contentFile from "../data/content.json";
// import contentFile from "../data/testContent.json";
function Tabs() {

    function parseContentFile(content, qnStatement, tabSize, tabNames, tabPages, optionStatement, qnTypes) {
        for (let i = 0; i < content.tabs.length; i++) {
            tabNames.push(content.tabs[i].tabName);
            tabPages.push(i);
            let qnList = [];
            let statement = [];
            let optionsInsingleTab = [];
            let types=[];
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
    let qnTypes=[];

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
    return (
        <div className={props.tabNum === props.clickedTabNum ? "tabContent  activeTabcontent" : "tabContent"}   >
            {props.qnList.map(
                (qnNum) =>
                    <div  >
                        <Question key={qnNum} questionNum={qnNum} tabName={props.tabName} qnStatement={props.qnStatement[qnNum]} options={props.optionsInsingleTab[qnNum]} qnType={props.qnTypes[qnNum]} ></Question>
                        <br /><br /><br />
                    </div>
            )}
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
