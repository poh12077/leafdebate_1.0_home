const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 8000;
const pg = require("pg");
const fs = require('fs');
const multer = require('multer')();
const cookieParser = require('cookie-parser');
const { response } = require('express');
const CryptoJS = require("crypto-js");
const axios = require("axios");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer.array());
const cookieSecretKey = 'dbstjrduf12#$';
app.use(cookieParser(cookieSecretKey));

let dbConf = fs.readFileSync('./dbConf.json');
dbConf = JSON.parse(dbConf);

let sensConf = fs.readFileSync('./sensConf.json');
sensConf = JSON.parse(sensConf);

// const connection = new pg.Client({
//   user: dbConf.user,
//   host: dbConf.host,
//   database: dbConf.database,
//   password: dbConf.password,
//   port: dbConf.port
// });

const connection = new pg.Pool({
  user: dbConf.user,
  host: dbConf.host,
  database: dbConf.database,
  password: dbConf.password,
  port: dbConf.port
});

connection.connect();

const cookieConfig = {
  httpOnly: true,
  maxAge: 1209600000,  // 14 days
  signed: true
}


const sens_service_id = sensConf.sens_service_id;
const sens_access_key = sensConf.sens_access_key;
const sens_secret_key = sensConf.sens_secret_key;
const sens_calling_number = sensConf.sens_calling_number;  //calling number
const sensSmsApiDomain = sensConf.sensSmsApiDomain;
const sensSmsApiPath = `/sms/v2/services/${sens_service_id}/messages`;
const sensSmsApiUrl = sensSmsApiDomain + sensSmsApiPath;


// const sens_service_id = 'ncp:sms:kr:302027453430:leaf_debate';
// const sens_access_key = 'gIjJNt01f2hjsIkzuKF5';
// const sens_secret_key = '5fYkh5mZPorEQnAjgnH1F2MRZPkgg2yxKee8Coeu';
// const sens_calling_number = '01094162506';  //calling number
// const sensSmsApiDomain = 'https://sens.apigw.ntruss.com';
// const sensSmsApiPath = `/sms/v2/services/${sens_service_id}/messages`;
// const sensSmsApiUrl = sensSmsApiDomain + sensSmsApiPath;


let updateDoesUserCheck = (res, tabName, questionNum, id) => {

  let tableName = tabName + '_did_user_check';
  sql = {
    text: `UPDATE ${tableName} SET qn_${questionNum} = true WHERE id = '${id}';`
  }
  connection.query(sql)
    .then((DBRes) => {
      res.send({
        login: true,
        didUserCheck: false
      });
      console.log(DBRes);
    })
    .catch((err) => {
      res.send(err);
      console.log(err);
    })
}

let didUserCheck = (tabName, questionNum, id) => {
  return new Promise(
    (resolve, reject) => {
      let tableName = tabName + '_did_user_check';
      let qn_num = 'qn_' + questionNum.toString();
      sql = {
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
          console.log(err);
          resolve(false);
        })
    }
  )
}

//when user check option
app.post('/questionAnswer', async (req, res) => {
  try {
    let id = req.signedCookies.id;
    let checkedOption = req.body.checkedOption;
    let questionNum = req.body.questionNum;
    let gender = req.body.gender;
    let tabName = req.body.tabName;
    let tableName = 'totalresponseresult';
    tableName = tabName + gender + tableName;
    //check login 
    if (req.signedCookies.login === 'false') {
      res.send({
        login: false
      });
    } else if (await didUserCheck(tabName, questionNum, id)) {
      res.send({
        login: true,
        didUserCheck: true
      })
    } else {
      let sql = {
        text: 'UPDATE ' + tableName + ' SET ' + checkedOption + ' = ' + checkedOption + ' +1 WHERE questionNum =$1;',
        values: [questionNum],
      }
      connection.query(sql)
        .then((DBRes) => {
          // res.send(DBRes.rows);
          console.log(DBRes);
        })
        .catch((err) => {
          console.log(err);
        })
      updateDoesUserCheck(res, tabName, questionNum, id);
    }
  } catch (err) {
    res.send(err);
    console.log(err);
  }
})



//login
app.post('/sendAccount', (req, res) => {
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

})

let insertIdIntoDidUserCheck = (id) => {
  let tabName = ['love', 'marriage'];
  tabName.map((item) => {
    sql = {
      text: `insert into ${item}_did_user_check values ('${id}');`
    }
    connection.query(sql)
      .then((DBRes) => {
        // console.log(DBRes.rows)
      })
      .catch((err) => {
        // console.log(err)
      })
  })
}

//sign up
app.post('/sendSignupInfo', (req, res) => {
  let id = req.body.id;
  let password = req.body.password;
  let gender = req.body.gender;
  let birthday = req.body.birthday;

  let sql = {
    text: 'insert into userinfo values ($1, $2, $3, $4)',
    values: [id, password, gender, birthday],
  }
  connection.query(sql)
    .then((DBRes) => {
      res.cookie('login', 'true', cookieConfig);
      res.cookie('id', id, cookieConfig);
      res.send({
        signup: true
      });
      insertIdIntoDidUserCheck(id);
    })
    .catch((err) => {
      res.cookie('login', 'false', cookieConfig);
      if (err.code === '23505') {
        res.send({
          signup: false,
          code: '23505'
        })
      } else {
        res.send({
          signup: false
        })
      }
    })
})


let makeSignature = (unixTime, method, sens_secret_key, sens_access_key, sensSmsApiPath) => {
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
}

let callSensSmsApi = (method, sensSmsApiUrl, sens_access_key, unixTime, signature, sens_calling_number, countryCode, receivingNum, content) => {
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
}

// min <= getRandomInteger(min,max) <= max
function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function deleteAuthNum(telNum, validTime){
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
  
}

function updateAuthNum(telNum, authNum){
  let sql = {
    text: `update auth set auth_num = '${authNum}' where tel_num = '${telNum}';`
  }
  connection.query(sql)
    .then((DBRes) => {
      deleteAuthNum(telNum,180000);
    })
    .catch((err) => {
    })
}

function insertAuthNum(telNum, authNum){
  let sql = {
    text: `insert into auth values ('${telNum}','${authNum}');`
  }
  connection.query(sql)
    .then((DBRes) => {
     deleteAuthNum(telNum,180000);
    })
    .catch((err) => {
      if(err.code === '23505'){
        updateAuthNum(telNum,authNum);
      }else{

      }
    })
}
 
function getAuthNum(telNum){
  let sql = {
    text: `select auth_num from auth where tel_num='${telNum}';`
  }
  return connection.query(sql)
    
}

//authentication
app.post('/reqAuth', (req, res) => {
  const unixTime = Date.now().toString(); // Millisec
  let telNum = req.body.telNum;
  const authNum = getRandomInteger(1000,9999).toString();
  let content = `인증번호는 [${authNum}]입니다`;
  let signature = makeSignature(unixTime, 'POST', sens_secret_key, sens_access_key, sensSmsApiPath);
  callSensSmsApi('POST', sensSmsApiUrl, sens_access_key, unixTime, signature, 
  sens_calling_number, '82', telNum, content).then((sensRes)=>{
    res.cookie('telNum', telNum, cookieConfig);
    res.send();
    insertAuthNum(telNum, authNum);
  }).catch((err)=>{
    res.status(400);
    res.send()
  })
})

app.post('/sendAuthNum', async (req, res) => {
try {
  let telNum = req.signedCookies.telNum;
  let authNumFromBrowser = req.body.authNum;
  let dbRes = await getAuthNum(telNum);
  if(dbRes.rows.length===0){
    //vaild time of authNum is over
    res.status(408);
    res.send();
  }else{
    let origionalAuthNum = dbRes.rows[0].auth_num;
    if(authNumFromBrowser===origionalAuthNum){
      res.clearCookie('telNum');
      res.send();
    }else{
      res.status(401);
      res.send();
    }
  }
} catch (error) {
  console.log(error);
}
  
})

//when backend send response result to browser
app.post('/api/responseResult', (req, res) => {
  let tableName = 'totalresponseresult';
  let gender = req.body.gender;
  let tabName = req.body.tabName;
  tableName = tabName + gender + tableName;

  let sql = {
    text: 'SELECT * from ' + tableName + ' where questionnum = $1;',
    values: [req.body.questionNum],
  }

  connection.query(sql)
    .then((DBRes) => {
      res.send(DBRes.rows);
    })
    .catch((err) => {

    })

})

//logout
app.get('/logout', (req, res) => {
  res.cookie('login', 'false', cookieConfig);
  res.clearCookie('id');
  res.send();
})

app.listen(port, () => {
  console.log(`leaf debate server listening on port ${port}`)
})