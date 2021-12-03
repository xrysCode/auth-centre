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
    <el-form
      label-position="right"
      label-width="80px"
      :model="dialogData"
      :rules="dialogData.rules"
    >
      <el-form-item
        v-for="(value, name) in tableColumn"
        :key="name"
        :prop="name"
        :label="value.label"
        v-show="value.show"
      >
        <el-input v-if="value.edit" v-model="editData[name]" :type="value.type"></el-input>
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
      tableColumn: {
        id: { label: '主键', edit: true },
        parentId: { label: '父节点主键', edit: true },
        menuName: {
          label: '菜单名',
          show: true,
          edit: true,
          rules: [
            {
              required: true,
              message: '菜单名称必填',
              trigger: 'blur'
            }
          ]
        },
        menuDesc: { label: '描述', show: true, edit: true, type: 'textarea' },
        routerPath: {
          label: '路由路径',
          show: true,
          edit: true,
          rules: [
            {
              required: true,
              message: '路由路径必填',
              trigger: 'blur'
            }
          ]
        },
        sort: { label: '排序', edit: true },
        authKeys: { label: '权限keys', show: true, edit: true },
        comImport: { label: '路由组件位置', show: true, edit: true },
        componentProps: { label: '组件props', show: true, edit: true },

        createUser: { label: '创建人' },
        createTime: { label: '创建时间' }
      },
      data: [],
      defaultProps: {
        children: 'children',
        label: 'menuName'
      },
      editData: {},
      dialogData: {
        isAdd: false,
        dialogVisible: false,
        rules: {}
      }
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
      this.axios
        .get('/other/menus', {
          params: {}
        })
        .then((data) => {
          this.data = data
        })
    },
    openDialog (isAdd, row) {
      const tableColumn = this.tableColumn
      for (const key in this.tableColumn) {
        if (tableColumn[key].edit === true) {
          if (isAdd) {
            switch (key) {
              case 'parentId':// 添加在子节点
                this.editData[key] = row.id
                break
              case 'sort':
                this.editData[key] = 0
                break
              default:
                this.editData[key] = null
            }
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
