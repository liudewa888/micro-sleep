const mysql = require('./resource/js/mysql.js')
const Reptile = require('./resource/js/reptile.js')
const reptile = new Reptile()
const sql = new mysql()


// 插入book表 完整sql
// const STR = `INSERT INTO book (number,name,type,typeId,author,broadcast,upTime,state,total,content,description,picName,picLink) VALUES ('${content.number}','${content.bookName}','${content.type}','${content.typeId}','${content.author}','${content.broadcast}','${content.upTime}','${content.state}','${content.total}','${content.content}','${content.desc}','${content.picName}','${content.picLink}')`


//获取中间文本
function getCenterText(str,f,b){
    const i = str.indexOf(f)+f.length-1
    const j = str.indexOf(b,i)
    return str.substring(i+1,j)
}


// 延时函数
function sleep(t) {
    const p = new Promise((resolve) => {
        setTimeout(resolve, t);
    })
    return p
}

// 分类获取书名
async function main(id) {
    const url = `https://www.56tingshu.com/list/5-${id}.html`
    const body = await reptile.send(url)
    if (body) {
        const contentList = reptile.getStyleBook(body)
        contentList.forEach(item=>{
            let content = item
            let str = `INSERT INTO book (number,name,type,typeId,author,broadcast,upTime,state,total,content,description,picName,picLink) VALUES ('${content.number}','${content.bookName}','${content.type}','${content.typeId}','${content.author}','${content.broadcast}','${content.upTime}','${content.state}','${content.total}','${content.content}','${content.desc}','${content.picName}','${content.picLink}')`
            sql.query(str)
        })
    }
}

//获取书籍详情
async function detail(){
    let str = 'select number from book'
    const result = await sql.query(str)
    result.forEach(async item=>{
        let number = item.number
        const url = `https://www.56tingshu.com/show/${number}.html`
        const body = await reptile.send(url)
        if (body) {
            const content = reptile.parseText(body)
            str = `UPDATE book SET upTime='${content.upTime}',state='${content.state}',total='${content.total}',content='${content.content}',description='${content.desc}',picLink='${content.picLink}' where number='${number}'`
            sql.query(str)
        }
    })

   
    console.log('end',999);
    // return
    // let number = 7150
    // const url = `https://www.56tingshu.com/show/${number}.html`
    // const body = await reptile.send(url)
    // if (body) {
    //    const content = reptile.parseText(body)
    //     str = `UPDATE book SET upTime='${content.upTime}',state='${content.state}',total='${content.total}',content='${content.content}',description='${content.desc}',picLink='${content.picLink}' where number='${number}'`
    //     // // let str = `INSERT INTO book (number,name,type,typeId,author,broadcast,upTime,state,total,content,description,picName,picLink) VALUES ('${content.number}','${content.bookName}','${content.type}','${content.typeId}','${content.author}','${content.broadcast}','${content.upTime}','${content.state}','${content.total}','${content.content}','${content.desc}','${content.picName}','${content.picLink}')`
    //     sql.query(str)
    //     // contentList.forEach(item=>{
    //     //     let content = item
    //     //     let str = `INSERT INTO book (number,name,type,typeId,author,broadcast,upTime,state,total,content,description,picName,picLink) VALUES ('${content.number}','${content.bookName}','${content.type}','${content.typeId}','${content.author}','${content.broadcast}','${content.upTime}','${content.state}','${content.total}','${content.content}','${content.desc}','${content.picName}','${content.picLink}')`
    //     //     sql.query(str)
    //     // })
    // }
}

async function query() {
    let str = `select * from book`
    let data = await sql.query(str)
    const item =  data[0]
    const relevance = item.number //父id
    const baseUrl = 'https://www.56tingshu.com' 
    let content = {}
    let data1 = JSON.parse(item.content)
    data1.forEach((item1,index)=>{
        content={
            number:index,
            relevance,
            name:item1.title,
            section: index,
            reptileLink: baseUrl+item1.href
        }
        let str = `INSERT INTO content (number,relevance,name,section,reptileLink) VALUES ('${content.number}','${content.relevance}','${content.name}','${content.section}','${content.reptileLink}')`
        sql.query(str)
    })

}
async function down(){
    let str = 'select reptileLink from content'
    const data = await sql.query(str)
    data.forEach(async (item,index)=>{
        let link =await reptile.getM4ALink(item.reptileLink)
        link =getCenterText(link,'http','m4a')
        link = 'http'+link+'m4a'
        link = decodeURIComponent(link)
        let str = `UPDATE content SET audioLink='${link}' where reptileLink='${item.reptileLink}'`
        sql.query(str)
    })
    console.log('end');
}
async function downAudio(){
    const number =14924
    const path =`E:/project-2021/reptile-listen-book/media/${number}`
    let str = `select number,audioLink from content where relevance=${number}`
    const data = await sql.query(str)
    data.forEach((item,index)=>{
        if(item.audioLink){
            const link = item.audioLink
            const j = link.lastIndexOf('.')
            const ext = link.slice(i+1)
            reptile.download(path,link,item.number,ext)
        }
    })

}
// ting55
async function ting55() {
    const number= 14738
    const url = `https://ting55.com/book/${number}`
    const body = await reptile.send(url)
    const content =await reptile.getInfo(body,number)
    content.typeId = 5
    let str = `INSERT INTO book (number,name,type,typeId,author,broadcast,upTime,state,total,content,description,picName,picLink) VALUES ('${content.number}','${content.name}','${content.type}','${content.typeId}','${content.author}','${content.broadcast}','${content.upTime}','${content.state}','${content.total}','${content.content}','${content.desc}','${content.picName}','${content.picLink}')`
    sql.query(str)
}


async function main1() {
    ting55()
}

main1()




process.on('SIGINT', function(e) {
    console.log(e,'e');
    sql.close()
    process.exit()
});