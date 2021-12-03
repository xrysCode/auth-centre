<template>
  <el-button type="primary" plain @click="openDialog(true)">新 增</el-button>

  <el-table :data="pageData.tableData" current-row-key="id" style="width: 100%">
    <el-table-column v-for="(value, name) in tableColumn"
      :key="name" :prop="name" :label="value.label" v-show="value.show" />

    <el-table-column fixed="right" label="操作" width="200">
      <template #default="rowInfo">
        <el-button type="text" size="small" @click="openDialog(false,rowInfo.row)">编 辑</el-button>
        <el-button type="text" size="small" @click="deleteRow(rowInfo.row)">删 除</el-button>
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

  <el-dialog v-model="dialogData.dialogVisible" :title="dialogTitle" width="30%" center>
    <el-form
      label-position="right"
      label-width="80px"
      :model="dialogData"
      :rules="dialogData.rules"
    >
     <el-form-item v-for="(value, name) in tableColumn" v-show="value.edit" :key="name" :prop="name" :label="value.label">
        <el-input v-if="value.edit" v-model="editData[name]" :type="value.type"></el-input>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button  @click="dialogData.dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveData" >确 认</el-button >
      </span>
    </template>
  </el-dialog>

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
        serviceName: {
          label: '服务名',
          show: true,
          edit: true,
          rules: [
            {
              required: true,
              message: '服务名称必填',
              trigger: 'blur'
            }]
        },
        serviceDesc: { label: '描述', show: true, edit: true, type: 'textarea' },
        callBackUrl: { label: '回调地址', show: true, edit: true },
        appId: { label: '应用id', show: false, edit: true },
        appName: { label: '所属应用', show: true, edit: false },
        createUser: { label: '创建人', show: true },
        createTime: { label: '创建时间', show: true }
      },
      pageData: {
        current: 1,
        size: 10,
        total: 0,
        search: {},
        tableData: [
        ]
      },
      editData: {},
      dialogData: {
        isAdd: false,
        dialogVisible: false,
        rules: {}
      }
    }
  },
  computed: {
    dialogTitle () {
      return this.dialogData.isAdd ? '新 增' : '编 辑'
    }
  },
  created () {
    const tableColumn = this.tableColumn
    const rulesConvert = { }
    for (const key in tableColumn) {
      if (tableColumn[key].rules) {
        rulesConvert[key] = tableColumn[key].rules
      }
    }
    this.dialogData.rules = rulesConvert
    this.refreshData()
  },
  methods: {
    refreshData () {
      // debugger
      this.axios.get(this.$props.tableUrl, {
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
    },
    openDialog (isAdd, row) {
      const tableColumn = this.tableColumn
      for (const key in this.tableColumn) {
        if (tableColumn[key].edit === true) {
          if (isAdd) {
            this.editData[key] = null
          } else {
            this.editData[key] = row[key]
          }
        }
      }

      this.dialogData.isAdd = isAdd
      this.dialogData.dialogVisible = true
    },
    saveData () {
      let promise = null
      if (this.dialogData.isAdd) {
        promise = this.axios.post(this.$props.tableUrl, this.editData)
      } else {
        promise = this.axios.put(this.$props.tableUrl, this.editData)
      }
      promise.then(data => {
        this.dialogData.dialogVisible = false
        this.refreshData()
      })
    },
    deleteRow (row) {
      debugger
      this.axios.delete(this.$props.tableUrl, { data: [row.id] })
        .then(data => {
          this.dialogData.dialogVisible = false
          this.refreshData()
        })
    }
  }
}
</script>

<style>

</style>
