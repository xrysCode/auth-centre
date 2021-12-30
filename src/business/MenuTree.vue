<template>
  <el-tree
    :data="data"
    :props="defaultProps"
    draggable
    default-expand-all
    node-key="id"
    @node-drop="nodeDrop"
  >
    <template #default="{ node, data }">
      <span class="custom-tree-node">
        <span>{{ node.label }} >> {{ data.routerPath }}</span>
        <!-- <span>{{ data.authKeys }}</span> -->
        <span>
          <a @click="openDialog(false, data)"> 编辑 </a>
          <a @click="openDialog(true,data)"> 添加 </a>
          <a @click="remove(data)"> 删除 </a>
        </span>
      </span>
    </template>
  </el-tree>

  <el-dialog
    v-model="dialogData.dialogVisible"
    :title="dialogTitle"
    width="30%"
    center
  >
    <el-form label-position="right"  label-width="80px"  :model="editData"  >
      <el-form-item label="菜单名" >
        <el-input v-model="editData.menuName" ></el-input>
      </el-form-item>
      <el-form-item  label="描述" >
        <el-input v-model="editData.menuDesc" type="textarea"></el-input>
      </el-form-item>
      <el-form-item  label="路由路径" >
        <el-input v-model="editData.routerPath" ></el-input>
      </el-form-item>
      <el-form-item  label="应用权限key" >
       <el-select v-model="editData.authAppKeys" @click="queryAppServicesAuth('APP')" multiple="true"  placeholder="应用权限key">
         <el-option  v-for="item in appOptions"  :key="item.authCode"  :label="item.authName" :value="item.authCode" />
       </el-select>
      </el-form-item>
      <el-form-item label="服务权限key" >
        <el-select v-model="editData.authServiceKeys" @click="queryAppServicesAuth('SERVICE')" multiple="true"  placeholder="服务权限key">
         <el-option  v-for="item in serviceOptions"  :key="item.authCode"  :label="item.authName" :value="item.authCode" />
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
export default {
  data () {
    return {
      data: [],
      defaultProps: {
        children: 'children',
        label: 'menuName'
      },
      editData: {},
      dialogData: {
        isAdd: false,
        dialogVisible: false
      },
      appOptions: [],
      serviceOptions: []
    }
  },
  created () {
    this.refreshData()
    this.queryAppServicesAuth('APP')
    this.queryAppServicesAuth('SERVICE')
  },
  methods: {
    refreshData () {
      // debugger
      this.axios
        .get('/other/menus', {
          params: {}
        })
        .then((data) => {
          this.data = data
        })
    },
    openDialog (isAdd, row) {
      if (isAdd) {
        this.editData = {
          parentId: row.id, // 添加在子节点
          sort: 0
        }
      } else {
        this.editData = { ...row }
      }

      this.dialogData.isAdd = isAdd
      this.dialogData.dialogVisible = true
    },
    saveData () {
      let promise = null
      if (this.dialogData.isAdd) {
        promise = this.axios.post('/other/menus', this.editData)
      } else {
        promise = this.axios.put('/other/menus', this.editData)
      }
      promise.then((data) => {
        this.dialogData.dialogVisible = false
        this.refreshData()
      })
    },
    remove (data) {
      this.axios.delete('/other/menus', { data: [data.id] }).then((data) => {
        this.refreshData()
      })
    },

    nodeDrop (draggingNode, dropNode, dropType, ev) {
      // before、after、inner
      console.log('tree drag end: ', draggingNode, dropType)
      this.axios
        .put('/other/menus/shift', {
          draggingId: draggingNode.data.id,
          replaceId: dropNode.data.id,
          dropType: dropType
        })
        .then((data) => {
          this.refreshData()
        })
    },

    queryAppServicesAuth (appServiceType) {
      this.axios.get('/auth/group/getAuthOptions', {
        params: { appServiceId: 1, appServiceType: appServiceType }
      }).then((data) => {
        if (appServiceType === 'APP') {
          this.appOptions = data
        } else {
          this.serviceOptions = data
        }
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
