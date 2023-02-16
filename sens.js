const CryptoJS = require("crypto-js");
const axios = require("axios");


const sens_service_id = 'ncp:sms:kr:302027453430:leaf_debate';
const sens_access_key = 'gIjJNt01f2hjsIkzuKF5';
const sens_secret_key = '5fYkh5mZPorEQnAjgnH1F2MRZPkgg2yxKee8Coeu';
const sens_calling_number = '01094162506';  //calling number
const sensSmsApiDomain = 'https://sens.apigw.ntruss.com';
const sensSmsApiPath = `/sms/v2/services/${sens_service_id}/messages`;
const sensSmsApiUrl = sensSmsApiDomain + sensSmsApiPath;


let makeSignature = (unixTime, method, sens_secret_key, sens_access_key, sensSmsApiPath ) => {
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

let callSensSmsApi = (method, sensSmsApiUrl, sens_access_key, unixTime, signature, sens_calling_number, countryCode, receivingNum, content  ) => {
    axios({
        method: method,
        url: sensSmsApiUrl,
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
    }).then((res)=>{
        console.log(res.data);
    }).catch((err)=>{
        console.log(err);
    })
}

const unixTime = Date.now().toString(); // Millisec
let receivingNum ='01094162506';
let content = 'hi';
let signature = makeSignature(unixTime, 'POST', sens_secret_key, sens_access_key, sensSmsApiPath);
callSensSmsApi('POST', sensSmsApiUrl, sens_access_key, unixTime, signature, sens_calling_number, '82', receivingNum, content );
