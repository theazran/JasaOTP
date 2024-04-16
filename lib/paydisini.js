var request = require("request");
const crypto = require("crypto");

const apiKey = "43cc5b1fc7fdc75fd53c4052e4abceea";
const uniqueCode = "2";
const service = "17";
const amount = "100";
const validTime = "1800";
const note = "otp";

const signature = crypto
  .createHash("md5")
  .update(apiKey + uniqueCode + service + amount + validTime + "NewTransaction")
  .digest("hex");

var options = {
  method: "POST",
  url: "https://paydisini.co.id/api/",
  headers: {},
  formData: {
    key: "43cc5b1fc7fdc75fd53c4052e4abceea",
    request: "new",
    unique_code: uniqueCode,
    service: "17",
    amount: amount,
    note: note,
    valid_time: "1800",
    type_fee: "0",
    signature: signature,
  },
};
request(options, function (error, response) {
  if (error) throw new Error(error);
  console.log(response.body);
});
