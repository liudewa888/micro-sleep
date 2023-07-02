<template>
  <header>
    <nav>
      <ul>
        <li>
          <span :class="activeIndex == index ? 'active' : ''" @click="menuClick(item)" v-for="(item, index) in list"
            :keys="index">{{ item.txt }}</span>
        </li>
      </ul>
    </nav>
  </header>
</template>
<script>
export default {
  data() {
    return {
      list: [
        {
          id: 0,
          txt: '首页'
        },
        {
          id: 1,
          txt: '历史'
        },
        {
          id: 2,
          txt: '相声'
        },
        {
          id: 3,
          txt: '雷雨'
        },
        {
          id: 4,
          txt: '课堂'
        },
        {
          id: 5,
          txt: '睡眠曲'
        },
        {
          id: 6,
          txt: '轻音乐'
        },
        {
          id: 7,
          txt: '动物'
        },
        {
          id: 8,
          txt: '脑波'
        },
        {
          id: 9,
          txt: '自然'
        }
      ],
      activeIndex: 0
    }
  },
  methods: {
    menuClick(item) {
      if(this.activeIndex === item.id && item.id) return;
      this.activeIndex = item.id
      this.$router.push({ name: '/', query: { type: item.id } })
    }
  }
}
</script>
<style lang="less">
header {
  height: 60px;
  background-color: #909399;
  box-sizing: border-box;
  padding-top: 3px;

  nav {
    &>ul {
      &>li {
        display: flex;
        justify-content: space-around;
        align-items: center;
        flex-wrap: wrap;

        &>span {
          font-size: 16px;
          color: #fff;
          width: 18%;
          text-align: center;
        }

        .active {
          background-color: #E18728;
          border-radius: 16px;
        }

      }
    }
  }
}
</style>