<template>
  <div>
    <!-- 筛选区域 -->
    <el-card class="search-card">
    <div slot="header" class="clearfix">
      <span>筛选条件</span>
    </div>
    <el-form ref="form" :model="form" label-width="80px">
      <el-form-item label="特殊资源">
        <el-radio-group v-model="form.resource">
          <el-radio label="线上品牌商赞助"></el-radio>
          <el-radio label="线下场地免费"></el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="活动区域">
        <el-select v-model="form.region" placeholder="请选择活动区域">
          <el-option label="区域一" value="shanghai"></el-option>
          <el-option label="区域二" value="beijing"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="活动形式">
        <el-date-picker
          v-model="form.value1"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">查询</el-button>
      </el-form-item>
    </el-form>
  </el-card>
    <!-- 筛选区域 -->

    <!-- 列表 -->
    <el-card class="list-card">
      <div slot="header" class="clearfix">
        <span>共找到15条符合条件的内容</span>
      </div>
      <!--
        table 表格组件中
        :data 后台数据
        prop  数据中要显示的属性
       -->
      <el-table
        class="list-table"
        :data="articles"
        style="width: 100%"
        v-loading="articleloading">
        <el-table-column
          prop="cover.images[0]"
          label="封面"
          width="60">
          <!-- 表格列默认只能输出文本  自定义需要下面这样 -->
          <!--
            slot-scope 是插槽作用域，现在先听个名词，你要知道的是值 scope 是起的一个名字
            scope 中有个成员叫 row
            也就是说 scope.row 就是当前的遍历项对象
            自定义列模板，el-table-column 的 prop 就没有意义了
          -->
          <template slot-scope="scope">
            <img width="30" :src="scope.row.cover.images[0]">
          </template>
        </el-table-column>
        <el-table-column
          prop="title"
          label="标题"
          width="400">
        </el-table-column>
        <el-table-column
          prop="pubdate"
          label="发布日期"
          width="400">
        </el-table-column>
        <el-table-column
          prop="status"
          label="状态"
          width="60">
        </el-table-column>
        <el-table-column
          label="编辑&删除"
          width="200">
          <template slot-scope="scope">
            <el-button
            type="primary"
            icon="el-icon-edit"
            circle plain></el-button>
            <el-button
            type="danger"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            circle plain></el-button>
          </template>
        </el-table-column>
      </el-table>
        <!-- 数据分页 -->
        <!--
          element-ui pagination 组件中的自定义方法
          current-change 返回当前的页码
         -->
          <el-pagination
            background
            layout="prev, pager, next"
            :total="total"
            :disabled="articleloading"
            @current-change="handleCurrentChange">
          </el-pagination>
        <!-- /数据分页 -->
   </el-card>
    <!-- 列表 -->
  </div>
</template>

<script>
// const userInfo = JSON.parse(window.localStorage.getItem('user_info'))
export default {
  name: 'ArticleList',
  data () {
    return {
      articles: [], // 后台给的列表数据
      form: {
        articles: '',
        region: '',
        date1: '',
        date2: '',
        delivery: false,
        type: [],
        resource: '',
        desc: '',
        value1: ''
      },
      total: 0,
      articleloading: false,
      page: 1
    }
  },
  created () {
    this.getToken()
  },
  methods: {
    onSubmit () {
      console.log('submit!')
    },
    getToken (page = 1) {
      this.articleloading = true
      this.$http({
        method: 'GET',
        url: '/articles',
        params: { // 接口文档 获取文章列表中的 query 参数 设置页码和每页数量
          page, // 请求数据的页码，不传默认为 1
          per_page: 10// 请求数据的每页大小，不传默认为 10
        }
      }).then(data => {
        this.articles = data.results // 列表数据
        this.total = data.total_count // 数据的总条数
        this.articleloading = false
      })
    },
    handleCurrentChange (page) {
      this.page = page
      // 页码发生改变时，请求该页码对应的数据
      this.getToken(page)
    },
    handleDelete (deleted) { // 被删除的那一项
      // this.$http({
      //   method: 'DELETE',
      //   url: `articles/${deleted.id}`
      // }).then(data => {
      //   console.log(data)
      //   // this.getToken(this.page)
      // })
      this.$confirm('确认删除吗？', '删除提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => { // 确定执行
        // 发送删除请求
        this.$http({
          method: 'DELETE',
          url: `/articles/${deleted.id}`
        }).then(data => {
          // 提示删除成功
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          // 重新加载数据列表
          this.loadArticles(this.page)
        })
      }).catch(() => { // 取消执行
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  }
}
</script>

<style  scoped>
.search-card {
  margin-bottom: 20px;
}
.list-table {
  margin-bottom: 30px;
}
</style>
