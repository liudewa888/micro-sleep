const mysql = require('mysql')

class sql {
    constructor() {
        this.db = this.init()
    }
    //初始化数据库操作
    init() {
            const connection = mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: 'root',
                database: 'listenbook'
            })
            connection.connect(function(err) {
                if (err) {
                    console.error(err)
                    return
                }
                console.log('connectionId: ' + connection.threadId)
            })
            return connection
        }
    //操作数据
    query(sql) {
        const p = new Promise((resolve,reject)=>{
            this.db.query(sql, (err, result) => {
                if (err) {
                    console.log('query err: ', err)
                    reject(err)
                    return
                }
                resolve(result)
            })
        })
        return p
    }
    // 关闭数据库
    close(){
        this.db.end()
    }
}

module.exports = sql