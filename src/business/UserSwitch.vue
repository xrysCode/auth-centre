<template>
    <el-dropdown>
        <i class="el-icon-setting" style="margin-right: 20px">切换用户</i>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="item in pageData.tableData" :key="item.id" @click="switchUser(item)">
                {{item.nickname}}
                <img :src="item.headUrl" height="20" width="20">
            </el-dropdown-item>
            <!-- <el-dropdown-item>Add</el-dropdown-item>
            <el-dropdown-item>Delete</el-dropdown-item> -->
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-avatar :size="50" :src="currentUser.headUrl"></el-avatar>
      {{currentUser.nickname}}
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
      currentUser: {},
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
          current: 1,
          size: 20
        }
      }).then(data => {
        this.pageData.total = data.total
        this.pageData.tableData = data.records
        let user = JSON.parse(window.sessionStorage.getItem('currentUser'))
        if (!user) {
          user = this.pageData.tableData[0]
          window.sessionStorage.setItem('currentUser', JSON.stringify(user))
        }
        this.currentUser = user
      })
    },
    switchUser (user) {
      window.sessionStorage.setItem('currentUser', JSON.stringify(user))
      this.currentUser = user
    }

  }
}
</script>

<style >
.el-header {
  background-color: #b3c0d1;
  color: var(--el-text-color-primary);
  line-height: 60px;
}

.el-aside {
  color: var(--el-text-color-primary);
}
</style>
