<template>
  <div>
    <div class="main">
      <div class="header">
        <el-tag>{{ list.bookName }}</el-tag>
        <p>
          <el-tag>{{ list.name || '第' + id + '集' }}</el-tag>
        </p>
      </div>
      <div class="countdown">
        <el-tag type="info">播放剩余: {{ countdownTxt }}</el-tag>
      </div>
      <div class="center">
        <audio id="audio" preload="auto" :src="this.list.link" @ended="ended" ref="audioRef" controls :loop="audioLoop"
          controlslist="nodownload" @error="audioError" @canplay="canPlay">
        </audio>
      </div>

      <div class="btn">
        <el-button type="success" size="small" @click="timingClick">定时</el-button>
        <el-button type="success" size="small" @click="speedClick">倍速</el-button>
        <el-button type="success" size="small" @click="previousSectionClick">上一章</el-button>
        <el-button type="success" size="small" @click="catalogClick">目录</el-button>
        <el-button type="success" size="small" @click="nextSectionClick">下一章</el-button>
      </div>
      <div class="radio-group" v-if="radioShow">
        <div class="radio" v-for="(item, index) in times" :keys="item.id" @click="selectClick(item.id)">
          <span>{{ item.txt }}</span>
          <p :class="{ 'success': timeIndex === item.id }"></p>
        </div>
        <div class="close">
          <el-button size="small" @click="radioClose">关闭</el-button>
        </div>
      </div>
      <div class="radio-group" v-if="speedShow">
        <div class="radio" v-for="(item, index) in speeds" :keys="index" @click="speedSelectClick(index)">
          <span>{{ item }}倍速度</span>
          <p :class="{ 'success': speedIndex === index }"></p>
        </div>
        <div class="close">
          <el-button size="small" @click="speedClose">关闭</el-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>

export default {
  data() {
    return {
      times: [
        {
          txt: '顺序播放',
          id: '0',
          sort: 0,
        },
        {
          txt: '40分钟',
          id: '7',
          sort: 1,
        },
        {
          txt: '1小时',
          id: '1',
          sort: 2,
        },
        {
          txt: '90分钟',
          id: '8',
          sort: 3,
        },
        {
          txt: '2小时',
          id: '2',
          sort: 4,
        },
        {
          txt: '播2集',
          id: '4',
          sort: 5,
        },
        {
          txt: '播5集',
          id: '3',
          sort: 6,
        },
        {
          txt: '单集循环',
          id: '5',
          sort: 7,
        },
        {
          txt: '播完当前',
          id: '6',
          sort: 8,
        },
      ],
      speeds: [1, 1.25, 1.5, 1.75, 2],
      timeIndex: 0,
      speedIndex: 0,
      radioShow: false,
      audioLoop: false,
      speedShow: false,
      id: 0,
      number: 0,
      list: {},
      playTwoFlag: false, // 播放两集标志
      countdownTxt: '未开启',
      playNum: -1,
      errorNum: 0
    }
  },
  methods: {
    countdown(countdownTime) {
      const startTime = parseInt(new Date().getTime() / 1000) + countdownTime * 60
      const intervalId = setInterval(update, 1000 * 10);
      const that = this
      function update() {
        const now = parseInt(new Date().getTime() / 1000);

        const remainTime = startTime - now;

        if (remainTime <= 0) {
          clearInterval(intervalId);
          that.$refs.audioRef.pause()
        } else {
          that.countdownTxt = `${Math.floor(remainTime / 60)}分${remainTime % 60}秒`;
        }
      }
    },
    //点击标签跳转到目录页面
    catalogClick() {
      this.$router.push({ name: 'catalog', query: { number: this.number } })
    },
    timingClick() {
      this.radioShow = true
    },
    selectClick(index) {
      this.timeIndex = index
      this.audioLoop = false
    },
    radioClose() {
      this.radioShow = false
      // 播40分钟
      if (this.timeIndex === '7') {
        this.countdown(40)
      }
      // 播1小时
      if (this.timeIndex === '1') {
        this.countdown(60)
      }
      // 90分钟
      if (this.timeIndex === '8') {
        this.countdown(90)
      }
      // 播2小时
      if (this.timeIndex === '2') {
        this.countdown(120)
      }

      // 播2集
      if (this.timeIndex === '4') {
        this.playNum = 2
        this.countdownTxt = this.playNum + '集'
      }
      // 播5集
      if (this.timeIndex === '3') {
        this.playNum = 5
        this.countdownTxt = this.playNum + '集'
      }
      // 单集循环
      if (this.timeIndex === '5') {
        this.audioLoop = true
      }
      // 播完当前
      if (this.timeIndex === '6') {
      }
    },
    ended() {
      this.audioLoop = false
      if (this.playNum > 0) {
        this.playNum -= 1
      }
      // 播 2 或 5 集
      if (this.timeIndex === '3' || this.timeIndex === '4') {
        console.log(this.playNum, 888);
        if (this.playNum === 0) {
          this.$refs.audioRef.pause()
          this.playNum = -1
          return
        } else {
          if (this.playNum === -1) {
            this.countdownTxt = '无效'
          } else {
            this.countdownTxt = this.playNum + '集'
          }
        }
      }

      // 播完当前
      if (this.timeIndex === '6') {
        this.$refs.audioRef.pause()
        return
      }

      // 顺序播放
      this.id += 1
      this.getSectionInfo()
    },
    speedClick() {
      this.speedShow = true
    },
    speedClose() {
      this.speedShow = false
    },
    speedSelectClick(index) {
      this.speedIndex = index
      this.$refs.audioRef.playbackRate = this.speeds[index]
    },
    //上一章点击回调
    previousSectionClick() {
      this.id -= 1
      if (this.id < 0) return;
      this.getSectionInfo()
    },
    //下一章点击回调
    nextSectionClick() {
      this.id += 1
      if (this.id > this.list.total) return;
      this.getSectionInfo()
    },
    // 获取播放每集信息
    getSectionInfo() {
      this.request.post('/section',
        {
          number: this.number,
          id: this.id
        },
        {
          headers: {
            Range: 'bytes=0-',
          }
        }
      ).then(res => {
        const { result } = res.data
        this.list = result[0]
        this.$nextTick(() => {
          this.$refs.audioRef.load()
          this.$router.replace({
            name: 'play',
            query: { number: this.number, id: this.id }
          })

        })
      })
    },
    audioError() {
      this.errorNum++
      if (this.errorNum > 8) {
        this.errorNum = -1
      } else if (this.errorNum > 3) {
        this.nextSectionClick()
      } else if (this.errorNum > 0) {
        this.getSectionInfo()
      }
    },
    canPlay() {
      this.errorNum = 0
      this.$refs.audioRef.play()
    }
  },
  created() {
    const query = this.$route.query
    this.number = query.number
    this.id = Number(query.id)
    this.times = this.times.sort((a, b) => a.sort - b.sort)
  },
  mounted() {
    this.getSectionInfo()
  }
}
</script>
<style lang="less" scoped>
@color: rgba(32, 32, 32, 0.5);
@success: #67C23A;

.m-mr-4 {
  margin-right: 4px;
}

.success {
  background-color: @success;
}


body {
  background-color: #f5f5f5;
}

.main {
  margin: 20px auto;
  display: flex;
  flex-direction: column;
  align-items: center;

  .header {
    margin: 10px 0;
    text-align: center;

    &>p {
      text-align: center;
      margin-top: 8px;
    }
  }

  .countdown {
    margin: 4px 0;
  }

  .center {
    margin: 10px 0 20px;
  }

  .radio-group {
    width: 100%;
    padding: 0 20px;

    .radio {
      height: 40px;
      line-height: 40px;
      border-bottom: 1px solid @color;
      display: flex;
      justify-content: space-between;
      align-items: center;

      &>P {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 1px solid @color;
      }
    }

    .close {
      text-align: center;
    }
  }
}
</style>