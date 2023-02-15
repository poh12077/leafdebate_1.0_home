const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 8000;
const pg = require("pg");
const fs = require('fs');
const multer = require('multer')();
const cookieParser = require('cookie-parser');
const { response } = require('express');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer.array());
const cookieSecretKey = 'dbstjrduf12#$';
app.use(cookieParser(cookieSecretKey));

const data = fs.readFileSync('./db.json');
const conf = JSON.parse(data);

// const connection = new pg.Client({
//   user: conf.user,
//   host: conf.host,
//   database: conf.database,
//   password: conf.password,
//   port: conf.port
// });

const connection = new pg.Pool({
  user: conf.user,
  host: conf.host,
  database: conf.database,
  password: conf.password,
  port: conf.port
});

connection.connect();

const cookieConfig = {
  httpOnly: true,
  maxAge: 1209600000,  // 14 days
  signed: true
}

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
        signup : true
      });
      insertIdIntoDidUserCheck(id);
    })
    .catch((err) => {
      res.cookie('login', 'false', cookieConfig);
      if(err.code ==='23505'){
        res.send({
          signup : false,
          code : '23505' 
        })
      }else{
        res.send({
          signup: false
        })
      }
    })
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