<template>

  <el-table :data="pageData.tableData" current-row-key="id" style="width: 100%">
     <el-table-column  prop="id" label="主键"  >
        <template #default="user">
          <spen >{{user.row.id}}</spen>
        </template>
      </el-table-column>

     <el-table-column  prop="nickname" label="昵称"  >
        <template #default="user">
          <spen >{{user.row.nickname}}</spen>
        </template>
      </el-table-column>
      <el-table-column  prop="headUrl" label="头像"  >
        <template #default="user">
           <el-avatar :size="50" :src="user.row.headUrl"></el-avatar>
        </template>
      </el-table-column>
      <el-table-column  prop="authList" label="权限列"  >
        <template #default="user">
          <!-- <template v-for="item in user.row.authList"> -->
            <spen v-for="item in user.row.authList" :key="item" >{{item}}, </spen>
          <!-- </template> -->
        </template>
      </el-table-column>

    <el-table-column fixed="right" label="操作" width="200">
      <template #default="rowInfo">
        <el-button type="text" size="small" @click="openAuthTableDialog(rowInfo.row)">编 辑</el-button>
        <!-- <el-button type="text" size="small" @click="deleteRow(rowInfo.row)">删 除</el-button> -->
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

 <el-dialog v-model="outerVisible" title="用户权限列表" @close="refreshData()">
    <template #default>
      <el-button type="primary" @click="innerVisible = true">新 增</el-button>
      <el-table :data="userAuthList" style="width: 100%">
        <el-table-column prop="appServiceType" label="级别" width="120" />
          <el-table-column fixed prop="authName" label="权限组名" width="150" />
          <el-table-column prop="authCode" label="权限Code" width="120" />
          <el-table-column prop="authDesc" label="描述" width="200" />
          <el-table-column fixed="right" label="操作" width="120">
            <template #default="row">
              <el-button type="text" size="small" @click="delAuth(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

      <el-dialog
        v-model="innerVisible"
        width="30%"
        title="新增用户权限"
        append-to-body
      >
            <el-form
              label-position="right"
              label-width="80px"
              :model="addUserAuth"
            >
              <el-form-item label="" required="true">
                <el-select  v-model="addUserAuth.authId" @click="queryAuth" placeholder="选择权限">
                  <el-option  v-for="item in authOptions"  :key="item.id"  :label="item.authName" :value="item.id" >
                    {{item.appServiceType}}-{{item.authName}}
                  </el-option>
                </el-select>
              </el-form-item>

            </el-form>

            <template #footer>
              <span class="dialog-footer">
                <el-button  @click="innerVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveUserAuthData" >确 认</el-button >
              </span>
            </template>

      </el-dialog>
    </template>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="outerVisible = false">取 消</el-button>
      </div>
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
      userAuthList: [],
      authOptions: [],
      addUserAuth: {},
      outerVisible: false,
      innerVisible: false,
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
      this.axios.get('/other/user-auth', {
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
    openAuthTableDialog (userInfo) {
      this.refreshAuthData(userInfo.id)
      this.addUserAuth = { userId: userInfo.id }
      this.outerVisible = true
    },
    refreshAuthData (userId) {
      this.axios.get('/other/user-auth/userAuth', {
        params: {
          userId: userId
        }
      }).then(data => {
        this.userAuthList = data
      })
    },
    openDialog (row) {
      // debugger
      this.editData = row.authList === null ? [] : row.authList
      this.addUserAuth = { userId: row.id }
    },
    queryAuth () {
      this.axios.get('/auth/group', {
        params: {
          current: 1,
          size: 100
        }
      }).then(data => {
        this.authOptions = data.records
      })
    },
    saveUserAuthData () {
      this.axios.post('/other/user-auth', this.addUserAuth).then(data => {
        this.innerVisible = false
        this.refreshAuthData(this.addUserAuth.userId)
      })
    },
    delAuth (authRow) {
      this.axios.delete('/other/user-auth', { data: [authRow.row.id] })
        .then(data => {
          this.refreshAuthData(this.addUserAuth.userId)
        })
    }
  }
}
</script>

<style>

</style>
