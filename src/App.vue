
<template>
  <el-container style="height: 500px; border: 1px solid #eee">

    <el-header style="text-align: right; font-size: 12px">
      <el-dropdown>
        <i class="el-icon-setting" style="margin-right: 15px"></i>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>View</el-dropdown-item>
            <el-dropdown-item>Add</el-dropdown-item>
            <el-dropdown-item>Delete</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <span>Tom</span>
    </el-header>

    <el-container>

    <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
        <el-menu :default-openeds="['1']" router="true">
          <el-sub-menu v-fun.props="['index','key']" v-for="(item) in menus" :index="item.routerPath" :key="item.id">
            <template #title><i class="el-icon-message"></i>{{item.menuName}}</template>

            <template v-if="item.children&&item.children.length!=0">
              <el-menu-item v-fun.props="['index']" v-for="item2 in item.children" :key="item2.id" :index="item2.routerPath"
                          @click="addTab(item2.routerPath,item2.menuName)">{{item2.menuName}}
              </el-menu-item>
            </template>
          </el-sub-menu>

          <el-sub-menu index="2">
            <template #title><i class="el-icon-menu"></i>服务基础元数据</template>
              <el-menu-item index="/base/application" @click="addTab('/base/application','应用')" v-fun.props="['index','route','label']">应用</el-menu-item>
              <el-menu-item index="/serve/split" @click="addTab('/serve/split','服务拆分')">服务拆分</el-menu-item>
              <el-menu-item index="/functionTree" @click="addTab('/functionTree','模块功能树')">模块功能树</el-menu-item>
          </el-sub-menu>
          <!-- <el-sub-menu index="3">
            <template #title><i class="el-icon-setting"></i>权限维护</template>
            <el-menu-item-group>
              <template #title>Group 1</template>
              <el-menu-item index="3-1">权限列表</el-menu-item>
              <el-menu-item index="3-2">功能模块权限关联</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group>
              <template #title>用户</template>
              <el-menu-item index="/user"  @click="addTab('/user','用户维护')">用户维护</el-menu-item>
              <el-menu-item index="3-2">用户权限分配</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu> -->
        </el-menu>
      </el-aside>

      <el-main>
      <el-tabs  v-model="chooseTabName" type="card"  closable  @tab-remove="removeTab" @tab-click="chooseTab">
          <el-tab-pane
            v-for="item in editableTabs"
            :key="item.name"
            :label="item.title"
            :name="item.name">

          </el-tab-pane>
          <router-view/>
          <!-- <router-view v-slot="{ Component, route }">
            <transition :name="route.meta.transition || 'fade'" mode="out-in">
                  <keep-alive>
                    <component
                      :is="Component"
                      :key="route.fullPath"
                    />
                  </keep-alive>
                </transition>
          </router-view> -->

        </el-tabs>

      </el-main>

    </el-container>
  </el-container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import TableCom from './components/TableCom.vue'
// import Tabs from './components/Tabs.vue'

export default defineComponent({
  components: {
    // TableCom
  // ,
  // HelloWorld
  },
  // components: { Tabs },
  setup () {
    return {
    }
  },
  data () {
    return {
      menus: [],
      chooseTabName: '1',
      editableTabs: []
    }
  },
  created () {
    this.axios.get('/other/menus', {})
      .then((data) => {
        this.menus = data
      })
  },
  methods: {
    addTab (newTabName, title) {
      let hasExist = false
      for (let index = 0; index < this.editableTabs.length; index++) {
        const tab = this.editableTabs[index]
        if (tab.name === newTabName) {
          hasExist = true
          break
        }
      }
      if (!hasExist) {
        this.editableTabs.push({
          title: title,
          name: newTabName
        })
      }
      this.chooseTabName = newTabName
    },
    removeTab (targetName: string) {
      const editableTabs = this.editableTabs
      const tabs = []
      for (let i = 0; i < editableTabs.length; i++) {
        const tab = editableTabs[i]
        if (tab.name === targetName) {
          if (editableTabs.length === 1) {
            this.chooseTabName = null
            continue
          }
          if (i === editableTabs.length - 1) {
            this.chooseTabName = editableTabs[i - 1].name
          } else {
            this.chooseTabName = editableTabs[i + 1].name
          }
          continue
        }
        tabs.push(tab)
      }
      this.editableTabs = tabs
      this.$router.push(this.chooseTabName)
      // this.editableTabs = tabs.filter((tab) => tab.name !== targetName)
    },
    chooseTab (tab) {
      this.chooseTabName = tab.props.name
      this.$router.push(tab.props.name)
    }

  }

})
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
