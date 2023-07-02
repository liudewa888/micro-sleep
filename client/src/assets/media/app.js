const fs = require('fs')
const rs = fs.createReadStream('./bgm1.mp3')
let data = ''
  rs.on('data',chunk=>{    
      data += chunk
  })
  rs.on('end',()=>{
    const result = Buffer.from(data)
    console.log(result.slice(0,10));
  })
  rs.on('error',err=>{
      
  })