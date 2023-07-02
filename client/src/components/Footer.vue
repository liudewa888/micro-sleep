<template>
  <div class="footer">
    <span>{{ ad }}</span>
  </div>
</template>
<script>
export default {
  data() {
    return {
      ad: '推荐chrome、safari浏览器,祝您收听愉快！'
    }
  },
  methods: {

  }
}
</script>
<style lang="less" scoped>
.footer {
  width: 100%;
  height: 40px;
  background-color: #909399;
  text-align: center;
  line-height: 40px;
  margin-top: 8px;

  &>span {
    color: #f3c140;
  }

}
</style>