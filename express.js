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

app.post('/check', (req,res)=>{
  let isChecked = req.body.isChecked;
  let sql = {
    text : 'UPDATE ISCHECKED SET ISCHECKED = $1 WHERE NUMBER =1;',
    values: [isChecked],
  }
  connection.query(sql )
  .then((DBRes)=>{
    res.send(DBRes.rows);
    console.log(DBRes);
    connection.end;
  })
  .catch((err)=>{
    console.log(err);
    connection.end;
  })
})

  
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})