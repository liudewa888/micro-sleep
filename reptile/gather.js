//采集--喜马拉雅--音频信息

//信息地址: https://www.ximalaya.com/revision/album/v1/simple?albumId=13399342

const fs = require('fs')
const request = require('request')
const crypto = require("crypto");
const mysql = require('./resource/js/mysql.js')
const sql = new mysql()

// 音频地址
const filePath ='E:/project-2021/reptile-listen-book/media'

const salt = "aa"; //MD5盐
//文件名加密
function MD5(i) {
    const md5 = crypto.createHash("md5");
    const str = md5.update(i + salt).digest("hex");
    return str.slice(0, 15);
  }

//获取中间文本
function getCenterText(str,f,b){
    const i = str.indexOf(f)+f.length-1
    if(str.indexOf(f)<0)return'';
    const j = str.indexOf(b,i)
    if(j<0)return'';
    return str.substring(i+1,j)
  }

 //请求网页
 function send(url,flag=false) {
    const options = {
        url: url,
        encoding: null,
        headers: {
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Cache-Control': 'no-cache',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.164 Safari/537.36'
        }
    }
    const p = new Promise((resolve, reject) => {
        request(options, function(err, rsp, body) {
            if (!err && rsp.statusCode == 200) {
                if(flag){
                    resolve(body)
                    return
                }
                body = JSON.parse(body)
                resolve(body)
            } else {
                reject(err)
            }
        })
    })
    return p
}

//下载音频
async function download(filePath,link,name,ext){
    let data = await send(link,true)  
    const isExit = fs.existsSync(filePath)
    if(!isExit){
        await  fs.mkdir(filePath,function(err){
            console.log(err,'mkdir')
        })
    }
    fs.writeFile(filePath+`/1-${name}.${ext}`,data,function(err){
        console.log(err,'writeFile',name)
    })
}
//写入照片
async function writeImage(link,number) {
    const path =filePath + `/${number}`
    if(!link.includes('http')){
      link = 'https:'+link
    }
    download(path,link,number,'png')
}

//标题 写入book表
async function writeBook(number) {
    const url =`https://www.ximalaya.com/revision/album/v1/simple?albumId=${number}`
    const {data} = await send(url)
    const name= data.albumPageMainInfo.albumTitle
    const picLink = data.albumPageMainInfo.cover
    const upTime = data.albumPageMainInfo.updateDate
    const state = data.albumPageMainInfo.isFinished
    const url1 =`https://www.ximalaya.com/tdk-web/seo/search/albumInfo?albumId=${number}`
    const {data:data1} = await send(url1)
    const total = data1.trackCount
    const desc = data1.albumIntro
    const content = {
        number: Number(number), //书籍编号
        name, //书名
        type:'历史', //分类
        author:'百家讲坛', //作者
        broadcast: '易中天', //播音
        upTime, //更新时间
        state, //完结状态
        total: Number(total), //集数
        desc: desc, //简介
        picName:'', //图片名称
        picLink //图片链接
    }
    writeImage(content.picLink,number)
    content.typeId = 5 //5 历史
    const imgLink = MD5(number)
    let str = `INSERT INTO book (number,name,type,typeId,author,broadcast,upTime,state,total,content,description,picName,picLink,imgLink) VALUES ('${content.number}','${content.name}','${content.type}','${content.typeId}','${content.author}','${content.broadcast}','${content.upTime}','${content.state}','${content.total}','${content.content}','${content.desc}','${content.picName}','${content.picLink}','${imgLink}')`
    sql.query(str)

}

//修改音频文件名
function modifyFileName(number){
    const path =filePath + `/${number}`
    fs.readdir(path,function(err,data){
        data.forEach((item,index)=>{
            const j = item.lastIndexOf('.')
            const ext = item.slice(j+1)
            // let num =Number(item.split('_')[0])
            let num =getCenterText(item,'-','.')
            const newName =num +'-'+number
            fs.rename(path+'/'+item,path+'/'+newName+'.'+ext,function(err){
                if(!err){
                    console.log(newName);
                }else{
                    console.log(err);
                }
            })
        })
    })
}   

// 写入content 表
async function writeContent(number){
    let url=`https://www.ximalaya.com/revision/album/v1/getTracksList?albumId=${number}&pageNum=2&sort=0`
    let {data} = await send(url)
    const total = data.trackTotalCount
    const pageSize = data.pageSize
    const len = Math.ceil(pageSize / total) + 1
    for(let i=0;i<len;i++){
        url=`https://www.ximalaya.com/revision/album/v1/getTracksList?albumId=${number}&pageNum=${i+1}&sort=0`
        let {data} = await send(url)
        data.tracks.forEach(item=>{
            const  link =MD5(item.index+'-'+number)
            let str = `INSERT INTO content (number,section,link,name) VALUES (${number},${item.index},'${link}','${item.title}')`
            sql.query(str)
        })
    }
}


async function main(){
    const number =8365
    modifyFileName(number)
    // writeBook(number)
    // writeContent(number)
}

main()



