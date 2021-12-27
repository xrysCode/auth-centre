<template>

  <el-row :gutter="10">
    <el-col :span="6" >
        功能树
      <el-select v-model="currentApp" @click="queryApp" @change="refreshFunTree" placeholder="应用选择">
        <el-option v-for="item in appOptions"  :key="item.id"   :label="item.appName"  :value="item" />
      </el-select>
      <el-tree
          :data="funTree"
          :props="treeProps"
          draggable
          default-expand-all
          node-key="id"
          @node-drop="nodeDrop"
        >
          <template #default="{ node, data }">
            <span class="custom-tree-node">
              <span>{{ node.label }} </span>
              <span>
                <a @click="queryFunAuth(data)"> 查询列表 </a>
              </span>
            </span>
          </template>
        </el-tree>
      </el-col>
    <el-col :span="18">
      <el-button type="primary" plain @click="openDialog(true)">新 增</el-button>
      功能名<el-input v-model="editData.funName" disabled placeholder="功能名" />
      所选功能id<el-input v-model="editData.funId" disabled placeholder="所选功能id" />

      <el-table :data="pageData.tableData" current-row-key="id" style="width: 100%">
      <el-table-column prop="id" label="id" />
       <el-table-column prop="funId" label="功能id" />
      <el-table-column prop="funName" label="功能名" />

      <el-table-column prop="authId" label="权限id" />
      <el-table-column prop="authName" label="权限组名" />
      <!-- <el-table-column prop="authDesc" label="组描述" /> -->
      <el-table-column prop="authCode" label="权限code" />

      <el-table-column prop="createUser" label="创建人" />
      <el-table-column prop="createTime" label="创建时间" />

      <el-table-column fixed="right" label="操作" width="200">
        <template #default="rowInfo">
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

      </el-col>
  </el-row>

  <el-dialog  v-model="dialogData.dialogVisible" :title="dialogTitle"  width="30%" center >
    <el-form :model="dialogData" :rules="dialogData.rules" label-position="right"  label-width="100px" >
      <el-form-item label="功能名" required="true" >
        <el-input v-model="editData.funName" disabled  />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="editData.funDesc" type="textarea" disabled/>
      </el-form-item>
      <el-form-item label="权限维度">
       <el-select  v-model="editData.appServiceType" @change="editData.authId=null" placeholder="权限维度选择">
         <el-option label="应用" value="APP" />
         <el-option label="服务" value="SERVICE" />
       </el-select>
      </el-form-item>

      <el-form-item label="权限组">
       <el-select v-model="editData.authId" @click="queryAppServicesAuth"  placeholder="权限组选择">
         <el-option  v-for="item in appServiceOptions"  :key="item.id"  :label="item.authName" :value="item.id" />
       </el-select>
      </el-form-item>

    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogData.dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveData">确 认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
/* eslint-disable no-unused-vars */

// import authPlugin from './plugins/auth2'
import { MessageNotify, OPEN_COMPONENT_LISTENER, CLOSE_COMPONENT_LISTENER } from '@/base_scan/auth2.js'

export default {
  name: '功能树权限关联',
  data () {
    return {
      appOptions: [],
      currentApp: null,
      appServiceOptions: [],
      pageData: {
        current: 1,
        size: 10,
        total: 0,
        search: {},
        tableData: [
        ]
      },
      funTree: [],
      treeProps: {
        children: 'children',
        label: 'funName'
      },
      isOpenScan: false,
      editData: {},
      dialogData: {
        isAdd: false,
        dialogVisible: false,
        rules: {}
      }
    }
  },
  created () {
    this.queryApp().then(() => {
      this.currentApp = this.appOptions[0]
      this.refreshFunTree()
    })
  },

  methods: {
    queryApp () {
      return this.axios.get('/base/application', {
        params: { current: 1, size: 20 }
      }).then((data) => {
        this.appOptions = data.records
      })
    },
    queryAppServicesAuth () {
      this.axios.get('/auth/group/getAuthOptions', {
        params: { appServiceId: this.editData.serviceId, appServiceType: this.editData.appServiceType }
      }).then((data) => {
        this.appServiceOptions = data
      })
    },

    refreshFunTree () {
      this.axios.get('/base/function-module', {
        params: { appId: this.currentApp.id }
      }).then((data) => {
        this.funTree = data
      })
    },

    queryFunAuth (funData) {
      if (funData) {
        this.editData.funId = funData.id
        this.editData.funName = funData.funName
        this.editData.serviceId = funData.serviceId
      }

      this.axios.get('/auth/fun', {
        params: { funId: this.editData.funId }
      }).then((data) => {
        this.pageData.total = data.total
        this.pageData.tableData = data.records
      })
    },

    openDialog (isAdd, comData) {
      if (!isAdd) {
        const editData = {
          ...comData
        }
        this.editData = editData
      } else {
        this.editData.appServiceType = 'APP'
      }

      this.dialogData.isAdd = isAdd
      this.dialogData.dialogVisible = true
    },
    saveData () {
      let promise = null
      if (this.dialogData.isAdd) {
        promise = this.axios.post('/auth/fun', { authId: this.editData.authId, funId: this.editData.funId })
      } else {
        promise = this.axios.put('/auth/fun', { authId: this.editData.authId, funId: this.editData.funId })
      }
      promise.then((data) => {
        this.dialogData.dialogVisible = false
        this.queryFunAuth()
      })
    },
    deleteRow (authFunData) {
      this.axios.delete('/auth/fun', { data: [authFunData.id] }).then((data) => {
        this.queryFunAuth()
      })
    }

  }
}
</script>

<style>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>
