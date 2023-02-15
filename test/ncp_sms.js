const axios = require('axios');
var CryptoJS = require('crypto-js');

function getCurrentTimestamp() {
    return Date.now()
  }

let timestamp = getCurrentTimestamp().toString();

function makeSignature(timestamp) {
	var space = " ";				// one space
	var newLine = "\n";				// new line
	var method = "post";				// method
	var url = "/sms/v2/services/ncp:sms:kr:302027453430:leaf_debate/messages";	// url (include query string)
	var accessKey = "gIjJNt01f2hjsIkzuKF5";			// access key id (from portal or Sub Account)
	var secretKey = "5fYkh5mZPorEQnAjgnH1F2MRZPkgg2yxKee8Coeu";			// secret key (from portal or Sub Account)

	var hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);
	hmac.update(method);
	hmac.update(space);
	hmac.update(url);
	hmac.update(newLine);
	hmac.update(timestamp);
	hmac.update(newLine);
	hmac.update(accessKey);

	var hash = hmac.finalize();

	return hash.toString(CryptoJS.enc.Base64);
}

let signature = makeSignature(timestamp);

let body = { 
    "type":"SMS",
    "contentType":"COMM",
    "countryCode":"82",
    "from":"01094162506",
    "content":"nananan",
    "messages":[
        {
            "to":"01094162506"
        }
    ]
}

let header ={
    // 'accept' : 'application/json',
    'Content-Type' : "application/json; charset=utf-8",
    'x-ncp-apigw-timestamp' : timestamp,
    "x-ncp-iam-access-key" : "gIjJNt01f2hjsIkzuKF5",
    'x-ncp-apigw-signature-v2' : signature
}

let req = () =>{
    axios({
        method: 'post',
        url: "https://sens.apigw.ntruss.com/sms/v2/services/ncp:sms:kr:302027453430:leaf_debate/messages",
        header: header,
        validateStatus: function (status) {
          return status >= 200 && status < 300; // default
        },
        data: body,
        timeout: 5000
      }).then(
        (res) => {
          console.log(res);
        }
      ).catch(
        (err) => {
          console.log(err);
        }
      )
}

req();
