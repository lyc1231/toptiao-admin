<template>
  <!--
    el-menu
      default-active 指定默认激活的菜单项
      @open、@close 展示和收起菜单项的时候会触发
      background-color 设置菜单栏的背景色
      text-color 设置菜单栏文本颜色
      active-text-color 设置激活时候的高亮颜色
      router 是否使用 vue-router 的模式，启用该模式会在激活导航时以 index 作为 path 进行路由跳转
    el-submenu
      index 导航标识，可以用作路由导航路径，必须唯一
   -->
  <el-menu
    default-active="/"
    @open="handleOpen"
    @close="handleClose"
    router
    background-color=powderblue
    text-color="#000"
    active-text-color="#ffd04b">
    <el-menu-item index="2">
      <i class="iconfont icon-home"></i>
      <span slot="title">首页</span>
    </el-menu-item>
    <el-submenu index="1">
      <template slot="title">
        <i class="el-icon-circle-check"></i>
        <span>内容</span>
      </template>
      <el-menu-item index="/publish">
        <i class="iconfont icon-edit"></i>
        <span slot="title">发布</span>
      </el-menu-item>
      <el-menu-item index="/article">
        <i class="iconfont icon-icon-articles"></i>
        <span slot="title">内容列表</span>
      </el-menu-item>
      <el-menu-item index="/comment">
        <i class="iconfont icon-comment"></i>
        <span slot="title">评论</span>
      </el-menu-item>
      <el-menu-item index="/image">
        <i class="iconfont icon-image"></i>
        <span slot="title">素材</span>
      </el-menu-item>
      <el-menu-item index="/fans">
        <i class="iconfont icon-fensi"></i>
        <span slot="title">粉丝</span>
      </el-menu-item>
      <el-menu-item index="/account">
        <i class="iconfont icon-account"></i>
        <span slot="title">账户</span>
      </el-menu-item>
    </el-submenu>
    <el-menu-item index="4">
      <i class="el-icon-s-custom"></i>
      <span slot="title">账户设置</span>
    </el-menu-item>
  </el-menu>
</template>

<script>
export default {
  name: 'Appaside',
  data () {
    return {}
  },
  methods: {
    handleOpen (key, keyPath) {
      console.log(key, keyPath)
    },
    handleClose (key, keyPath) {
      console.log(key, keyPath)
    }
  }
}
</script>

<style scoped>
.el-menu {
  height: 100%;
}
.iconfont {
  margin-right: 10px;
}
</style>
