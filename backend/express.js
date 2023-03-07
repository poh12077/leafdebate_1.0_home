const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 8000;
const pg = require("pg");
const fs = require('fs');
const multer = require('multer')();
const cookieParser = require('cookie-parser');
const { response, json } = require('express');
const CryptoJS = require("crypto-js");
const axios = require("axios");
const rateLimit = require("express-rate-limit");
const path = require('path');

let securityConf = fs.readFileSync( path.resolve(__dirname, './conf/securityConf.json') );
securityConf = JSON.parse(securityConf);

//sens ddos security configure
const limiter = rateLimit({
  windowMs: securityConf.ddos.windowMs, // milli second
  max: securityConf.ddos.max, // Limit each IP to x requests per `window` 
  standardHeaders: securityConf.ddos.standardHeaders, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: securityConf.ddos.legacyHeaders,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer.array());
const cookieSecretKey = 'dbstjrduf12#$';
app.use(cookieParser(cookieSecretKey));

let dbConf = fs.readFileSync( path.resolve(__dirname, './conf/dbConf.json')  );
dbConf = JSON.parse(dbConf);

let sensConf = fs.readFileSync( path.resolve(__dirname, './conf/sensConf.json') );
sensConf = JSON.parse(sensConf);

// const connection = new pg.Client({
//   user: dbConf.user,
//   host: dbConf.host,
//   database: dbConf.database,
//   password: dbConf.password,
//   port: dbConf.port
// });

//db
const connection = new pg.Pool({
  user: dbConf.user,
  host: dbConf.host,
  database: dbConf.database,
  password: dbConf.password,
  port: dbConf.port
});

connection.connect();

const cookieConfig = {
  httpOnly: false,
  maxAge: 1209600000,  // 14 days
  signed: false
}

//sens
const sens_service_id = sensConf.sens_service_id;
const sens_access_key = sensConf.sens_access_key;
const sens_secret_key = sensConf.sens_secret_key;
const sens_calling_number = sensConf.sens_calling_number;  //calling number
const sensSmsApiDomain = sensConf.sensSmsApiDomain;
const sensSmsApiPath = `/sms/v2/services/${sens_service_id}/messages`;
const sensSmsApiUrl = sensSmsApiDomain + sensSmsApiPath;

let contentFile = fs.readFileSync( path.resolve(__dirname, '../frontend/src/data/content.json' ) );
contentFile = JSON.parse(contentFile);
let tabNames = [];

parseContentFile(contentFile, tabNames, [], [], [], [], []);

let loveYhtiTypes = fs.readFileSync( path.resolve(__dirname, '../frontend/src/data/yhtiType.json') );
loveYhtiTypes = JSON.parse(loveYhtiTypes);

function parseContentFile(content, tabNames, qnTypes, qnStatement, tabSize, tabPages, optionStatement) {
  try {
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
  } catch (error) {
    console.log(error);
    process.exit();
  }
}

function updateDidUserCheck(tabName, questionNum, id) {
  return new Promise((resolve, reject) => {
    let tableName = tabName + '_did_user_check';
    let sql = {
      text: `UPDATE ${tableName} SET qn_${questionNum} = true WHERE id = '${id}';`
    }
    connection.query(sql)
      .then((DBRes) => {
        resolve();
      })
      .catch((err) => {
        reject(new Error(err));
      })
  })
}

function didUserCheck(tabName, questionNum, id) {
  return new Promise(
    (resolve, reject) => {
      let tableName = tabName + '_did_user_check';
      let qn_num = 'qn_' + questionNum.toString();
      let sql = {
        text: `select qn_${questionNum} from ${tableName} WHERE id = '${id}';`
      }
      connection.query(sql)
        .then((DBRes) => {
          if (DBRes.rows[0][qn_num]) {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch((err) => {
          //there is no qn
          reject(new Error(err));
        })
    }
  )
}


function selectTotalVotingResultByUser(tabName, questionNum, id) {
  return new Promise(
    (resolve, reject) => {
      let qnNum = 'qn_' + questionNum.toString();
      let sql = {
        text: `select ${qnNum} from ${tabName}_total_voting_result_by_user where id = '${id}';`
      }
      connection.query(sql)
        .then((dbRes) => {
          resolve(dbRes.rows[0][qnNum])
        })
        .catch((err) => {
          //there is no qn
          reject(new Error(err));
        })
    }
  )
}


function selectGender(id) {
  return new Promise((resolve, reject) => {
    let sql = {
      text: `select gender from userinfo WHERE id = '${id}';`
    }
    connection.query(sql)
      .then((DBRes) => {
        if (DBRes.rows.length === 0) {
          // there is no gender 
          reject(new Error('there is no gender'));
        } else {
          resolve(DBRes.rows[0].gender)
        }
      })
      .catch((err) => {
        reject(new Error(err));
      })
  })
}

function updateVotingResultByUser(id, qnType, checkedOption, qnNum, tabName) {
  return new Promise((resolve, reject) => {
    let sql = {
      text: `UPDATE ${tabName}_${qnType}_voting_result_by_user SET qn_${qnNum} = ${checkedOption} WHERE id = '${id}';`
    }
    connection.query(sql)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(new Error(err));
      })
  })
}

function updateVotingResult(tabName, checkedOption, gender, questionNum, variable ) {
  return new Promise((resolve, reject) => {
    let sql = {
      text: `UPDATE ${tabName}_${gender}_voting_result SET option_${checkedOption} = option_${checkedOption} + ${variable} WHERE qn_num = ${questionNum};`
    }
    connection.query(sql)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(new Error(err));
      })
  })
}

//when user check option
app.post('/questionAnswer', async (req, res) => {
  try {
    if (req.cookies.login === 'false') {
      //check login 
      res.status(401);
      res.send();
    }
    let id = req.cookies.id;
    let checkedOption = req.body.checkedOption;
    let questionNum = req.body.questionNum;
    let gender = await selectGender(id);
    let tabName = req.body.tabName;
    let qnType = req.body.qnType;
    let previousUserAnswer = await selectTotalVotingResultByUser(tabName, questionNum, id);

    if (previousUserAnswer !== null ) {
      //user have answered
      if(checkedOption==previousUserAnswer){
        //user checked same option with previous answer  
        res.send();
      }else{
        //user checked different option with previous answer
        updateVotingResult(tabName, previousUserAnswer, gender, questionNum, -1).catch(() => {
          res.status(500);
        })
        updateVotingResult(tabName, checkedOption, gender, questionNum, 1).catch(() => {
          res.status(500);
        })
        if (qnType === "") {
          //no qn type
          await updateVotingResultByUser(id, 'total', checkedOption, questionNum, tabName);
          res.send();
        } else {
          // there is qn type
          updateVotingResultByUser(id, 'total', checkedOption, questionNum, tabName).catch(() => {
            res.status(500);
          })
          await updateVotingResultByUser(id, qnType, checkedOption, questionNum, tabName);
          res.send();
        }
      }
    } else {
      //user haven't answered 
      updateVotingResult(tabName, checkedOption, gender, questionNum, 1).catch(() => {
        res.status(500);
      })
      if (qnType === "") {
        //no qn type
        await updateVotingResultByUser(id, 'total', checkedOption, questionNum, tabName);
        res.send();
      } else {
        // there is qn type
        updateVotingResultByUser(id, 'total', checkedOption, questionNum, tabName).catch(() => {
          res.status(500);
        })
        await updateVotingResultByUser(id, qnType, checkedOption, questionNum, tabName);
        res.send();
      }
    }
  } catch (err) {
    res.status(500);
    res.send();
  }
})

//login
app.post('/sendAccount', (req, res) => {
  try {

    let id = req.body.id;
    let sql = {
      text: 'SELECT password from userinfo where id = $1;',
      values: [id],
    }
    connection.query(sql)
      .then((DBRes) => {
        if (req.body.password === DBRes.rows[0].password) {
          //success
          res.cookie('login', 'true', cookieConfig);
          res.cookie('id', id, cookieConfig);
          res.send();
        } else {
          //password wrong
          res.statusCode = 401;
          res.send('1');
        }
        // connection.end;
      })
      .catch((err) => {
        //id wrong
        console.log(err);
        res.statusCode = 401;
        res.send('2');
        // connection.end;
      })
  } catch (error) {
  }
})

function insertIdIntoDidUserCheck(id) {
  return new Promise((resolve, reject) => {
    tabNames.map((item) => {
      let sql = {
        text: `insert into ${item}_did_user_check values ('${id}');`
      }
      connection.query(sql)
        .then((DBRes) => {
          resolve();
        })
        .catch((err) => {
          reject(new Error(err));
        })
    })
  })
}

function insertIdIntoVotingResultByUser(id) {
  return new Promise((resolve, reject) => {
    for (let qnType in loveYhtiTypes) {
      let sql = {
        text: `insert into love_${qnType}_voting_result_by_user values ('${id}');`
      }
      connection.query(sql)
        .then((DBRes) => {
          resolve();
        })
        .catch((err) => {
          reject(new Error(err));
        })
    }
  })
}

function insertIdIntoTotalVotingResultByUser(id) {
  return new Promise((resolve, reject) => {
    tabNames.map((tabName)=>{
      let sql = {
        text: `insert into ${tabName}_total_voting_result_by_user values ('${id}');`
      }
      connection.query(sql)
        .then((DBRes) => {
          resolve();
        })
        .catch((err) => {
          reject(new Error(err));
        })
    })
  })
}

//new sign up method 
app.post('/sendSignupInfo', (req, res) => {
  try {
    let id = req.body.id;
    let password = req.body.password;
    let gender = req.body.gender;
    let birthday = req.body.birthday;

    let sql = {
      text: `select * from userinfo where id='${id}'`
    }
    connection.query(sql)
      .then((dbRes) => {
        if (dbRes.rows.length === 0) {
          //available id
          res.cookie('id', id, cookieConfig);
          res.cookie('password', password, cookieConfig);
          res.cookie('gender', gender, cookieConfig);
          res.cookie('birthday', birthday, cookieConfig);
          res.send();
        } else {
          //unavailable id
          res.status(400)
          res.send();
        }
      }).catch(() => {
        //db error
        res.status(500)
        res.send();
      })
  } catch (error) {
  }
})

function makeSignature(unixTime, method, sens_secret_key, sens_access_key, sensSmsApiPath) {
  try {
    const space = " ";
    const newLine = "\n";
    const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, sens_secret_key);

    hmac.update(method);
    hmac.update(space);
    hmac.update(sensSmsApiPath);
    hmac.update(newLine);
    hmac.update(unixTime);
    hmac.update(newLine);
    hmac.update(sens_access_key);
    const hash = hmac.finalize();
    let signature = hash.toString(CryptoJS.enc.Base64);
    return signature;
  } catch (error) {
  }
}

function callSensSmsApi(method, sensSmsApiUrl, sens_access_key, unixTime, signature, sens_calling_number, countryCode, receivingNum, content) {
  try {

    return axios({
      method: method,
      url: sensSmsApiUrl,
      validateStatus: function (status) {
        return status >= 200 && status < 300; // default
      },
      headers: {
        "Content-type": "application/json; charset=utf-8",
        "x-ncp-iam-access-key": sens_access_key,
        "x-ncp-apigw-timestamp": unixTime,
        "x-ncp-apigw-signature-v2": signature,
      },
      data: {
        type: "SMS",
        contentType: "COMM",
        countryCode: countryCode, //'82'
        from: sens_calling_number,
        content: content, //string
        messages: [{ to: receivingNum }], //string
      },
    })
  } catch (error) {
  }
}

// min <= getRandomInteger(min,max) <= max
function getRandomInteger(min, max) {
  try {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  } catch (error) {
  }
}

function deleteAuthNum(telNum, validTime) {
  try {
    let sql = {
      text: `delete from auth where tel_num = '${telNum}';`
    }
    setTimeout(() => {
      connection.query(sql)
        .then((DBRes) => {
        })
        .catch((err) => {
        })
    }, validTime);
  } catch (error) {
  }
}

function updateAuthNum(telNum, authNum) {
  try {
    let sql = {
      text: `update auth set auth_num = '${authNum}' where tel_num = '${telNum}';`
    }
    connection.query(sql)
      .then((DBRes) => {
        deleteAuthNum(telNum, 180000);
      })
      .catch((err) => {
      })
  } catch (error) {
  }
}

function insertAuthNum(telNum, authNum) {
  try {
    let sql = {
      text: `insert into auth values ('${telNum}','${authNum}');`
    }
    connection.query(sql)
      .then((DBRes) => {
        deleteAuthNum(telNum, 180000);
      })
      .catch((err) => {
        if (err.code === '23505') {
          updateAuthNum(telNum, authNum);
        } else {
        }
      })
  } catch (error) {
  }
}

function getAuthNum(telNum) {
  try {
    let sql = {
      text: `select auth_num from auth where tel_num='${telNum}';`
    }
    return connection.query(sql)
  } catch (error) {
  }
}

function insertSignup(id, password, gender, birthday, telNum) {
  return new Promise((resolve, reject) => {
    let sql = {
      text: `insert into userinfo values ('${id}','${password}','${gender}',${birthday},'${telNum}')`
    }
    connection.query(sql)
      .then(async (DBRes) => {
        // insertIdIntoDidUserCheck(id);
        insertIdIntoVotingResultByUser(id);
        await insertIdIntoTotalVotingResultByUser(id);
        resolve(true);
      })
      .catch((err) => {
        reject(new Error(err));
      })
  })
}

function isTelNumAvaliable(telNum, tableName) {
  return new Promise((resolve, reject) => {
    let sql = {
      text: `select id from ${tableName} where tel_num= '${telNum}'`
    }
    connection.query(sql)
      .then((dbRes) => {
        if (dbRes.rows.length === 0) {
          //valiable telNum
          resolve(true);
        } else {
          //unavaliable telnum
          resolve(false);
        }
      })
      .catch((err) => {
        reject(new Error(err));
      })
  })
}


function selectIdAndPassword(telNum, tableName) {
  return new Promise((resolve, reject) => {
    let sql = {
      text: `select id, password from ${tableName} where tel_num= '${telNum}'`
    }
    connection.query(sql)
      .then((dbRes) => {
        resolve(dbRes.rows[0]);
      })
      .catch((err) => {
        reject(new Error(err));
      })
  })
}


function isTelNumRegistered(telNum, tableName) {
  return new Promise((resolve, reject) => {
    let sql = {
      text: `select id from ${tableName} where tel_num= '${telNum}'`
    }
    connection.query(sql)
      .then((dbRes) => {
        if (dbRes.rows.length === 0) {
          //telNum haven't been signed up
          resolve(false);
        } else {
          //telnum have been signed up
          resolve(true);
        }
      })
      .catch((err) => {
        reject(new Error(err));
      })
  })
}


//authentication
app.post('/reqAuth', limiter, async (req, res) => {
  try {
    const unixTime = Date.now().toString(); // Millisec
    let telNum = req.body.telNum;
    if (await isTelNumAvaliable(telNum, 'userinfo')) {
      const authNum = getRandomInteger(1000, 9999).toString();
      let content = `인증번호는 [${authNum}]입니다`;
      let signature = makeSignature(unixTime, 'POST', sens_secret_key, sens_access_key, sensSmsApiPath);
      callSensSmsApi('POST', sensSmsApiUrl, sens_access_key, unixTime, signature,
        sens_calling_number, '82', telNum, content).then((sensRes) => {
          //sensSmsApi success
          res.cookie('telNum', telNum, cookieConfig);
          res.send();
          insertAuthNum(telNum, authNum);
        }).catch((err) => {
          //sensSmsApi error
          res.status(400);
          res.send()
        })

      //send sms to me 
      // callSensSmsApi('POST', sensSmsApiUrl, sens_access_key, unixTime, signature,
      //   sens_calling_number, '82', '01094162506', content).then((sensRes) => {
      //   }).catch((err) => {
      //   })

    } else {
      // unavailable telNum
      res.status(401);
      res.send();
    }
  } catch (error) {
    //server error
    res.status(500);
    res.send();
  }
})

//authentication
app.post('/sendAuthNum', async (req, res) => {
  try {
    let telNum = req.cookies.telNum;
    let authNumFromBrowser = req.body.authNum;
    let dbRes = await getAuthNum(telNum);
    if (dbRes.rows.length === 0) {
      //vaild time of authNum is over
      res.status(408);
      res.send();
    } else {
      let origionalAuthNum = dbRes.rows[0].auth_num;
      if (authNumFromBrowser === origionalAuthNum) {
        //signup success
        let id = req.cookies.id;
        let password = req.cookies.password;
        let gender = req.cookies.gender;
        let birthday = req.cookies.birthday;
        res.cookie('login', 'true', cookieConfig);
        res.clearCookie('password');
        res.clearCookie('gender');
        res.clearCookie('birthday');
        res.clearCookie('telNum');

        if (await insertSignup(id, password, gender, birthday, telNum)) {
          res.send();
        }
      } else {
        //fail 
        res.status(401);
        res.send();
      }
    }
  } catch (error) {
    res.status(500);
    res.send();
  }
})


//authentication
app.post('/reqAuthToFindId', limiter, async (req, res) => {
  try {
    const unixTime = Date.now().toString(); // Millisec
    let telNum = req.body.telNum;
    if (await isTelNumRegistered(telNum, 'userinfo')) {
      const authNum = getRandomInteger(1000, 9999).toString();
      let content = `인증번호는 [${authNum}]입니다`;
      let signature = makeSignature(unixTime, 'POST', sens_secret_key, sens_access_key, sensSmsApiPath);
      callSensSmsApi('POST', sensSmsApiUrl, sens_access_key, unixTime, signature,
        sens_calling_number, '82', telNum, content).then((sensRes) => {
          //sensSmsApi success
          res.cookie('telNum', telNum, cookieConfig);
          res.send();
          insertAuthNum(telNum, authNum);
        }).catch((err) => {
          //sensSmsApi error
          res.status(400);
          res.send()
        })

      //send sms to me 
      // callSensSmsApi('POST', sensSmsApiUrl, sens_access_key, unixTime, signature,
      //   sens_calling_number, '82', '01094162506', content).then((sensRes) => {
      //   }).catch((err) => {
      //   })

    } else {
      // telNum haven't been signed up
      res.status(401);
      res.send();
    }
  } catch (error) {
    //server error
    res.status(500);
    res.send();
  }
})

//authentication
app.post('/sendAuthNumToFindId', async (req, res) => {
  try {
    let telNum = req.cookies.telNum;
    let authNumFromBrowser = req.body.authNum;
    let dbRes = await getAuthNum(telNum);
    if (dbRes.rows.length === 0) {
      //vaild time of authNum is over
      res.status(408);
      res.send();
    } else {
      let origionalAuthNum = dbRes.rows[0].auth_num;
      if (authNumFromBrowser === origionalAuthNum) {
        //find id success
        let idAndPassword = await selectIdAndPassword(telNum, 'userinfo');
        res.cookie('login', 'true', cookieConfig);
        res.cookie('id', idAndPassword.id, cookieConfig);
        res.clearCookie('telNum');
        res.send(idAndPassword);
      } else {
        //fail 
        res.status(401);
        res.send();
      }
    }
  } catch (error) {
    res.status(500);
    res.send();
  }
})


//when backend send response result to browser
app.post('/api/responseResult', (req, res) => {
  try {
    let tableName = 'voting_result';
    let gender = req.body.gender;
    let tabName = req.body.tabName;
    let qnNum = req.body.questionNum;
    tableName = tabName + '_' + gender + '_' + tableName;

    let sql = {
      text: `SELECT * from ${tableName} where qn_num = ${qnNum};`
    }

    connection.query(sql)
      .then((DBRes) => {
        res.send(DBRes.rows);
      })
      .catch((err) => {
        res.status(500);
        res.send();
      })
  } catch (error) {
    res.status(500);
    res.send();
  }
})

function getPreviosAnswer(id, tabName) {
  return new Promise((resolve, reject) => {
    let sql = {
      text: `SELECT * from ${tabName}_total_voting_result_by_user where id = '${id}';`
    }

    connection.query(sql)
      .then((dbRes) => {
        if(dbRes.rows.length==0){
          //user have checked nothing
          reject();
        }else{
          //user have checked something
          resolve(dbRes.rows[0]);
        }
      })
      .catch((err) => {
        reject(err);
      })
  })
}

//authentication
app.post('/getPreviosAnswer', async (req, res) => {
  try {
    let id = req.cookies.id;
    let tabName = req.body.tabName;

    let previousAnswer = await getPreviosAnswer( id, tabName );
    res.send(previousAnswer);

  } catch (error) {
    //server error
    res.status(500);
    res.send();
  }
})


//logout
app.get('/logout', (req, res) => {
  try {
    res.cookie('login', 'false', cookieConfig);
    res.clearCookie('id');
    res.send();
  } catch (error) {

  }
})

function getScore(qnAnswers) {
  if (qnAnswers === undefined) {
    throw new Error();
  }
  let sum = 0;
  let numOfQn = 0;
  for (let qnNum in qnAnswers) {
    if (Number.isInteger(qnAnswers[qnNum])) {
      sum += qnAnswers[qnNum];
      numOfQn++;
    }
  }
  if (numOfQn === 0) {
    //there is no checked question
    let err = new Error();
    err.code = 400;
    throw err;
  }
  let score = (sum / (5 * numOfQn)) * 100;
  return score;
}

function selectVotingResultByUser(qnType, yhtiArr, id) {
  return new Promise((resolve, reject) => {
    let sql = {
      text: `SELECT * from love_${qnType}_voting_result_by_user where id = '${id}';`
    }

    connection.query(sql)
      .then((dbRes) => {
        if (getScore(dbRes.rows[0]) < 50) {
          yhtiArr.push(loveYhtiTypes[qnType][0])
        } else {
          yhtiArr.push(loveYhtiTypes[qnType][1])
        }
        resolve();
      })
      .catch((err) => {
        reject(err);
      })
  })
}

app.post('/reqType', async (req, res) => {
  try {
    let id = req.cookies.id;
    let yhtiArr = [];

    for (let qnType in loveYhtiTypes) {
      await selectVotingResultByUser(qnType, yhtiArr, id)
    }

    let yhtiStr = '';
    for (let i = 0; i < yhtiArr.length; i++) {
      yhtiStr += yhtiArr[i];
    }

    res.cookie('yhti', yhtiStr, cookieConfig);
    res.send();
  } catch (err) {
    if (err.code == 400) {
      res.status(400);
      res.send();
    } else {
      res.status(500);
      res.send();
    }
  }
})

app.listen(port, () => {
  console.log(`leaf debate server listening on port ${port}`)
})