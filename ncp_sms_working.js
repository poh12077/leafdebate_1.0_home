const CryptoJS = require("crypto-js");
const axios = require("axios");

let f = async () =>{
    const unixTime = Date.now().toString(); // Millisec

    const sens_service_id = 'ncp:sms:kr:302027453430:leaf_debate';
    const sens_access_key = 'gIjJNt01f2hjsIkzuKF5';
    const sens_secret_key = '5fYkh5mZPorEQnAjgnH1F2MRZPkgg2yxKee8Coeu';
    const sens_calling_number ='01094162506';  //calling number

    const method = "POST";
    const space = " ";
    const newLine = "\n";
    const sensSmsApiDomain = 'https://sens.apigw.ntruss.com';
    const sensSmsApiPath = `/sms/v2/services/${sens_service_id}/messages`;
    const sensSmsApiUrl = sensSmsApiDomain+sensSmsApiPath;

    // signature 작성 : crypto-js 모듈을 이용하여 암호화
    const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, sens_secret_key);
    hmac.update(method);
    hmac.update(space);
    hmac.update(sensSmsApiPath);
    hmac.update(newLine);
    hmac.update(unixTime);
    hmac.update(newLine);
    hmac.update(sens_access_key);
    const hash = hmac.finalize();
    const signature = hash.toString(CryptoJS.enc.Base64);

    // sens 서버로 요청 전송
    const smsRes = await axios({
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
        countryCode: "82",
        from: sens_calling_number,
        content: 'nanana',
        messages: [{ to: '01094162506' }],
      },
    });
    console.log("response", smsRes.data);
}

f()