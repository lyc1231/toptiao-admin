<template>
  <el-container>
    <el-aside width="200px">
      <Appaside/>
    </el-aside>
    <el-container>
      <el-header>
        <Appheader/>>
      </el-header>
      <el-main>Main</el-main>
    </el-container>
  </el-container>

</template>

<script>
import Appaside from './components/aside'
import Appheader from './components/header'
export default {
  name: 'AppLayout',
  components: {
    Appaside,
    Appheader
  },
  data () {
    return {}
  }
}
</script>

<style scoped>
.el-container {
  height: 100%;
}

.el-aside {
  background: #ccc;
}

.el-header {
  background: pink;
}

.el-main {
  background: orange;
}
</style>
