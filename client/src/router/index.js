import { createRouter, createWebHashHistory } from 'vue-router'

import Menu from '../view/Menu.vue' //首页菜单
import Catalog from '../view/Catalog.vue' //目录
import Play from '../view/Play.vue' //播放页面

const routes = [
  { path: '/', component: Menu ,name:'/'},
  { path: '/catalog', component: Catalog ,name:"catalog"},
  { path: '/play', component: Play ,name:'play'},
]

const router = createRouter({
  history: createWebHashHistory(),
  routes, 
})

export default router