const { read, send, sendButton, sendImage } = require("./lib/cloudAPI.js");
const express = require("express");
const bodyParser = require("body-parser");
const app = express().use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = 3100;
const request = require("request");
const fetch = require("node-fetch");
const axios = require("axios");
const turboOTP = require("./lib/turbootp.js");
const fs = require("fs");
const databasePath = "./db/database.json";
const util = require("util");
const writeFileAsync = util.promisify(fs.writeFile);
const crypto = require("crypto");
const apiKey = process.env.PAYDISINI;

const updateUser = async (phone, newData) => {
  try {
    let database = await readDatabase();

    const userIndex = database.users.findIndex((user) => user.phone === phone);

    if (userIndex !== -1) {
      database.users[userIndex] = { ...database.users[userIndex], ...newData };

      await writeFileAsync(databasePath, JSON.stringify(database));

      console.log(`Data pengguna dengan nomor ${phone} berhasil diperbarui.`);
    } else {
      console.log(
        `Pengguna dengan nomor ${phone} tidak ditemukan dalam database.`,
      );
    }
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

const readDatabase = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(databasePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        try {
          const database = JSON.parse(data);
          resolve(database);
        } catch (error) {
          reject(error);
        }
      }
    });
  });
};

const writeDatabase = (data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(databasePath, JSON.stringify(data, null, 2), "utf8", (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const getUser = async (phone) => {
  try {
    const database = await readDatabase();
    const user = database.users.find((user) => user.phone === phone);
    return user;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

const addUser = async (userData) => {
  try {
    const database = await readDatabase();
    database.users.push(userData);
    await writeDatabase(database);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

function readDataFromFile(filePath) {
  try {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to read data from file:", error);
    return null;
  }
}

function writeDataToFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log("Data has been written to the file successfully.");
  } catch (error) {
    console.error("Failed to write data to file:", error);
  }
}

function saveDeposit(userPhone, deposit) {
  const filePath = "./db/deposits.json";
  let depositsData = readDataFromFile(filePath) || { deposits: [] };
  depositsData.deposits.push({ user: userPhone, ...deposit });
  writeDataToFile(filePath, depositsData);
}

app.post("/api/chat", async (req, res) => {
  try {
    const body_param = req.body;
    const inbox = body_param.conversation.contact_inbox.inbox_id;
    const pushname = body_param.conversation.meta.sender.name;
    const chat = body_param.conversation.messages[0].content;
    const from = body_param.conversation.contact_inbox.source_id;
    const idMsg = body_param.conversation.messages[0].source_id;
    global.prefix = /^[./~!#%^&+=\-,;:()]/.test(chat)
      ? chat.match(/^[./~!#%^&+=\-,;:()]/gi)
      : "#";
    const isCmd = chat.startsWith(global.prefix);
    const cmd = isCmd
      ? chat.slice(1).trim().split(/ +/).shift().toLocaleLowerCase()
      : null;
    const arg = chat.substring(chat.indexOf(" ") + 1);
    const args = chat.trim().split(/ +/).slice(1);
    console.log(JSON.stringify(body_param, null, 2));

    if (inbox == "40200") {
      read(idMsg);
      console.log(pushname + " - " + chat);
      let userData = await getUser(from);
      if (!userData) {
        userData = { phone: from, saldo: 0 };
        await addUser(userData);
      }

      if (cmd == "profile") {
        const profileData = await turboOTP.profile();
        console.log("Profile:", profileData);
        const profileText = `username:${profileData.data.data.username}\nSaldo: ${profileData.data.data.saldo}`;
        send(from, profileText);
      }

      if (cmd === "deposit" || chat == "Deposit") {
        const amount = parseInt(arg);
        if (isNaN(amount) || amount <= 0) {
          send(
            from,
            "Mohon masukkan jumlah deposit yang valid.\nContoh: /deposit 1000",
          );
          return;
        }

        const uniqueCode = Math.floor(Math.random() * 1000000).toString();
        const service = "11";
        const validTime = "1800";
        const note = "otp";
        const signature = crypto
          .createHash("md5")
          .update(
            apiKey +
              uniqueCode +
              service +
              amount +
              validTime +
              "NewTransaction",
          )
          .digest("hex");

        const options = {
          method: "POST",
          url: "https://paydisini.co.id/api/",
          headers: {},
          formData: {
            key: apiKey,
            request: "new",
            unique_code: uniqueCode,
            service: service,
            amount: amount.toString(),
            note: note,
            valid_time: validTime,
            type_fee: "0",
            callback_count: "1",
            signature: signature,
          },
        };

        request(options, function (error, response) {
          if (error) {
            console.error("Error:", error);
            send(
              from,
              "Terjadi kesalahan saat memproses deposit. Silakan coba lagi nanti.",
            );
          } else {
            const responseBody = JSON.parse(response.body);
            if (responseBody.success) {
              console.log(responseBody);
              saveDeposit(from, responseBody);
              sendImage(
                from,
                responseBody.data.qrcode_url,
                `Permintaan deposit sebesar \`Rp${amount}\` berhasil. Harap segera lakukan pembayaran.`,
              );
            } else {
              send(from, "Permintaan deposit gagal. Silakan coba lagi nanti.");
            }
          }
        });
      }

      if (cmd === "ceksaldo" || chat == "saldo") {
        // send(from, `Saldo Anda saat ini: \`Rp${userData.saldo},-\``);
        sendButton(from, "Saldo Anda saat ini: `Rp" + userData.saldo + ",-`", [
          { type: "reply", reply: { id: "idbutton1", title: `List OTP` } },
        ]);
      }
      if (
        cmd == "listotp" ||
        cmd == "otp" ||
        chat == "otp" ||
        chat == "List OTP"
      ) {
        try {
          const servicesResponse = await turboOTP.getServices();
          const apiData = servicesResponse.data.data;

          const roundingValue = 100;

          const whatsappFacebookServices = apiData
            .filter((service) =>
              /(promo|open ai|instagram|whatsapp|facebook|tele|gojekiIndomaret|langit game|gmail|ovo|dana \( murah)/.test(
                service.name.toLowerCase(),
              ),
            )
            .map((service, index) => ({
              ...service,
              number: index + 1,
              roundedPrice:
                Math.ceil(parseFloat(service.price) / roundingValue) *
                roundingValue,
            }));

          let message = "";
          whatsappFacebookServices.forEach((service) => {
            message += `${service.number}. ${service.name}\n- ID: ${service.id}\n- Harga: \`Rp${service.roundedPrice},-\`\n\n`;
          });
          sendButton(
            from,
            message +
              `\n\nSilahkan kirim perintah /beli <id>.\nContoh: /beli 456`,
            [
              {
                type: "reply",
                reply: { id: "idbutton1", title: `Cara Penggunaan` },
              },
            ],
          );
          console.log(message);
        } catch (error) {
          console.error("Error:", error);
        }
      }

      if (cmd === "beli") {
        if (!arg) return;
        const servicesResponse = await turboOTP.getServices();
        const services = servicesResponse.data.data;
        const targetServiceId = arg;
        const service = services.find(
          (service) => service.id === targetServiceId,
        );

        try {
          const userData = await getUser(from);

          if (!userData) {
            await addUser({ phone: from, saldo: 0 });
            send(
              from,
              "Anda belum memiliki saldo. Silakan isi saldo terlebih dahulu.\nSilahkan kirim perintah /deposit 10000",
            );
            return;
          }

          const harga = Math.ceil(service.price / 100) * 100;

          if (userData.saldo >= harga) {
            const order = await turboOTP.placeOrder(arg);
            console.log("Order:", order);

            if (order.success) {
              userData.saldo -= harga;

              const orderData = order.data.data;
              const purchaseHistory = {
                order_id: orderData.order_id,
                number: orderData.number,
                aplikasi_name: service.name,
                price: harga,
              };

              if (!userData.purchase_history) {
                userData.purchase_history = [];
              }
              userData.purchase_history.push(purchaseHistory);

              await updateUser(from, userData);

              const orderText = `Silahkan login/daftar ke Aplikasi *${orderData.aplikasi_name}* menggunakan nomor ${orderData.number} untuk request kode OTP, kemudian klik tombol *Cek ${orderData.order_id}* untuk melihat SMS.\n\nID Pesanan: ${orderData.order_id}\nNomor: ${orderData.number}\nNama Aplikasi: ${service.name}`;
              console.log(orderText);
              sendButton(from, orderText, [
                {
                  type: "reply",
                  reply: {
                    id: "idbutton1",
                    title: `Cek ${orderData.order_id}`,
                  },
                },
                {
                  type: "reply",
                  reply: {
                    id: "idbutton2",
                    title: `Batalkan ${orderData.order_id}`,
                  },
                },
              ]);
            } else {
              console.error("Gagal menempatkan pesanan:", order.messages);
              send(from, order.data.messages);
            }
          } else {
            send(
              from,
              "Maaf, saldo Anda tidak mencukupi untuk melakukan pesanan ini.",
            );
          }
        } catch (error) {
          console.error("Error:", error);
          send(
            from,
            "Terjadi kesalahan dalam pemrosesan pesanan. Silakan coba lagi nanti.",
          );
        }
      }

      if (chat.toLowerCase().includes("cara penggunaan")) {
        sendButton(
          from,
          `Cara penggunaan:\n1. \`/listotp\` untuk melihat list otp aplikasi tersedia.\n2. \`/beli id_aplikasi\`\n- Contoh: \`/beli 456\`\n3. \`/deposit 1000\` Untuk deposit saldo\n4. \`/ceksaldo\` Untuk melihat saldo`,
          [{ type: "reply", reply: { id: "idbutton1", title: `List OTP` } }],
        );
      }
      if (chat.toLowerCase().includes("cek")) {
        if (args.length === 0) return;

        const orderId = args[0];
        console.log(orderId);
        try {
          const cekOrder = await turboOTP.fetchOrder(orderId);
          console.log("Cek Order:", JSON.stringify(cekOrder, null, 2));
          if (cekOrder.success) {
            const orders = cekOrder.data.data;

            if (orders.length === 0) {
              console.log("Tidak ada pesanan dengan ID tersebut.");
              await send(
                from,
                "ID Pesanan tidak ditemukan, atau pesanan telah selesai/dibatalkan.",
              );
              return;
            }

            for (const order of orders) {
              const { sms } = order;
              if (sms) {
                console.log("SMS diterima. Mengirim pesan WhatsApp...");
                const parsedSms = JSON.parse(sms);
                if (Array.isArray(parsedSms)) {
                  for (const messageData of parsedSms) {
                    await send(from, messageData.sms);
                  }
                } else {
                  await send(from, parsedSms);
                }
                console.log("Pesan WhatsApp berhasil dikirim.");
                return;
              } else {
                console.log("Tidak ada SMS untuk order dengan ID:", orderId);
                await sendButton(
                  from,
                  "OTP Belum diterima, Silahkan cek kembali!",
                  [
                    {
                      type: "reply",
                      reply: { id: "idbutton1", title: `Cek ${orderId}` },
                    },
                    {
                      type: "reply",
                      reply: { id: "idbutton2", title: `Batalkan ${orderId}` },
                    },
                  ],
                );
              }
            }
          }
        } catch (error) {
          console.error("Terjadi kesalahan:", error);
        }
      }

      if (chat.toLowerCase().includes("batalkan")) {
        if (args.length === 0) return;

        try {
          const orderId = args[0];

          const cekOrder = await turboOTP.fetchOrder(orderId);
          const order = cekOrder.data.data[0];
          console.log("Cek Order:", order.status_sms);

          if (order && order.status_sms === "0") {
            const cancelResponse = await turboOTP.cancelOrder(orderId);
            console.log("Order cancelled:", cancelResponse);

            if (cancelResponse.success) {
              const userData = await getUser(from);
              const purchaseHistory = userData.purchase_history;
              const cancelledPurchase = purchaseHistory.find(
                (purchase) => purchase.order_id === orderId,
              );

              if (cancelledPurchase) {
                userData.saldo += parseFloat(cancelledPurchase.price);

                userData.purchase_history = userData.purchase_history.filter(
                  (purchase) => purchase.order_id !== orderId,
                );

                await updateUser(from, userData);

                await send(
                  from,
                  "Order berhasil dibatalkan. Saldo Anda telah dikembalikan.",
                );
              } else {
                await send(
                  from,
                  "Order tidak ditemukan dalam riwayat pembelian.",
                );
              }
            } else {
              await send(from, cancelResponse.data.messages);
            }
          } else {
            await send(
              from,
              "Maaf, pesanan tidak dapat dibatalkan karena SMS telah terkirim.",
            );

            const orders = cekOrder.data.data;
            for (const o of orders) {
              const { sms } = o;
              if (sms) {
                console.log("SMS diterima. Mengirim pesan WhatsApp...");
                const parsedSms = JSON.parse(sms);
                if (Array.isArray(parsedSms)) {
                  for (const messageData of parsedSms) {
                    await send(from, messageData.sms);
                  }
                } else {
                  await send(from, parsedSms);
                }
                console.log("Pesan WhatsApp berhasil dikirim.");
                return;
              }
            }
          }
        } catch (error) {
          console.error("Failed to cancel order:", error);
          res.status(500).send("Internal Server Error");
        }
      }
    }
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/callback", async (req, res) => {
  const callbackData = req.body;
  console.log(callbackData);

  if (req.body.key === apiKey) {
    const uniqueCode = req.body.unique_code;
    const status = req.body.status;
    const signature = req.body.signature;
    const sign = crypto
      .createHash("md5")
      .update(apiKey + uniqueCode + "CallbackStatus")
      .digest("hex");

    if (signature !== sign) {
      res.json({ success: false });
    } else if (status === "Success") {
      const callbackData = req.body;
      console.log(callbackData);

      function readDataFromFile(filePath) {
        try {
          const data = fs.readFileSync(filePath);
          return JSON.parse(data);
        } catch (error) {
          console.error("Failed to read data from file:", error);
          return null;
        }
      }

      function writeDataToFile(filePath, data) {
        try {
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
          console.log("Data has been written to the file successfully.");
        } catch (error) {
          console.error("Failed to write data to file:", error);
        }
      }

      function addBalance(userPhone, amount) {
        const databaseFilePath = "./db/database.json";
        let databaseData = readDataFromFile(databaseFilePath) || {};
        if (databaseData.users) {
          const userIndex = databaseData.users.findIndex(
            (user) => user.phone === userPhone,
          );
          if (userIndex !== -1) {
            databaseData.users[userIndex].saldo += amount;
            writeDataToFile(databaseFilePath, databaseData);
            console.log(`Balance for user ${userPhone} has been updated.`);
          } else {
            console.error(`User ${userPhone} not found.`);
          }
        } else {
          console.error("No users data found.");
        }
      }

      const depositsData = readDataFromFile("./db/deposits.json");
      if (depositsData) {
        const deposit = depositsData.deposits.find(
          (d) => d.data.unique_code === callbackData.unique_code,
        );
        if (deposit) {
          const amount = deposit.data.amount;
          const userPhone = deposit.user;
          addBalance(userPhone, amount);
          send(userPhone, `Deposit sebesar \`Rp${amount},-\` diterima!`);
        } else {
          console.error(
            `Deposit with pay_id ${callbackData.pay_id} not found.`,
          );
        }
      } else {
        console.error("No deposit data found.");
      }
    } else if (status === "Canceled") {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } else {
    res.json({ success: false });
  }
});

app.listen(port, () => {
  console.log(`Running ${port}`);
});

module.exports = app;
