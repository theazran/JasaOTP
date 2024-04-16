var request = require("request");
const WA_CLOUD_TOKEN = process.env.WA_CLOUD_TOKEN;

async function send(to, msg) {
  var options = {
    method: "POST",
    url: "https://graph.facebook.com/v18.0/268249643045859/messages",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${WA_CLOUD_TOKEN}`,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to,
      type: "text",
      text: {
        preview_url: true,
        body: msg,
      },
    }),
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    // console.log(response.body);
    console.log("Message send!");
  });
}

async function react(id, from, emoji) {
  var options = {
    method: "POST",
    url: "https://graph.facebook.com/v18.0/268249643045859/messages",
    headers: {
      "Content-Type": "application/json",
      Authorization: WA_CLOUD_TOKEN,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: from,
      type: "reaction",
      reaction: {
        message_id: id,
        emoji: emoji,
      },
    }),
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
  });
}

async function react(from, idMsg, emoji) {
  var options = {
    method: "POST",
    url: "https://graph.facebook.com/v18.0/268249643045859/messages",
    headers: {
      "Content-Type": "application/json",
      Authorization: WA_CLOUD_TOKEN,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: from,
      type: "reaction",
      reaction: {
        message_id: idMsg,
        emoji: emoji,
      },
    }),
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
  });
}

async function read(idMsg) {
  var request = require('request');
  var options = {
    'method': 'POST',
    'url': 'https://graph.facebook.com/v18.0/268249643045859/messages',
    'headers': {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${WA_CLOUD_TOKEN}`,
      'Cookie': 'ps_l=0; ps_n=0'
    },
    body: JSON.stringify({
      "messaging_product": "whatsapp",
      "status": "read",
      "message_id": idMsg
    })

  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    // console.log(response.body);
  });

}

async function video(from, url) {
  var options = {
    method: "POST",
    url: "https://graph.facebook.com/v18.0/268249643045859/messages",
    headers: {
      "Content-Type": "application/json",
      Authorization: WA_CLOUD_TOKEN,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: from,
      type: "video",
      video: {
        link: url,
        caption: `Success..`,
      },
    }),
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
  });
}

//PENGADILAN
async function kirim(from, text) {
  var options = {
    method: "POST",
    url: "https://graph.facebook.com/v18.0/113624525001288/messages",
    headers: {
      "Content-Type": "application/json",
      Authorization: WA_CLOUD_TOKEN,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: from,
      type: "text",
      text: {
        preview_url: false,
        body: text,
      },
    }),
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
  });
}

async function kirimIklan(from) {
  var options = {
    method: "POST",
    url: "https://graph.facebook.com/v18.0/268249643045859/messages",
    headers: {
      "Content-Type": "application/json",
      Authorization: WA_CLOUD_TOKEN,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: from,
      type: "template",
      template: {
        name: "iklan_nufa",
        language: {
          code: "id",
        },
      },
    }),
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log("Iklan terkirim");
  });
}

async function donasi(from) {
  var options = {
    method: "POST",
    url: "https://graph.facebook.com/v18.0/268249643045859/messages",
    headers: {
      "Content-Type": "application/json",
      Authorization: WA_CLOUD_TOKEN,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: from,
      type: "template",
      template: {
        name: "donasi",
        language: {
          code: "id",
        },
      },
    }),
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
  });
}

function sendFacebookMessage(sectionsData) {
  const options = {
    method: "POST",
    url: "https://graph.facebook.com/v19.0/268249643045859/messages",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer EAAKhvxjRMugBOZCZBPbwBnDenSmPNE87e4oBkQjXb5cgqz1B8hFmVtJEQKYnDeMFBlhOYMwO7VilHVHePjbhYQsmrzHaDMc5ZBnVRnuAAeJP8yPbCo61PYN58ZBSxB0P6pjdvh9BVt9PLNiwkynaZAMApHvjSaACzPTCBVj4OvuIR54RA2N3ZAZAy1RwCFsD1aZC76DxkssXxJdJOpPF",
      Cookie: "ps_l=0; ps_n=0",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: "6285255646434",
      type: "interactive",
      interactive: {
        type: "list",
        header: {
          type: "text",
          text: "<HEADER_TEXT>",
        },
        body: {
          text: "<BODY_TEXT>",
        },
        footer: {
          text: "<FOOTER_TEXT>",
        },
        action: {
          button: "<BUTTON_TEXT>",
          sections: sectionsData.map((section) => ({
            title: section.title,
            rows: section.rows.map((row) => ({
              id: row.id,
              title: row.title,
              description: row.description,
            })),
          })),
        },
      },
    }),
  };

  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
  });
}

async function sendButton(from, text, action) {
  var options = {
    method: "POST",
    url: "https://graph.facebook.com/v18.0/268249643045859/messages",
    headers: {
      "Content-Type": "application/json",
      Authorization:  `Bearer ${WA_CLOUD_TOKEN}`,
      Cookie: "ps_l=0; ps_n=0",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: from,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: text,
        },
        footer: {
            text: "© 2024 - JasaOTP"
        },
        action: {
          buttons:
            action
        },
      },
    }),
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
  });
}


async function sendImage(from, url, caption) {
var options = {
  'method': 'POST',
  'url': 'https://graph.facebook.com/v18.0/268249643045859/messages',
  'headers': {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer EAAGEbTYPYIIBOZBiRkToYTZBuwjXANVOPSmJD7xlPrlQMxO9czp5IeEHlz2uGvz6v36PEk3LFSVyiugYd9jttteAUI3WvNpl2POdCgintZBZCP4bSpZAZC4s3HDuj1xlCVmv7MRcFccuafCr0DIofROuREW3ngspweSiy43gojjt8gDskphjNU2hl0cJW8Ydbg95uwBloOCSgPZCZBiV',
    'Cookie': 'ps_l=0; ps_n=0'
  },
  body: JSON.stringify({
    "messaging_product": "whatsapp",
    "recipient_type": "individual",
    "to": from,
    "type": "image",
    "image": {
      "link": url,
      "caption": caption
    }
  })

};
request(options, function (error, response) {
  if (error) throw new Error(error);
  console.log(response.body);
});
}




module.exports = {
  sendFacebookMessage,
  donasi,
  send,
  react,
  kirim,
  kirimIklan,
  video,
  read,
  sendButton,
  sendImage
};
