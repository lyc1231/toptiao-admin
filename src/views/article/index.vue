<template>
  <div>
    <!-- 筛选区域 -->
    <el-card class="search-card">
    <div slot="header" class="clearfix">
      <span>筛选条件</span>
    </div>
    <el-form ref="form" :model="filterParams" label-width="80px">
      <el-form-item label="状态">
        <el-radio-group v-model="filterParams.status">
          <el-radio label="">全部</el-radio>
          <!-- label中 index+空字符串 数字转字符串 解决索引为 0 布尔值是false的问题 -->
          <el-radio
          v-for="(item, index) in typestatus"
          :key="item.label"
          :label="index + ''"
          >{{ item.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="频道">
        <el-select v-model="filterParams.channel_id" placeholder="请选择活动区域">
          <el-option
          v-for="item in channels"
          :key="item.id"
          :label="item.name"
          :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="活动形式">
        <el-date-picker
          value-format="yyyy-MM-dd"
          v-model="begin_end_pubdate"
          @change="handleDateChange"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button
        type="primary"
        :loading="articleloading"
        @click="onSubmit">查询</el-button>
      </el-form-item>
    </el-form>
  </el-card>
    <!-- 筛选区域 -->

    <!-- 列表 -->
    <el-card class="list-card">
      <div slot="header" class="clearfix">
        <span>共找到<strong>{{ total }}</strong>条符合条件的内容</span>
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
          width="150">
          <template slot-scope="scope">
            <!-- 遍历当前项的索引当做状态码 -->
            <el-tag :type="typestatus[scope.row.status].type">{{ typestatus[scope.row.status].label }}</el-tag>
          </template>
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
            :current-page="page"
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
      total: 0, // 总数据的条数
      articleloading: false, // 文档中的 loading 效果 默认为 false
      page: 1, // 当前页码数
      typestatus: [ // 计算属性  查 vue 官方文档=>模板语法=>计算属性和侦听器
      // 本质是函数但只能当做属性来用
        {
          type: 'info',
          label: '草稿'
        },
        {
          type: '',
          label: '待审核'
        },
        {
          type: 'success',
          label: '审核通过'
        },
        {
          type: 'danger',
          label: '审核失败'
        },
        {
          type: 'warning',
          label: '已删除'
        }
      ],
      channels: [], // 频道列表
      filterParams: { // 文章查询条件参数
        status: '', // 文章状态
        channel_id: '', // 频道id
        begin_pubdate: '', // 开始时间
        end_pubdate: '' // 结束时间
      },
      begin_end_pubdate: [] // 存储日期选择器同步的 [开始时间，结束时间]，这个字段没啥用，只是日期选择器必须 v-mode 绑定一个数据才会触发 change 事件
    }
  },
  created () {
    this.loadArticles() // 加 token & 加载文章列表
    this.loadChannels() // 加载频道列表
  },
  methods: {

    // 查询筛选按钮
    onSubmit () {
      // this.loadArticles() // 查询筛选 重新加载页面
      this.page = 1 // 让分页组件的页码回到第1页
      this.loadArticles() // 加载第1页的数据
    },

    // 加载文章列表页
    loadArticles (page = 1) {
      this.articleloading = true
      const filterData = {}
      for (let key in this.filterParams) {
        if (this.filterParams[key]) {
          filterData[key] = this.filterParams[key]
        }
      }
      this.$http({
        method: 'GET',
        url: '/articles',
        params: { // 接口文档 获取文章列表中的 query 参数 设置页码和每页数量
          page, // 请求数据的页码，不传默认为 1
          per_page: 10, // 请求数据的每页大小，不传默认为 10
          ...filterData // 将对象混入当前对象，说白就是对象拷贝
        }
      }).then(data => {
        this.articles = data.results // 列表数据
        this.total = data.total_count // 数据的总条数
        this.articleloading = false
      })
    },

    // 页码的 change 事件
    handleCurrentChange (page) {
      this.page = page
      // 页码发生改变时，请求该页码对应的数据
      this.loadArticles(page)
    },

    // 文章列表的删除操作
    handleDelete (deleted) { // 被删除的那一项
      // this.$http({
      //   method: 'DELETE',
      //   url: `articles/${deleted.id}`
      // }).then(data => {
      //   console.log(data)
      //   // this.loadArticles(this.page)
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
    },

    // 筛选表单字段 接口文档获取文章频道
    loadChannels () {
      this.$http({
        method: 'GET',
        url: '/channels'
      }).then(data => {
        this.channels = data.channels
      })
    },

    // 日期选择器的 change 事件   element-ui 中的 datetime-picker
    handleDateChange (value) {
      // console.log(value)
      this.filterParams.begin_pubdate = value[0]
      this.filterParams.end_pubdate = value[1]
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
