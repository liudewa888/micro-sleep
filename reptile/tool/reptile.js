const request = require('request')
const cheerio = require('cheerio')
const iconv = require('iconv-lite')
const fs =require('fs')
// const mysql = require('./mysql.js')
// const sql = new mysql()

const {sleep} = require('./common.js')

class Reptile {
    constructor(){
    }
    //获取中间文本
    static getCenterText(str,f,b){
        const i = str.indexOf(f)+f.length-1
        const j = str.indexOf(b,i)
        return str.substring(i+1,j)
    }
    //请求网页
    send(link,flag=false) {
            const options = {
                url: link,
                encoding: null,
                headers: {
                    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                    'Accept-Language': 'zh-CN,zh;q=0.9',
                    'Cache-Control': 'no-cache',
                    Connection: 'keep-alive',
                    Pragma: 'no-cache',
                    'Upgrade-Insecure-Requests': '1',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.164 Safari/537.36'

                }
            }
            const p = new Promise((resolve, reject) => {
                request(options, function(err, rsp, body) {
                    if (!err && rsp.statusCode == 200) {
                        if(flag){
                            resolve(rsp.body)
                        }
                        const html = iconv.decode(rsp.body, 'utf-8')
                        resolve(html)
                    } else {
                        reject(err)
                    }
                })
            })
            return p
    }
    //解析网页(书籍详情)
    static parseText(text) {
        const baseUrl = 'https://www.56tingshu.com'
        const $ = cheerio.load(text)
        // let  number =$('body > div:nth-child(5) > div > div.contentright > div:nth-child(1) > div > div > ul > li > p:nth-child(10) > a.btn-bao')
        //     number = number.attr('onclick').replace(/[^0-9]/ig,'')
        const img = $('body > div:nth-child(5) > div > div.contentright > div:nth-child(1) > div > div > ul > li > img')
        const imgLink = img.attr('src')
        // const imgName = img.attr('alt')
        // const name = $('body > div:nth-child(5) > div > div.contentright > div:nth-child(1) > div > div > ul > li > center > h1')
        // const bookName = imgName //书名
        // //播音
        // const broadcast = $('body > div:nth-child(5) > div > div.contentright > div:nth-child(1) > div > div > ul > li > p:nth-child(6)').text()
        //更新状态
        const state =$('body > div:nth-child(5) > div > div.contentright > div:nth-child(1) > div > div > ul > li > p:nth-child(8)').text()
        //更新时间
        const upTime = $('body > div:nth-child(5) > div > div.contentright > div:nth-child(1) > div > div > ul > li > p:nth-child(5)').text()
        // 书籍简介
        const desc = $('body > div:nth-child(5) > div > div.contentright > div.numlist.border.intro > ul > p').text()
        // 内容
        const content = $('.compress:last').find('li')
        const content1 =[] //内容储存
        let obj={}
        content.each((index,item)=>{
            const title = $(item).children('a').attr('title')
            let href = $(item).children('a').attr('href')
            href = this.getCenterText(href,'-0-','.h')
            obj={title,href}
            content1.push(obj)
        })

        const total = content1.length

        const data = {
            // number: Number(number), //书籍编号
            // bookName, //书名
            // type:'历史', //分类
            // author:broadcast, //作者
            // broadcast, //播音
            upTime, //更新时间
            state, //完结状态
            total: Number(total), //集数
            content: JSON.stringify(content1), //内容
            desc: desc, //简介
            // picName: imgName, //图片名称
            picLink: baseUrl + imgLink //图片链接
        }
        return data
    }

    //解析音频源网址
    static async getM4ALink(link){
        const body = await  reptile.send(link)
        const $ = cheerio.load(body)
        const txt = $('body > div:nth-child(6) > div.main > div.pleft > div.combox > div > script:nth-child(6)').html()
        return txt
    }

    //下载音频
    async download(filePath,link,name,ext){
        try {
            let data = await this.send(link,true)  
        } catch (error) {
            console.error('音频资源有错误,不能下载,请更换资源');
        }
       const isExit = fs.existsSync(filePath)
       if(!isExit){
            await  fs.mkdir(filePath,function(err){
                console.log(err,'mkdir')
            })
       }
        fs.writeFile(filePath+`/0-${name}.${ext}`,data,function(err){
            console.log(err,'writeFile',name)
        })
    }

    //下载音频 ting55.com


    //爬取目录 ting55.com
     async getInfo(text,number){
        const $ = cheerio.load(text)
        const img=$('#wrapper > div.content-wrap > div > div > div.bookinfo > div > div.bimg > img')
        const picName = img.attr('alt')
        const picLink = img.attr('src')
        const name = $('#wrapper > div.content-wrap > div > div > div.bookinfo > div > div.binfo > h1').text()
        const type=$('#wrapper > div.content-wrap > div > div > div.bookinfo > div > div.binfo > p:nth-child(2)').text()
        const author = $('#wrapper > div.content-wrap > div > div > div.bookinfo > div > div.binfo > p:nth-child(3)').text()
        const broadcast =$('#wrapper > div.content-wrap > div > div > div.bookinfo > div > div.binfo > p:nth-child(4)').text()
        const state=$('#wrapper > div.content-wrap > div > div > div.bookinfo > div > div.binfo > p:nth-child(5)').text()
        const upTime = $('#wrapper > div.content-wrap > div > div > div.bookinfo > div > div.binfo > p:nth-child(6)').text()
        const desc = $('#wrapper > div.content-wrap > div > div > div.intro > p').text()

        let  list = $('#wrapper > div.content-wrap > div > div > div.playlist > div > ul')
        list = list.find('li')
        const total = list.length
        const data = {
            number: Number(number), //书籍编号
            name, //书名
            type, //分类
            author, //作者
            broadcast, //播音
            upTime, //更新时间
            state, //完结状态
            total: Number(total), //集数
            // content: JSON.stringify(content1), //内容
            desc: desc, //简介
            picName, //图片名称
            picLink //图片链接
        }
        return data
    }

    static async getAudioLink(number,id){
         // const baseUrl= 'https://ting55.com/nlinka'
        const body = await this.send(`https://m.ting55.com/book/${number}-${id}`)
        const $ = cheerio.load(body)
        const _c = $('head > meta:nth-child(5)')
        const xt = _c.attr('content')
        console.log(xt,'xt')
        const baseUrl ='https://m.ting55.com/glink'
        const options = {
            url: baseUrl,
            method: 'POST',
            body: `bookId=${number}&isPay=0&page=${id}`,
            headers: {
                'User-Agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
                Accept: 'application/json, text/javascript, */*; q=0.01',
                'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                xt: xt,
                l: 1,
                'X-Requested-With': 'XMLHttpRequest',
                Origin: 'https://m.ting55.com',
                Connection: 'keep-alive',
                Referer: `https://m.ting55.com/book/${number}-${id}`
            }
        }
        const p = new Promise(function(resolve,reject){
            request(options, function(err, rsp, body) {
               if(err){
                   reject(err)
                   return
               }
               resolve(body)
            })
        })
        return p
    }

    //写入section ting55.com
    static async writeInfo(total = 45){
        const number=14924
        for(let i=9;i<=total;i++){
            sleep(2000)
           const body = await this.getAudioLink(number,i)
           console.log(body,i);
           const content ={
               number:i,
               relevance: number,
               name:'',
               section:i,
               audioLink: JSON.parse(body).ourl
           }
           if(!content.audioLink){
            console.log('over')
            break
        };
           let str = `INSERT INTO content (number,relevance,name,section,audioLink) VALUES ('${content.number}','${content.relevance}','${content.name}','${content.section}','${content.audioLink}')`
           sql.query(str)
        }

    }


    //按照分类获取书籍
    static  getStyleBook(text){
        const baseUrl = 'https://www.56tingshu.com'
        const $ = cheerio.load(text)
        const list = $('body > div:nth-child(5) > div.main > div.iright > div > div > div > ul > li')
        const result =[]
        list.each((index,item)=>{
            const   a =  $(item).find('a')
            const  name = a.attr('title') //书名
            let  number = a.attr('href')
            number = this.getCenterText(number,'w/','.') //书id
            const pic = $(item).find('a>img')
            const picName = pic.attr('alt')
            const picLink =baseUrl + pic.attr('src')
    
            let p = $(item).find('p:nth-child(3)')
            const author = p.text()
            p = $(item).find('p:nth-child(4)')
            const type = p.text().split('：')[1]
            const typeId = 5
            p = $(item).find('p:nth-child(5)')
            const broadcast = p.text()
            let data = {
                number: Number(number), //书籍编号
                bookName: name, //书名
                type, //分类
                typeId, //分类id
                author, //作者
                broadcast, //播音
                picName, //图片名称
                picLink //图片链接
            }
            result.push(data)
        })
        return result

    }






}

module.exports = Reptile