<template>
  <div>
    <main>
      <h2>精品推荐</h2>
      <nav>
        <ul>
          <li @click="childClick(item)" v-for="item in list">
            <ul class="item">
              <li>
                <img :src="ImgBaseLink + item.number + '/' + item.imgLink" :alt="item.pickName" />
              </li>
              <li>
                <h2>{{ item.name }}</h2>
                <p>作者: {{ item.author }}</p>
                <p>播音: {{ item.broadcast }}</p>
                <p>类型: {{ item.type }}</p>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
      <el-pagination background layout="prev, pager, next" :total="total" :page-size="4" :pager-count="5"
        :current-page="crurentPage" @current-change="currentChange">
      </el-pagination>
    </main>
  </div>
</template>
<script>
export default {
  data() {
    return {
      list: {},
      typeId: 0,
      pageIndex: 1,
      total: 0,
      crurentPage: 1,
    };
  },
  methods: {
    childClick(item) {
      this.$router.push({
        name: "catalog",
        query: {
          number: item.number,
        },
      });
    },
    // 获取书单
    getListInfo() {
      this.request
        .post("/list", {
          typeId: this.typeId,
          pageIndex: this.pageIndex,
        })
        .then((res) => {
          const { data } = res;
          this.list = data.result;
          this.total = data.total;
        });
    },
    //分布组件-当前页面点击事件回调
    currentChange(i) {
      this.pageIndex = i;
      this.crurentPage = i;
      this.getListInfo();
    },
  },
  watch: {
    '$route.query.type'(n, o) {
      this.typeId = n
      this.getListInfo();
    }
  },
  created() {
    this.typeId = this.$route.query.type || 0;
    this.getListInfo();
  },
  mounted() {
  },
  destroyed() {
  },
};
</script>
<style lang="less" scoped>
nav {
  &>ul {
    &>li {
      height: 130px;
      overflow: hidden;
      box-sizing: border-box;
      padding-bottom: 4px;
      margin-bottom: 4px;
      border-bottom: 1px solid rgba(32, 32, 32, 0.2);
    }
  }

  .item {
    display: flex;

    &>li {
      margin-right: 8px;

      &>img {
        width: 100px;
        height: 130px;
      }

      &>p {
        font-size: 14px;
      }
    }

    &>li:nth-child(2) {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
  }
}
</style>