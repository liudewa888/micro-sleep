const fs = require('fs').promises
const request = require('request')
const cheerio = require('cheerio')

let cookie1 ='',cookie2='',cookie=''

const filePath = 'E:\\project-2021\\reptile-listen-book\\resource\\book'


const list =[
    {
        number: 14943,
        total:86,
        errorNum: 0
    },
    {
        number: 6388,
        total:137,
        errorNum: 0
    },
    {
        number: 4912,
        total:84,
        errorNum: 0
    },
    {
        number: 2228,
        total:32,
        errorNum: 0
    },
    {
        number: 1506,
        total:59,
        errorNum: 0
    }
]
// 延时函数
const sleep =function (t=1000) {
    const p = new Promise((resolve) => {
        setTimeout(resolve, t);
    })
    return p
}

//随机数
function rand(min,max){
    return Math.floor(Math.random()*(max-min) +min)
}
//现行日期
function time(){
    const t = new Date();
    const [y, M, d, h, m, s] = [
      t.getFullYear(),
      t.getMonth() + 1,
      t.getDate(),
      t.getHours() < 10 ? "0" + t.getHours() : t.getHours(),
      t.getMinutes() < 10 ? "0" + t.getMinutes() : t.getMinutes(),
      t.getSeconds() < 10 ? "0" + t.getSeconds() : t.getSeconds()
    ];
    const time = y + "-" + M + "-" + d + " " + h + ":" + m + ":" + s;
    return time
}


function writeFile(path,data){
    data = JSON.stringify(data,null,4)
    return fs.writeFile(path,data,'utf-8')
}

async function readFile(path){
    try {
       await fs.access(path)
    } catch (error) {
        await  writeFile(path,[])
    }
  return  fs.readFile(path,'utf-8')
}

 async function getAudioLink(number,id){
   const body = await send(`https://m.ting55.com/book/${number}-${id}`)
   const $ = cheerio.load(body)
   const _c = $('head > meta:nth-child(5)')
   const xt = _c.attr('content')
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
           Host: 'm.ting55.com',
           'X-Requested-With': 'XMLHttpRequest',
           Origin: 'https://m.ting55.com',
           Referer: `https://m.ting55.com/book/${number}-${id}`,
           Cookie: cookie1+'; t55hm=1;'+cookie2
       }
   }
   cookie = options.headers.Cookie
//    console.log(options.headers.Cookie);
   const p = new Promise(function(resolve,reject){
       request(options, function(err, rsp, body) {
           if(rsp.headers['set-cookie']){
                cookie2 = rsp.headers['set-cookie'][0].split(';')[0]
           }
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
 async function main(){
   for(let item of list){
        await sleep(1000*rand(1,10))
        const number= item.number
        const total = item.total
        let info = await readFile(filePath + `/${number}.json`)
        info = JSON.parse(info)
        const len = info.length+1
        if(len-1 === item.total){
            continue
        }
        for(let i = len ;i<=total;i++){
           const body = await getAudioLink(number,i)
           console.log(body,number,time(),i);
           const content ={
               id:i,
               number: number,
               link: JSON.parse(body).ourl || JSON.parse(body).url
           }
             if(!content.link){
                 console.log('over', cookie)
                 cookie2=''
                 break
             };
             info.push(content)
             writeFile(filePath + `/${number}.json`,info)
             break
        }
   }
}
 //请求网页
 function send(url) {
    const options = {
        url: url,
        encoding: null,
        headers: {
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.164 Safari/537.36'

        }
    }
    const p = new Promise((resolve, reject) => {
        request(options, function(err, rsp, body) {
            // console.log(rsp.headers['set-cookie'][0].split(';')[0],'rsp')
            if(rsp.headers['set-cookie']){
            cookie1 =rsp.headers['set-cookie'][0].split(';')[0]
            }
            if (!err && rsp.statusCode == 200) {
                resolve(body)
            } else {
                reject(err)
            }
        })
    })
    return p
}

main()
setInterval(main,1000*60*3)

