const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 8000;
const { Client } = require("pg");
const fs = require('fs');
const multer = require('multer')();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));
app.use(multer.array());

const data = fs.readFileSync('./db.json');
const conf = JSON.parse(data);

const connection = new Client({
  user: conf.user,
  host: conf.host,
  database: conf.database,
  password: conf.password,
  port: conf.port
});

connection.connect();



app.post('/questionAnswer', (req,res)=>{
    let checkedOption = req.body.checkedOption;
    let questionNum= req.body.questionNum;
    let gender = req.body.gender;
    let tabName = req.body.tabName;

    let tableName='totalresponseresult';
    tableName = tabName+gender+tableName;

    let sql = {
      text : 'UPDATE '+tableName+' SET '+checkedOption+' = '+checkedOption+' +1 WHERE questionNum =$1;',
      values: [questionNum],
    }
    connection.query(sql )
    .then((DBRes)=>{
      res.send(DBRes.rows);
      console.log(DBRes);
      // connection.end;
    })
    .catch((err)=>{
      console.log(err);
      // connection.end;
    })
  })

  app.post('/sendAccount', (req,res)=>{
    let id = req.body.id;
    let sql = {
      text : 'SELECT password from userinfo where id = $1;',
      values: [id],
    }
    connection.query(sql )
    .then((DBRes)=>{
      if (req.body.password === DBRes.rows[0].password ){
        //success
        res.send();
      }else{
        //password wrong
        res.statusCode=401;
        res.send('1');
      }
      // connection.end;
    })
    .catch((err)=>{
      //id wrong
      console.log(err);
      res.statusCode=401;
      res.send('2');
      // connection.end;
    })
  })

  
  app.post('/sendSignupInfo', (req,res)=>{
    let id = req.body.id;
    let password =req.body.password;
    let gender = req.body.gender;
    let birthday = req.body.birthday;

    let sql = {
      text : 'insert into userinfo values ($1, $2, $3, $4)',
      values: [id, password, gender, birthday ],
    }
    connection.query(sql )
    .then((DBRes)=>{
      res.send(DBRes.rows);
    })
    .catch((err)=>{
      res.send(err);
    })
  })


  app.post('/api/responseResult',(req,res)=>{
    let tableName='totalresponseresult';
    let gender =req.body.gender;
    let tabName = req.body.tabName;
    tableName = tabName+gender+tableName;

    let sql = {
      text : 'SELECT * from '+tableName+' where questionnum = $1;',
      values: [ req.body.questionNum],
    }

    connection.query(sql )
    .then((DBRes)=>{
      res.send(DBRes.rows);
    })
    .catch((err)=>{
     
    })

  })
  
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})