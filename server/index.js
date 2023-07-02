const mysql = require('./resource/js/mysql.js')
const sql = new mysql()
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const httpProxy = require('http-proxy')

const proxy = httpProxy.createProxyServer()

const baseUrl = 'api/video/' //跨域音频link baseurl
const baseUrlImage = 'image/' //跨域图片link
const proxyUrl = 'http://0.0.0.0:3002/'

app.use(express.static('./dist'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/catalog',async function (req,res) {
    const body = req.body
    let str=`select name,author,broadcast,type,typeId,picName,imgLink,total,description,state,upTime from Book where number=${body.number}`
    const data = await sql.query(str)
    const result = {
        status:'101', //101 成功 401 失败
        result:data
    }
    res.send(JSON.stringify(result))
})
//获取播放每集信息
app.post('/section',async function (req,res) {
    const body = req.body
    // let str=`select name,link from content where section=${body.id} and number=${body.number}`
    let str = `select book.name as bookName,book.total,content.link,content.name,content.ext from book,content where book.number=${body.number}&&content.number=${body.number}&&content.section=${body.id}`
    const data = await sql.query(str)
    data[0].link =baseUrl +body.number+'/' +data[0].link+'.'+(data[0].ext||'m4a')
    const result = {
        status:'101', //101 成功 401 失败
        result:data
    }

    res.send(JSON.stringify(result))
})
//获取书籍列表
app.post('/list',async function (req,res) {
    const {pageIndex,typeId} = req.body
    let str =`select count(*) from book`
    if(typeId != '0'){
        str =`select count(*) from book where typeId=${typeId}`
    }
    const total = await sql.query(str)
    str=`select name,number,author,broadcast,type,typeId,picName,imgLink from book limit ${4*(pageIndex-1)},4`
    if(typeId != '0'){
        str =`select name,number,author,broadcast,type,typeId,picName,imgLink from book where typeId=${typeId} limit ${4*(pageIndex-1)},4`
    }
    const data = await sql.query(str)
    const result = {
        status:'101', //101 成功 401 失败
        result:data,
        total: total[0]['count(*)']
    }
    res.send(JSON.stringify(result))
})

app.get('/video/*',function(req,res){
    proxy.web(req,res,{
        target: proxyUrl
    })
})
app.get('/image/*',function(req,res){
    proxy.web(req,res,{
        target: proxyUrl
    })
})

app.listen(3001, '0.0.0.0',function() {
    console.log("3001 is running");
});