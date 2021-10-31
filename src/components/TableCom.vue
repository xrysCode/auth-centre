<template>
  <el-button type="primary" plain @click="openDialog(true)">新 增</el-button>

  <el-table :data="tableData" current-row-key="id" style="width: 100%">
    <el-table-column fixed prop="serviceName" label="服务名" width="150" />
    <el-table-column prop="serviceDesc" label="描述" width="250" />
    <el-table-column prop="createUser" label="创建人" width="120" />
    <el-table-column prop="createTime" label="创建时间" width="150" />
    <el-table-column fixed="right" label="操作" width="200">
      <template #default="rowInfo">
        <el-button type="text" size="small" @click="openDialog(false,rowInfo.row)">编 辑</el-button>
        <el-button type="text" size="small" @click="deleteRow(rowInfo.row)">删 除</el-button>
      </template>
    </el-table-column>
  </el-table>

  <el-pagination
    v-model:page-size="size"
    v-model:current-page="current"
    :total="total"
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
      <el-form-item label="名 称" prop="serviceName">
        <el-input v-model="editData.serviceName"></el-input>
      </el-form-item>
      <el-form-item label="描 述">
        <el-input v-model="editData.serviceDesc" type="textarea"></el-input>
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

  },
  data () {
    return {
      current: 1,
      size: 10,
      total: 0,
      search: {},
      tableData: [
      ],
      editData: {
        id: null,
        serviceName: null,
        serviceDesc: null
      },
      dialogData: {
        isAdd: false,
        dialogVisible: false,
        rules: {
          serviceName: [
            {
              required: true,
              message: '服务名称必填',
              trigger: 'blur',
              validator: (rule, value, callback) => {
                // debugger
                if (!value) {
                  callback(new Error(rule.message))
                } else {
                  callback()
                }
              }
            }
          ]
        }
      }

    }
  },
  computed: {
    dialogTitle () {
      return this.dialogData.isAdd ? '新 增' : '编 辑'
    }
  },
  created () {
    this.refreshData()
  },
  methods: {
    refreshData () {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      // const _this = this
      // debugger
      this.axios.get('/base/service-info', {
        params: {
          current: this.current,
          size: this.size,
          ...this.search
        }
      }).then(data => {
        this.total = data.total
        this.tableData = data.records
      })
    },
    pageChange (pageType) {
      switch (pageType) {
        case 'page-size':// 改变时会触发 每页条数
          break
        case 'current-change':// currentPage 改变时会触发
          break
        case 'prev-click':// 用户点击上一页按钮改变当前页后触发 当前页
          this.current = this.current - 1
          break
        case 'next-click'://
          this.current = this.current + 1
          break
      }
      this.refreshData()
    },
    openDialog (isAdd, row) {
      if (isAdd) {
        this.editData.id = null
        this.editData.serviceName = null
        this.editData.serviceDesc = null
      } else {
        this.editData.id = row.id
        this.editData.serviceName = row.serviceName
        this.editData.serviceDesc = row.serviceDesc
      }
      this.dialogData.isAdd = isAdd
      this.dialogData.dialogVisible = true
    },
    saveData () {
      let promise = null
      if (this.dialogData.isAdd) {
        promise = this.axios.post('/base/service-info', this.editData)
      } else {
        promise = this.axios.put('/base/service-info', this.editData)
      }
      promise.then(data => {
        this.dialogData.dialogVisible = false
        this.refreshData()
      })
    },
    deleteRow (row) {
      debugger
      this.axios.delete('/base/service-info', { data: [row.id] })
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
