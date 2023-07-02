<template>
  <div>
    <main>
      <section>
        <ul>
          <li>
            <img :src="imgLink" :alt="list.picName">
          </li>
          <li>
            <p>{{ list.name }}</p>
            <span>类型: {{ list.type }}</span>
            <span>作者: {{ list.author }}</span>
            <span>播音: {{ list.broadcast }}</span>
            <span>时间: {{ list.upTime }}</span>
            <span>状态: {{ list.state == 1 ? '完结' : '未完结' }}</span>
          </li>
        </ul>
      </section>
      <article>
        <p>
          {{ list.description }}
        </p>
      </article>
      <section>
        <h2>分集收听</h2>
        <nav class="catalog">
          <ul>
            <li>
              <el-tag @click="elTagClick(index)" size="medium" effect="dark" v-for="index in list.total"
                :key="index">{{ index }}</el-tag>
            </li>
          </ul>
        </nav>
      </section>
    </main>
  </div>
</template>
<script>
export default {
  data() {
    return {
      list: {},
      number: '',
      picName: '',
      imgLink: ''
    }
  },

  methods: {
    //获取目录详情
    getCatalog() {
      this.request.post('catalog', { number: this.number })
        .then(res => {
          const { data } = res
          this.list = data.result[0]
          //ImgBaseLink 全局图片服务器地址
          this.imgLink = this.ImgBaseLink + this.number + '/' + this.list.imgLink
        })
    },
    //点击集数跳转
    elTagClick(i) {
      this.$router.push({
        name: 'play',
        query: { number: this.number, id: i }
      })
    }
  },
  created() {
    const query = this.$route.query
    this.number = query.number
    this.getCatalog()
  }


}
</script>
<style lang="less" scoped>
header {
  height: 60px;
  background-color: #909399;
  box-sizing: border-box;
  padding-top: 3px;

  &>ul {
    display: flex;
    justify-content: space-around;
    align-items: center;

    &>li {
      font-size: 16px;
      color: #fff;
    }
  }
}


section {
  margin: 10px 0;

  &>ul {
    height: 100%;
    // background-color: #bfa;
    display: flex;
    justify-content: flex-start;
    align-items: center;

    &>li:nth-child(1) {
      margin-right: 20px;

      &>img {
        width: 100px;
        height: 130px;
      }
    }

    &>li:nth-child(2) {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
    }
  }
}


article {
  &>p {
    font-size: 14px;
  }
}

.catalog {
  &>ul {
    display: flex;
    flex-direction: column;

    li {
      margin-top: 8px;
      display: flex;
      justify-content: flex-start;
      flex-wrap: wrap;

      .el-tag--medium {
        width: 18%;
        text-align: center;
        margin-bottom: 10px;
        margin-right: 5px;
      }
    }
  }
}
</style>