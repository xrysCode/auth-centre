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
        <el-menu :default-openeds="['1', '2']" router="true">
          <el-sub-menu index="1">
            <template #title><i class="el-icon-message"></i>菜单配置</template>
              <el-menu-item index="/about">首页菜单</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="2">
            <template #title><i class="el-icon-menu"></i>服务基础元数据</template>
              <el-menu-item index="/base/serve" @click="addTab('/base/serve','服务')">服务</el-menu-item>
              <el-menu-item index="/" @click="addTab('/','服务拆分')">服务拆分</el-menu-item>
              <el-menu-item index="2-2">模块功能树</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="3">
            <template #title><i class="el-icon-setting"></i>权限维护</template>
            <el-menu-item-group>
              <template #title>Group 1</template>
              <el-menu-item index="3-1">权限列表</el-menu-item>
              <el-menu-item index="3-2">功能模块权限关联</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group>
              <template #title>用户</template>
              <el-menu-item index="3-1">用户维护</el-menu-item>
              <el-menu-item index="3-2">用户权限分配</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
        </el-menu>
      </el-aside>

      <el-main>
        <!-- <tabs/> -->
        <!-- <hello-world/> -->

      <el-tabs
          v-model="chooseTabName"
          type="card"
          closable
          @tab-remove="removeTab">
          <el-tab-pane
            v-for="item in editableTabs"
            :key="item.name"
            :label="item.title"
            :name="item.name">
            {{ item.content }}
            <router-view/>

            <!-- <table-com/> -->
          </el-tab-pane>
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
      chooseTabName: '1',
      editableTabs: [
        {
          title: 'Tab 1',
          name: '1',
          content: 'Tab 1 content'
        }
      ]
    }
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
      const tabs = this.editableTabs
      let activeName = this.editableTabsValue
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if (tab.name === targetName) {
            const nextTab = tabs[index + 1] || tabs[index - 1]
            if (nextTab) {
              activeName = nextTab.name
            }
          }
        })
      }

      this.editableTabsValue = activeName
      this.editableTabs = tabs.filter((tab) => tab.name !== targetName)
    }
  }
})
</script>

<style>
.el-header {
  background-color: #b3c0d1;
  color: var(--el-text-color-primary);
  line-height: 60px;
}

.el-aside {
  color: var(--el-text-color-primary);
}
</style>
