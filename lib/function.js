const fs = require('fs')
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
    fs.readFile('./db/database.json', "utf8", (err, data) => {
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

module.exports = {
  getUser,
  addUser,
  saveDeposit,
  updateUser,
};
