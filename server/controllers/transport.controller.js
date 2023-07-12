const db = require("../config/transport.db");
const model = require("../models/transport.model");
const xl = require("excel4node");
const pizzip = require("pizzip");
const docxtemplater = require("docxtemplater");
const fs = require("fs");
const path = require("path");

async function createOrder(req, res) {
  try {
    let no = await getNo(req.body.date, req.body.shop);
    Number(no.ncount++);

    const order = model;
    order.no = no.ncount;
    order.date = req.body.date;
    order.mobile = req.body.mobile;
    order.fullname = req.body.fullname;
    order.address = req.body.address;
    order.subdistrict = req.body.subdistrict;
    order.district = req.body.district;
    order.province = req.body.province;
    order.postcode = req.body.postcode;
    order.cod = req.body.cod;
    order.remark = req.body.remark;
    order.shop = req.body.shop;
    console.log(order.address);

    const entry = `'${order.no}', '${order.date}', '${order.mobile}', '${order.fullname}', 
    '${order.address}', '${order.subdistrict}', '${order.district}', '${order.province}', 
    '${order.postcode}', '${order.cod}', '${order.remark}', '${order.shop}'`;

    const query = `INSERT INTO ts_order (ts_no, ts_date, ts_mobile, ts_fullname, ts_address, 
    ts_subdistrict, ts_district, ts_province, ts_postcode, ts_cod, ts_remark, ts_shop)
    VALUES (${entry})`;

    await db.write(query);
    res.send({ message: "success" });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
}

async function updateOrder(req, res) {
  try {
    const id = req.body.id;
    const order = model;
    order.date = req.body.date;
    order.mobile = req.body.mobile;
    order.fullname = req.body.fullname;
    order.address = req.body.address;
    order.subdistrict = req.body.subdistrict;
    order.district = req.body.district;
    order.province = req.body.province;
    order.postcode = req.body.postcode;
    order.cod = req.body.cod;
    order.remark = req.body.remark;
    order.shop = req.body.shop;

    const query = `UPDATE ts_order SET ts_date = "${order.date}", ts_mobile = "${order.mobile}",
    ts_fullname = "${order.fullname}", ts_address = "${order.address}", ts_subdistrict = "${order.subdistrict}",
    ts_district = "${order.district}", ts_province = "${order.province}", ts_postcode = "${order.postcode}",
    ts_cod = ${order.cod}, ts_remark = "${order.remark}", ts_shop = "${order.shop}"
    WHERE ts_id = ${id}`;

    await db.write(query);
    res.send({ message: "success" });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
}

async function deleteOrder(req, res) {
  try {
    const id = req.params.id;
    const query = `DELETE FROM ts_order WHERE ts_id = ${id}`;

    await db.write(query);
    res.send({ message: "success" });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
}

async function getShop(req, res) {
  try {
    const query = `SELECT (sh_id) AS value, (sh_name) AS viewValue, (sh_status) AS status
    FROM sh_shop 
    WHERE sh_status = 1`;
    const result = await db.readAll(query, undefined);

    res.send(result);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
}

async function getAllShop(req, res) {
  try {
    const query = `SELECT (sh_id) AS value, (sh_name) AS viewValue, (sh_status) AS status
    FROM sh_shop`;
    const result = await db.readAll(query, undefined);

    res.send(result);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
}

async function createShop(req, res) {
  try {
    const nameShop = req.body.nameShop;
    const status = 1;
    const entry = `'${nameShop}', '${status}'`;
    const query = `INSERT INTO sh_shop (sh_name, sh_status) VALUES (${entry})`;

    await db.write(query);
    res.send({ message: "success" });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
}

async function updateShop(req, res) {
  try {
    const shop = req.body;

    for (let i in shop) {
      let query = `UPDATE sh_shop 
      SET sh_name = "${shop[i].viewValue}", sh_status = "${shop[i].status}"
      WHERE sh_id = ${shop[i].value}`;

      await db.write(query);
    }

    res.send({ message: "success" });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
}

async function getIndex(req, res) {
  try {
    const date = req.params.date;
    const shop = req.params.shop;
    const query1 = "SELECT * FROM ts_order WHERE ts_date = ? AND ts_shop = ?";
    let result1 = await db.readAll(query1, [date, shop]);

    const query2 = `SELECT MAX(ts_no) AS amount,
    SUM(CASE WHEN ts_cod = 0 THEN 1 ELSE 0 END) AS ems, 
    SUM(CASE WHEN ts_cod != 0 THEN 1 ELSE 0 END) AS cod 
    FROM ts_order
    WHERE ts_date = ?
    AND ts_shop = ?`;
    let result2 = await db.read(query2, [date, shop]);
    result2.amount = result2.amount == null ? 0 : result2.amount;
    result2.ems = result2.ems == null ? 0 : result2.ems;
    result2.cod = result2.cod == null ? 0 : result2.cod;

    res.send({ result1, result2 });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
}

async function getAllOrder(req, res) {
  try {
    const query = "SELECT * FROM ts_order";
    let result = await db.readAll(query, undefined);

    res.send(result);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
}

async function getOrderByID(req, res) {
  try {
    const id = req.params.id;
    const query = "SELECT * FROM ts_order WHERE ts_id = ?";
    let result = await db.readAll(query, id);

    res.send(result);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
}

async function getExcel(req, res) {
  try {
    const data = req.body;
    const query = `SELECT * FROM ts_order 
    WHERE ts_date = "${data.date}" 
    AND ts_shop = ${data.shop}
    AND ts_no BETWEEN ${data.from} 
    AND ${data.to}`;

    const wb = new xl.Workbook();
    const ws = wb.addWorksheet("Sheet 1");
    const url =
      process.env.userprofile +
      String.fromCharCode(92) +
      "Desktop" +
      String.fromCharCode(92) +
      data.nameShop +
      "-" +
      data.date +
      ".xlsx";

    setWorkSheet(ws);
    await addDataExcel(await db.readAll(query, undefined), ws);
    await saveExcel(url, wb);
    res.send({ message: "success", url: `Path: ${url}` });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
}

async function getWord(req, res) {
  try {
    const data = req.body;
    const query = `SELECT * FROM ts_order 
    WHERE ts_date = "${data.date}" 
    AND ts_shop = ${data.shop}
    AND ts_no BETWEEN ${data.from} 
    AND ${data.to}`;

    const content = fs.readFileSync(
      path.resolve("public", "table.docx"),
      "binary"
    );
    const url =
      process.env.userprofile +
      String.fromCharCode(92) +
      "Desktop" +
      String.fromCharCode(92) +
      data.nameShop +
      "-" +
      data.date +
      ".docx";

    const zip = new pizzip(content);
    const doc = new docxtemplater();
    const result = await setDataWord(await db.readAll(query, undefined));
    doc.loadZip(zip);
    doc.setData({
      clients: result,
    });

    doc.render();
    const buf = doc.getZip().generate({ type: "nodebuffer" });
    await saveWord(url, buf);

    res.send({ message: "success", url: `Path: ${url}` });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
}

async function getReport(req, res) {
  try {
    const data = req.body;
    let query = "";
    let date = "";
    const wb = new xl.Workbook();
    const ws = wb.addWorksheet("Sheet 1");

    query = "SELECT sh_name FROM sh_shop WHERE sh_id = ?";
    nameShop = await db.read(query, data.shop);
    const url =
      process.env.userprofile +
      String.fromCharCode(92) +
      "Desktop" +
      String.fromCharCode(92) +
      nameShop.sh_name +
      "-" +
      "report.xlsx";

    if (data.checked)
      query = "SELECT ts_mobile FROM ts_order ORDER BY DATE(ts_date)";
    else {
      query = `SELECT ts_mobile
      FROM ts_order
      WHERE ts_shop = ${data.shop}
      AND DATE(ts_date)
      BETWEEN DATE('${data.dateS}') AND DATE('${data.dateE}')
      ORDER BY DATE(ts_date)`;

      date = `${dmy(data.dateS)} - ${dmy(data.dateE)}`;
    }

    await addDataReport(await db.readAll(query, undefined), ws, date);
    await saveExcel(url, wb);
    res.send({ message: "success", url: `Path: ${url}` });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
}

async function updateTable(req, res) {
  try {
    let sql =
      "CREATE TABLE sh_shop(sh_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, sh_name TEXT, sh_status INTEGER NOT NULL)";

    await db.write(sql);
    sql = `INSERT INTO sh_shop(sh_name, sh_status) VALUES ("ร้าน 1", 1)`;
    await db.write(sql);

    sql = `SELECT sh_id FROM sh_shop`;
    let r = await db.read(sql, undefined);

    sql = `ALTER TABLE ts_order ADD ts_shop INTEGER`;
    await db.write(sql);

    sql = `UPDATE ts_order SET ts_shop = ${r.sh_id}`;
    await db.write(sql);

    res.send({ message: "success" });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
}

module.exports = {
  createOrder,
  updateOrder,
  deleteOrder,
  getShop,
  getAllShop,
  createShop,
  updateShop,
  getIndex,
  getAllOrder,
  getOrderByID,
  getExcel,
  getWord,
  getReport,
  updateTable,
};

function getNo(date, shop) {
  const query =
    "SELECT MAX(ts_no) AS ncount FROM ts_order WHERE ts_date = ? AND ts_shop = ?";
  return db.read(query, [date, shop]);
}

function setWorkSheet(ws) {
  ws.cell(2, 1).string("KERRY EXPRESS (ส่งไว ส่งชัวร์ ทั่วไทย)");
  ws.cell(4, 1).string("No");
  ws.cell(4, 2).string("Recipient Name");
  ws.cell(4, 3).string("Mobile No.");
  ws.cell(4, 4).string("Email");
  ws.cell(4, 5).string("Address #1");
  ws.cell(4, 6).string("Address #2");
  ws.cell(4, 7).string("Zip Code");
  ws.cell(4, 8).string("COD Amt (Baht)");
  ws.cell(4, 9).string("Remark");

  ws.cell(5, 1).string("1");
  ws.cell(5, 2).string("คุณตัวอย่าง ข้อมูล");
  ws.cell(5, 3).string("0999999999");
  ws.cell(5, 4).string("me@sample.com");
  ws.cell(5, 5).string("999/9 หมู่บ้านพัฒนา");
  ws.cell(5, 6).string("แขวงยานนาวา เขตสาทร กรุงเทพมหานคร");
  ws.cell(5, 7).string("10120");
  ws.cell(5, 8).string("500");
  ws.cell(5, 9).string("พวงกุญแจ");

  ws.cell(8, 1).string("No");
  ws.cell(8, 2).string("Recipient Name");
  ws.cell(8, 3).string("Mobile No.");
  ws.cell(8, 4).string("Email");
  ws.cell(8, 5).string("Address #1");
  ws.cell(8, 6).string("Address #2");
  ws.cell(8, 7).string("Zip Code");
  ws.cell(8, 8).string("COD Amt (Baht)");
  ws.cell(8, 9).string("Remark");
}

function addDataExcel(data, ws) {
  return new Promise((resolve, reject) => {
    if (data) {
      let address = "";

      for (let i = 0; i < data.length; i++) {
        address = `${data[i].ts_subdistrict} ${data[i].ts_district} ${data[i].ts_province}`;

        ws.cell(9 + i, 1).string((i + 1).toString());
        ws.cell(9 + i, 2).string(data[i].ts_fullname);
        ws.cell(9 + i, 3).string(data[i].ts_mobile.toString());
        ws.cell(9 + i, 5).string(data[i].ts_address);
        ws.cell(9 + i, 6).string(address);
        ws.cell(9 + i, 7).string(data[i].ts_postcode.toString());
        ws.cell(9 + i, 8).string(data[i].ts_cod.toString());
        ws.cell(9 + i, 9).string(data[i].ts_remark);
      }
    }
    resolve(true);
  });
}

function saveExcel(url, wb) {
  return new Promise((resolve, reject) => {
    wb.write(url, (err, stats) => {
      if (err) reject({ message: "Error! Excel is Working On." });
      else resolve({ message: `Path: ${url}` });
    });
  });
}

function setDataWord(data) {
  return new Promise((resolve, reject) => {
    const recipient = [];

    for (let i = 0; i < data.length; i++) {
      const word = {};
      const col2 = 8;
      const col3 = 16;

      if (i % col2 == 0 && i != 0) i += col3;
      if (i >= data.length) break;

      if (data[i] != undefined) {
        word.ts_no1 = data[i].ts_no;
        word.ts_fullname1 = data[i].ts_fullname;
        word.ts_mobile1 = `(${data[i].ts_mobile.slice(0, 3)}-${data[
          i
        ].ts_mobile.slice(3)})`;
        word.ts_address1 = data[i].ts_address;
        word.ts_subdistrict1 = data[i].ts_subdistrict;
        word.ts_district1 = data[i].ts_district;
        word.ts_province1 = data[i].ts_province;
        word.ts_postcode1 = data[i].ts_postcode;
        word.ts_cod1 =
          data[i].ts_cod != 0 ? `ยอดเงิน ${data[i].ts_cod} บาท` : "";
      } else {
        word.ts_no1 = "";
        word.ts_fullname1 = "";
        word.ts_mobile1 = "";
        word.ts_address1 = "";
        word.ts_subdistrict1 = "";
        word.ts_district1 = "";
        word.ts_province1 = "";
        word.ts_postcode1 = "";
        word.ts_cod1 = "";
      }

      if (data[i + col2] != undefined) {
        word.ts_no2 = data[i + col2].ts_no;
        word.ts_fullname2 = data[i + col2].ts_fullname;
        word.ts_mobile2 = `(${data[i + col2].ts_mobile.slice(0, 3)}-${data[
          i + col2
        ].ts_mobile.slice(3)})`;
        word.ts_address2 = data[i + col2].ts_address;
        word.ts_subdistrict2 = data[i + col2].ts_subdistrict;
        word.ts_district2 = data[i + col2].ts_district;
        word.ts_province2 = data[i + col2].ts_province;
        word.ts_postcode2 = data[i + col2].ts_postcode;
        word.ts_cod2 =
          data[i + col2].ts_cod != 0
            ? `ยอดเงิน ${data[i + col2].ts_cod} บาท`
            : "";
      } else {
        word.ts_no2 = "";
        word.ts_fullname2 = "";
        word.ts_mobile2 = "";
        word.ts_address2 = "";
        word.ts_subdistrict2 = "";
        word.ts_district2 = "";
        word.ts_province2 = "";
        word.ts_postcode2 = "";
        word.ts_cod2 = "";
      }

      if (data[i + col3] != undefined) {
        word.ts_no3 = data[i + col3].ts_no;
        word.ts_fullname3 = data[i + col3].ts_fullname;
        word.ts_mobile3 = `(${data[i + col3].ts_mobile.slice(0, 3)}-${data[
          i + col3
        ].ts_mobile.slice(3)})`;
        word.ts_address3 = data[i + col3].ts_address;
        word.ts_subdistrict3 = data[i + col3].ts_subdistrict;
        word.ts_district3 = data[i + col3].ts_district;
        word.ts_province3 = data[i + col3].ts_province;
        word.ts_postcode3 = data[i + col3].ts_postcode;
        word.ts_cod3 =
          data[i + col3].ts_cod != 0
            ? `ยอดเงิน ${data[i + col3].ts_cod} บาท`
            : "";
      } else {
        word.ts_no3 = "";
        word.ts_fullname3 = "";
        word.ts_mobile3 = "";
        word.ts_address3 = "";
        word.ts_subdistrict3 = "";
        word.ts_district3 = "";
        word.ts_province3 = "";
        word.ts_postcode3 = "";
        word.ts_cod3 = "";
      }

      recipient.push(word);
    }
    resolve(recipient);
  });
}

function saveWord(url, buf) {
  return new Promise((resolve, reject) => {
    fs.writeFile(url, buf, (err) => {
      if (err) reject({ message: "Error! Word is Working On." });
      else resolve({ message: `Path: ${url}` });
    });
  });
}

function addDataReport(data, ws, date) {
  return new Promise((resolve, reject) => {
    if (data) {
      for (let i = 0; i < data.length; i++) {
        ws.cell(1 + i, 1).string(data[i].ts_mobile.toString());
      }
      if (date) ws.cell(1, 3).string(date);
    }
    resolve(true);
  });
}

function dmy(date) {
  let format = date.split("-");
  return [format[2], format[1], format[0]].join("/");
}

function setDataWord_backup(data) {
  const recipient = [];

  for (let i = 0; i < data.length; i++) {
    const word = {};

    if (data[i] != undefined) {
      word.ts_no1 = data[i].ts_no;
      word.ts_fullname1 = data[i].ts_fullname;
      word.ts_mobile1 = `(${data[i].ts_mobile})`;
      word.ts_address1 = data[i].ts_address;
      word.ts_subdistrict1 = data[i].ts_subdistrict;
      word.ts_district1 = data[i].ts_district;
      word.ts_province1 = data[i].ts_province;
      word.ts_postcode1 = data[i].ts_postcode;
      word.ts_cod1 = data[i].ts_cod != 0 ? `ยอดเงิน ${data[i].ts_cod} บาท` : "";
    } else {
      word.ts_no1 = "";
      word.ts_fullname1 = "";
      word.ts_mobile1 = "";
      word.ts_address1 = "";
      word.ts_subdistrict1 = "";
      word.ts_district1 = "";
      word.ts_province1 = "";
      word.ts_postcode1 = "";
      word.ts_cod1 = "";
    }

    if (data[i + 1] != undefined) {
      word.ts_no2 = data[i + 1].ts_no;
      word.ts_fullname2 = data[i + 1].ts_fullname;
      word.ts_mobile2 = `(${data[i + 1].ts_mobile})`;
      word.ts_address2 = data[i + 1].ts_address;
      word.ts_subdistrict2 = data[i + 1].ts_subdistrict;
      word.ts_district2 = data[i + 1].ts_district;
      word.ts_province2 = data[i + 1].ts_province;
      word.ts_postcode2 = data[i + 1].ts_postcode;
      word.ts_cod2 =
        data[i + 1].ts_cod != 0 ? `ยอดเงิน ${data[i + 1].ts_cod} บาท` : "";
    } else {
      word.ts_no2 = "";
      word.ts_fullname2 = "";
      word.ts_mobile2 = "";
      word.ts_address2 = "";
      word.ts_subdistrict2 = "";
      word.ts_district2 = "";
      word.ts_province2 = "";
      word.ts_postcode2 = "";
      word.ts_cod2 = "";
    }

    if (data[i + 2] != undefined) {
      word.ts_no3 = data[i + 2].ts_no;
      word.ts_fullname3 = data[i + 2].ts_fullname;
      word.ts_mobile3 = `(${data[i + 2].ts_mobile})`;
      word.ts_address3 = data[i + 2].ts_address;
      word.ts_subdistrict3 = data[i + 2].ts_subdistrict;
      word.ts_district3 = data[i + 2].ts_district;
      word.ts_province3 = data[i + 2].ts_province;
      word.ts_postcode3 = data[i + 2].ts_postcode;
      word.ts_cod3 =
        data[i + 2].ts_cod != 0 ? `ยอดเงิน ${data[i + 2].ts_cod} บาท` : "";
    } else {
      word.ts_no3 = "";
      word.ts_fullname3 = "";
      word.ts_mobile3 = "";
      word.ts_address3 = "";
      word.ts_subdistrict3 = "";
      word.ts_district3 = "";
      word.ts_province3 = "";
      word.ts_postcode3 = "";
      word.ts_cod3 = "";
    }

    i = i + 2;
    recipient.push(word);
  }

  return recipient;
}
