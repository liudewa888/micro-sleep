const mysql = require("./resource/js/mysql.js");
const sql = new mysql();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const fs = require("fs");
const filePath = __dirname + "/media/"; //音频路径

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/video/:number/:name", async (req, res) => {
  //   console.log(req.params)
  const number = req.params.number;
  let name = req.params.name.split(".")[0];
  let str = `select section,ext from content where number=${number} and link='${name}'`;
  const data = await sql.query(str);
  const section = data[0].section;
  const ext = data[0].ext || "m4a";
  const path = filePath + number + "/" + section + "-" + number + "." + ext;
  const rs = fs.createReadStream(path);

  const range = req.headers.range;
  // console.log(req.url, range);
  if (!range) {
    res.status(404);
    res.send("NOT FOUND");
    return;
  }

  const result = [];
  rs.on("data", chunk => {
    result.push(chunk);
  });
  rs.on("end", () => {
    const data = Buffer.concat(result);

    const reg = /=(.*?)-(.*?)$/;
    const temp = reg.exec(range);
    const start = temp[1] || 0;
    const end = temp[2] || data.length+'';
    // console.log(start, end);
    if (start === end) {
      res.status(404);
      res.send("NOT FOUND");
      return;
    }
    res.setHeader("content-length", data.length);
    res.setHeader("content-type", "audio/mpeg");
    res.setHeader("cache-control", "max-age=360000");
    res.setHeader(
      "content-range",
      `bytes ${start}-${end-1}/${data.length}`
    );
    res.setHeader("accept-ranges", "bytes");
    res.setHeader("date", new Date().toGMTString());
    res.status(206);
    res.send(data.slice(start, end));
  });
  rs.on("error", err => {
    console.log(err);
    res.status(404);
    res.send("NOT FOUND");
  });
});
app.get("/image/:number/:name", async (req, res) => {
  const number = req.params.number;
  let name = req.params.name;
  let str = `select number from book where imgLink='${name}'`;
  const data = await sql.query(str);
  name = "0-" + data[0].number + ".png";
  fs.readFile(filePath + number + "/" + name, (err, data) => {
    if (!err) {
      res.setHeader("Content-Type", "image/png");
      res.send(data);
    } else {
      res.status(404);
      res.send("NOT FOUND");
    }
  });
});

app.get("/*", (req, res) => {
  res.status(404);
  res.send("Not Found");
});

app.listen(3002, "0.0.0.0", function() {
  console.log("3002 is running");
});
