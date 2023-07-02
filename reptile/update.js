const fs = require("fs").promises
const crypto = require("crypto");
const mysql = require('./resource/js/mysql.js')
const sql = new mysql()

const Reptile = require('./resource/js/reptile.js')
const reptile = new Reptile()

const filePath =
  "E:\\project-2021\\reptile-listen-book\\media";

const bookPath="E:\\project-2021\\reptile-listen-book\\resource\\js"

const salt = "aa"; //MD5盐
//获取中间文本
function getCenterText(str,f,b){
  const i = str.indexOf(f)+f.length-1
  if(str.indexOf(f)<0)return'';
  const j = str.indexOf(b,i)
  if(j<0)return'';
  return str.substring(i+1,j)
}

//文件名加密
function MD5(i) {
  const md5 = crypto.createHash("md5");
  const str = md5.update(i + salt).digest("hex");
  return str.slice(0, 15);
}

//读取文件
async function readFile(path){
  return  fs.readFile(path,'utf-8')
}


//改变思路,使用映射
async function mapping(path){
  let data = await readFile(path)
  data = JSON.parse(data)
  data.forEach((item,index)=>{
    if(index==0){
      const link = MD5(item.number+''+item.id); //爬虫历史问题,暂用relevance
      const audioLink = item.link
      const j = audioLink.lastIndexOf('.')
      const ext = audioLink.slice(j+1)
      // let str = `UPDATE content SET link='${link}',audioLink='${audioLink}' where number=${item.number} and section=${item.id}`
      // sql.query(str)
  
        let str = `INSERT INTO content (number,section,link,ext,audioLink) VALUES (${item.number},${item.id},'${link}','${ext}','${audioLink}')`
        sql.query(str)
        downAudio(item)
    }
  })
}
//下载音频1
async function downAudio(item){
  const path =filePath +`/${item.number}`
      if(item.link){
          const link = item.link
          const j = link.lastIndexOf('.')
          const ext = link.slice(j+1)
          console.log(path,'path');
          reptile.download(path,link,item.id,ext)
      }
}

//标题 写入book表
async function writeBook(number) {
  const url = `https://ting55.com/book/${number}`
  const body = await reptile.send(url)
  const content =await reptile.getInfo(body,number)
  writeImage(content.picLink,number)
  content.typeId = 5
  const imgLink = MD5(number)
  let str = `INSERT INTO book (number,name,type,typeId,author,broadcast,upTime,state,total,content,description,picName,picLink,imgLink) VALUES ('${content.number}','${content.name}','${content.type}','${content.typeId}','${content.author}','${content.broadcast}','${content.upTime}','${content.state}','${content.total}','${content.content}','${content.desc}','${content.picName}','${content.picLink}','${imgLink}')`
  sql.query(str)
}
async function main() {
  const number =6664
  // writeBook(number)
  mapping(bookPath + `/${number}.json`)
}
main();
async function foo() {
  let str = 'select content from book where number=31751'
  let result = await sql.query(str)
  result = JSON.parse(result[0].content)
  result.forEach((item,index)=>{
    item.id = index+1
    item.number=31751
    const ext = 'm4a'
    const link = MD5(item.number+''+item.id).slice(0,15);
    let str = `INSERT INTO content (number,section,link,ext) VALUES (${item.number},${item.id},'${link}','${ext}')`
    sql.query(str)
  })



}


async function writeImage(link,number) {
  const path =filePath + `/${number}`
  if(!link.includes('http')){
    link = 'http:'+link
  }
  reptile.download(path,link,number,'png')
}

