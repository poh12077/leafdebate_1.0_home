import { useState } from "react";
import "../css/tab.css";
import Question from "./Question";

function Tabs() {
    const [tabNum, setTabNum] = useState(0);

    let questionList = [0, 1, 2, 3, 4];
    let loveTab = ['aa', 'bb', 'cc', 'dd', 'ee'];
    let marriageTab = ['ff', 'g', 'h', 'dd', 'ee'];
    let questionStatement = [loveTab, marriageTab];
    let tabName = ['love', 'marriage'];
    let tabList = [0, 1];
    let options = [
        { num: 'optionOne', statement: "option1" },
        { num: 'optionTwo', statement: "option2" },
        { num: 'optionThree', statement: "option3" },
        { num: 'optionFour', statement: "option4" }
    ];

    return (
        <div className="tabContainer">
            <div className="tabMenu">
                {tabList.map(
                    (tabPage) => {
                        return <TabMenuButton tabNum={tabNum} setTabNum={setTabNum} clickedTabNum={tabPage} tabName={tabName} tabPage={tabPage} ></TabMenuButton>
                    }
                )}
            </div>

            <div className="tabContentWrapper">
                {tabList.map(
                    (tabPage) => {
                        return <Tab tabNum={tabNum} clickedTabNum={tabPage} tabName={tabName} options={options} questionList={questionList} questionStatement={questionStatement} ></Tab>
                    }
                )}
            </div>
        </div>
    );
}

function Tab(props) {
    return (
        <div className={props.tabNum === props.clickedTabNum ? "tabContent  activeTabcontent" : "tabContent"}   >
            {props.questionList.map(
                (questionNum) =>
                    <div  >
                        <Question key={questionNum} questionNum={questionNum} tabName={props.tabName[props.tabNum]} questionStatement={props.questionStatement[props.tabNum][questionNum]} options={props.options} ></Question>
                        <br /><br /><br />
                    </div>
            )}
        </div>
    )
}

function TabMenuButton(props) {
    return (
        <button className={props.tabNum === props.clickedTabNum ? "tab activeTab" : "tab"} onClick={() => props.setTabNum(props.clickedTabNum)}> {props.tabName[props.tabPage]} </button>
    )
}

export default Tabs;
