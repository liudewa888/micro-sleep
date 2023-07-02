<template>
  <div id="app">
    <Header></Header>
    <router-view class="main"></router-view>
    <Footer></Footer>
  </div>
</template>
<script setup>
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
</script>

<style scoped>
#app {
 .main {
  min-height: 80vh;
 }
}
</style>
