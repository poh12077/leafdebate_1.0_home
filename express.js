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

let updateDidUserCheck = ( tabName, questionNum, id) => {
  try {
    let tableName = tabName + '_did_user_check';
    sql = {
      text: `UPDATE ${tableName} SET qn_${questionNum} = true WHERE id = '${id}';`
    }
    connection.query(sql)
      .then((DBRes) => {
      })
      .catch((err) => {
      })
  } catch (error) {

  }
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
            //there is no qn
            reject(new Error(err));
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
      res.status(401);
      res.send();
    } else if (await didUserCheck(tabName, questionNum, id)) {
      res.status(400);
      res.send();
    } else {
      let sql = {
        text: 'UPDATE ' + tableName + ' SET ' + checkedOption + ' = ' + checkedOption + ' +1 WHERE questionNum =$1;',
        values: [questionNum],
      }
      connection.query(sql)
        .then(() => {
          res.send();
          updateDidUserCheck(tabName, questionNum, id);
        })
        .catch(() => {
          res.status(500);
          res.send();
        })
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

let insertIdIntoDidUserCheck = (id) => {
  try {
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
  } catch (error) {
  }
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
        if(dbRes.rows.length===0){
          //available id
          res.cookie('id', id, cookieConfig);
          res.cookie('password', password, cookieConfig);
          res.cookie('gender', gender, cookieConfig);
          res.cookie('birthday', birthday, cookieConfig);
          res.send();
        }else{
          //unavailable id
          res.status(400)
          res.send();
        }
      }).catch(()=>{
        //db error
        res.status(500)
        res.send();
      })
  } catch (error) {
  }
})

let makeSignature = (unixTime, method, sens_secret_key, sens_access_key, sensSmsApiPath) => {
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

let callSensSmsApi = (method, sensSmsApiUrl, sens_access_key, unixTime, signature, sens_calling_number, countryCode, receivingNum, content) => {
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
  return new Promise((resolve, reject)=>{
    let sql = {
      text: `insert into userinfo values ('${id}','${password}','${gender}',${birthday},'${telNum}')`
    }
    connection.query(sql)
    .then((DBRes) => {
      insertIdIntoDidUserCheck(id);
      resolve(true);
    })
    .catch((err) => {
      reject(new Error(err));
    })
  })
}

function isTelNumAvaliable(telNum, tableName) {
    return new Promise((resolve, reject)=>{
      let sql = {
        text: `select id from ${tableName} where tel_num= '${telNum}'`
      }
      connection.query(sql)
      .then((dbRes) => {
        if(dbRes.rows.length===0){
          //valiable telNum
          resolve(true);
        }else{
          //unavaliable telnum
          resolve(false);
        }
      })
      .catch((err) => {
        reject(new Error(err));
      })
    })
}

//authentication
app.post('/reqAuth', async (req, res) => {
  try {
    const unixTime = Date.now().toString(); // Millisec
    let telNum = req.body.telNum;
    if(await isTelNumAvaliable(telNum, 'userinfo')){
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

        /*
        //send sms to me 
        callSensSmsApi('POST', sensSmsApiUrl, sens_access_key, unixTime, signature,
        sens_calling_number, '82', '01094162506', content).then((sensRes) => {
        }).catch((err) => {
        })
        */
    }else{
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
    let telNum = req.signedCookies.telNum;
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
        let id = req.signedCookies.id;
        let password = req.signedCookies.password;
        let gender = req.signedCookies.gender;
        let birthday = req.signedCookies.birthday;
        res.cookie('login', 'true', cookieConfig);
        res.clearCookie('password');
        res.clearCookie('gender');
        res.clearCookie('birthday');
        res.clearCookie('telNum');
        
        if(await insertSignup(id,password,gender,birthday,telNum)){
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

//when backend send response result to browser
app.post('/api/responseResult', (req, res) => {
  try {

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
  } catch (error) {
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

app.listen(port, () => {
  console.log(`leaf debate server listening on port ${port}`)
})