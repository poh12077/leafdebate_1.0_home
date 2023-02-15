const CryptoJS = require("crypto-js");
const axios = require("axios");

let f = async () =>{
    const date = Date.now().toString(); // 날짜 string

    // 환경 변수
    const sens_service_id = 'ncp:sms:kr:302027453430:leaf_debate';
    const sens_access_key = 'gIjJNt01f2hjsIkzuKF5';
    const sens_secret_key = '5fYkh5mZPorEQnAjgnH1F2MRZPkgg2yxKee8Coeu';
    const sens_call_number = '01094162506';

    // url 관련 변수 선언
    const method = "POST";
    const space = " ";
    const newLine = "\n";
    const url = `https://sens.apigw.ntruss.com/sms/v2/services/${sens_service_id}/messages`;
    const url2 = `/sms/v2/services/${sens_service_id}/messages`;

    // signature 작성 : crypto-js 모듈을 이용하여 암호화
    console.log(1);
    const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, sens_secret_key);
    console.log(2);
    hmac.update(method);
    hmac.update(space);
    hmac.update(url2);
    hmac.update(newLine);
    hmac.update(date);
    hmac.update(newLine);
    console.log(sens_access_key);
    hmac.update(sens_access_key);
    const hash = hmac.finalize();
    console.log(4);
    const signature = hash.toString(CryptoJS.enc.Base64);
    console.log(5);

    // sens 서버로 요청 전송
    const smsRes = await axios({
      method: method,
      url: url,
      headers: {
        "Content-type": "application/json; charset=utf-8",
        "x-ncp-iam-access-key": sens_access_key,
        "x-ncp-apigw-timestamp": date,
        "x-ncp-apigw-signature-v2": signature,
      },
      data: {
        type: "SMS",
        "contentType":"COMM",
        countryCode: "82",
        from: sens_call_number,
        content: 'nanana',
        messages: [{ to: '01094162506' }],
      },
    });
    console.log("response", smsRes.data);
}

f()