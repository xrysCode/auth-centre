<template>
  <el-button type="primary" plain @click="openDialog(true)">新 增</el-button>

  <el-table :data="pageData.tableData" current-row-key="id" style="width: 100%">
    <el-table-column v-for="(value, name) in tableColumn"
      :key="name" :prop="name" :label="value.label"  >
        <template #default="scope">
          <spen v-if="name!='headUrl'">{{scope.row[name]}}</spen>
            <el-avatar v-else :size="50" :src="scope.row.headUrl"></el-avatar>
        </template>
      </el-table-column>
  </el-table>
  <el-pagination
    v-model:page-size="pageData.size"
    v-model:current-page="pageData.current"
    :total="pageData.total"
    :pager-count="11"
    layout='sizes ,prev, pager, next, jumper, ->, total'
    @size-change="pageChange('size-change')"
    @current-change="pageChange('current-change')"
    @prev-click="pageChange('prev-click')"
    @next-click="pageChange('next-click')"
  >
  </el-pagination>

</template>

<script lang="ts">
export default {
  props: {
    // tableColumn: Object,
    tableUrl: String
  },
  data () {
    return {
      tableColumn: {
        id: { label: '主键', edit: true },
        nickname: { label: '昵称', edit: true },
        headUrl: { label: '头像', edit: true },
        sex: { label: '性别', edit: true }
      },
      pageData: {
        current: 1,
        size: 10,
        total: 0,
        search: {},
        tableData: [
        ]
      }
    }
  },
  created () {
    this.refreshData()
  },
  methods: {
    refreshData () {
      // debugger
      this.axios.get('/other/user-info', {
        params: {
          current: this.pageData.current,
          size: this.pageData.size,
          ...this.pageData.search
        }
      }).then(data => {
        this.pageData.total = data.total
        this.pageData.tableData = data.records
      })
    },
    pageChange (pageType) {
      switch (pageType) {
        case 'page-size':// 改变时会触发 每页条数
          break
        case 'current-change':// currentPage 改变时会触发
          break
        case 'prev-click':// 用户点击上一页按钮改变当前页后触发 当前页
          this.pageData.current = this.current - 1
          break
        case 'next-click'://
          this.pageData.current = this.current + 1
          break
      }
      this.refreshData()
    }

  }
}
</script>

<style>

</style>
