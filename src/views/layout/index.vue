<template>
  <div>
    <Appaside></Appaside>
    <Appheader></Appheader>
  </div>
</template>

<script>
import Appaside from './components/aside'
import Appheader from './components/header'

export default {
  name: 'AppLayout',
  components: { // 注册为组件的子组件
    Appaside,
    Appheader
  },
  data () {
    return {}
  }
}
</script>

<style lang="less"  scoped>

</style>
