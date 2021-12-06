<template>
  <el-button type="primary" plain @click="openDialog(true)">新 增</el-button>

  <el-table :data="pageData.tableData" current-row-key="id" style="width: 100%">
    <el-table-column prop="id" label="id" />
    <el-table-column prop="authName" label="权限组名" />
    <el-table-column prop="authDesc" label="组描述" />
    <el-table-column prop="authCode" label="权限Key" />
    <el-table-column prop="appServiceType" label="归属类型" />
    <el-table-column prop="appServiceId" label="归属id" />
    <el-table-column prop="appServiceName" label="归属应用/服务" />
    <el-table-column prop="createUser" label="创建人" />
    <el-table-column prop="createTime" label="创建时间" />

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
    >
      <el-form-item label="权限组名" required="true">
        <el-input v-model="editData.authName" />
      </el-form-item>
      <el-form-item label="组描述" type="textarea">
        <el-input v-model="editData.authDesc" />
      </el-form-item>
      <el-form-item label="权限key" >
        <el-input v-model="editData.authCode" disabled/>
      </el-form-item>

      <el-form-item label="归属应用" required="true">
        <el-cascader
          :props="{value:'uniqueFlag',label:'name',children:'children',checkStrictly:'true'}"
          v-model="editData.uniqueFlag"
          :options="appServiceOptions"
          placeholder="应用/服务选择" :disabled="!dialogData.isAdd"
        ></el-cascader>

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
  name: '服务拆分',
  data () {
    return {
      appServiceOptions: [],
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
    this.refreshData()
    this.queryAppServices()
  },
  methods: {
    refreshData () {
      this.axios.get('/auth/group', {
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
      if (isAdd) {
        this.editData = {}
      } else {
        this.editData = row
        this.editData.uniqueFlag = row.appServiceType + ':' + row.appServiceId
      }
      this.dialogData.isAdd = isAdd
      this.dialogData.dialogVisible = true
    },
    queryAppServices () {
      this.axios.get('/base/application/cascaderService', {}).then((data) => {
        this.appServiceOptions = data
      })
    },
    saveData () {
      let promise = null

      if (this.dialogData.isAdd) {
        if (this.editData.uniqueFlag.length === 2) {
          this.editData.appServiceId = this.editData.uniqueFlag[1].replace('SERVICE:', '')
          this.editData.appServiceType = 'SERVICE'
        } else {
          this.editData.appServiceId = this.editData.uniqueFlag[0].replace('APP:', '')
          this.editData.appServiceType = 'APP'
        }
        promise = this.axios.post('/auth/group', this.editData)
      } else {
        promise = this.axios.put('/auth/group', this.editData)
      }
      promise.then(data => {
        this.dialogData.dialogVisible = false
        this.refreshData()
      })
    },
    deleteRow (row) {
      debugger
      this.axios.delete('/auth/group', { data: [row.id] })
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
