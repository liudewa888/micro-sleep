
const common={
    //获取中间文本
    getCenterText:function (str,f,b){
    const i = str.indexOf(f)+f.length-1
    const j = str.indexOf(b,i)
    return str.substring(i+1,j)
    },


    // 延时函数
    sleep:function (t=1000) {
        const p = new Promise((resolve) => {
            setTimeout(resolve, t);
        })
        return p
    }
}

module.exports = common

