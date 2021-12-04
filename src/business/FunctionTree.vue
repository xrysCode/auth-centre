<template>

  <el-container >
    <el-aside width="600px" direction="vertical" >
      <el-select v-model="currentApp" @click="queryApp" @change="refreshTreeAndIframe" placeholder="应用选择">
        <el-option v-for="item in appOptions"  :key="item.id"   :label="item.appName"  :value="item" />
      </el-select>
      提取页域名：{{iframeUrl.origin}}
      提取页路劲：{{iframeUrl.path}}
      <el-main >组件树
        <el-switch  v-model="isOpenScan"  @change="openScan"  inline-prompt  active-color="#13ce66"  inactive-color="#ff4949"
         active-text="开启组件扫描" inactive-text="关闭组件扫描" />
        <el-tree
          :data="componentTree"
          node-key="uniqueFlag"
          :props="treeProps"
          highlight-current="true"
          default-expand-all
          :expand-on-click-node="false"
          :render-content="renderContent"
        >
        <template #default="{  data }">
            <span class="custom-tree-node">
              <span>{{ data.funName }} 初始路由：{{data.currentReferer?data.currentReferer:'?'}} props:{{data.componentProps}}</span>
              <span>
                <a @click="openDialog(true,data)"> 移动到功能树 </a>
              </span>
            </span>
          </template>
        </el-tree>

      </el-main>
      <el-main >功能树

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
              <span>{{ node.label }} >> {{ data.routerPath }}</span>
              <!-- <span>{{ data.authKeys }}</span> -->
              <span>
                <a @click="openDialog(false, data)"> 编辑 </a>
                <!-- <a @click="openDialog(true,data)"> 添加 </a> -->
                <a @click="remove(data)"> 删除 </a>
              </span>
            </span>
          </template>
        </el-tree>

      </el-main>
    </el-aside>
    <el-main>提取页
      <iframe id="iframeTest" title="寻找组件与树通讯" name="组件拾取" width="100%" height="650" :src="iframeUrl.href"></iframe>
    </el-main>
  </el-container>

  <el-dialog  v-model="dialogData.dialogVisible" :title="dialogTitle"  width="30%" center >
    <el-form :model="dialogData" :rules="dialogData.rules" label-position="right"  label-width="100px" >
      <el-form-item label="功能名" required="true">
        <el-input v-model="editData.funName" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="editData.funDesc" type="textarea"/>
      </el-form-item>
      <el-form-item label="当前页面">
        <el-input v-model="editData.currentReferer" type="textarea" disabled/>
      </el-form-item>
        <el-form-item label="组件type">
        <el-input v-model="editData.componentTypeStr" type="textarea" disabled/>
      </el-form-item>
        <el-form-item label="组件props">
        <el-input v-model="editData.componentPropsStr" type="textarea" disabled/>
      </el-form-item>
        <el-form-item label="后端访问接口">
        <el-input v-model="editData.requestUrl" />
      </el-form-item>
        <el-form-item label="请求方法">
        <el-input v-model="editData.requestMethod" />
      </el-form-item>
      <el-form-item label="归属服务选择">
       <el-select v-model="editData.serviceId" @click="queryAppServices"  placeholder="应用服务选择">
         <el-option  v-for="item in appServiceOptions"  :key="item.id"  :label="item.serviceName" :value="item.id" />
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
  name: '功能树',
  data () {
    return {
      appOptions: [],
      currentApp: null,
      appServiceOptions: [],

      iframeUrl: {
        origin: '',
        path: '',
        get href () { return this.origin + this.path }
      },
      currentRoute: {},
      componentTree: [],
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
      this.refreshTreeAndIframe()
    })
  },

  mounted () {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this

    function filterToTree (treeArr, parentFunTree, rootArr) {
      const tempRootArr = rootArr
      const tempParentFunTree = parentFunTree
      for (let index = 0; index < treeArr.length; index++) {
        const node = treeArr[index]
        if (node.isFunNode) {
          const funNode = {
            children: [],
            componentProps: node.props,
            componentType: node.type,
            currentReferer: node.initRouter.fullPath,
            // funDesc: '',
            funName: node.name,
            // id: 0,
            // parentId: 0,
            requestMethod: node.initRequest ? node.initRequest.method : null,
            requestUrl: node.initRequest ? node.initRequest.url : null,
            // serviceId: 0,
            sort: index
          }
          if (rootArr) {
            rootArr.push(funNode)
            rootArr = null
          } else {
            parentFunTree.children.push(funNode)
          }
          parentFunTree = funNode
        }// 树下的所有分支都挂在子级
        filterToTree(node.childNodes, parentFunTree, rootArr)
        // 在循环结束复位
        rootArr = tempRootArr
        parentFunTree = tempParentFunTree
      }
    }

    function receiveMessage (event) {
      if (event.source === window) {
        return
      }
      const newTrees = new Array(JSON.parse(event.data.dataJson))
      const currentRoute = JSON.parse(event.data.currentRouteJson)
      _this.currentRoute = currentRoute
      _this.iframeUrl.origin = event.origin + '/'
      _this.iframeUrl.path = currentRoute.href
      // 过滤仅展示打标的数据
      const rootComponentTree = []
      filterToTree(newTrees, null, rootComponentTree)
      console.log('过滤树', newTrees, rootComponentTree)
      _this.componentTree = rootComponentTree
      // event.source.postMessage(new MessageNotify(), event.origin)
    }
    // 这里添加对另外一个窗口的组件树的监听
    window.addEventListener('message', receiveMessage, false)
    // 发个消息告诉子窗口开始点击扫描树
    // window.postMessage(new MessageNotify('startBodyListener', null), '*')
    // document.getElementById('iframeTest').contentWindow.postMessage(new MessageNotify('startBodyListener', null), '*')
  },
  unmounted () {
    console.log('离开树了，卸载监听')
    // window.removeEventListener('message')
  },

  methods: {
    openScan (event) {
      // let iframeWindown = (<HTMLIFrameElement> iframe).contentWindow;
      // iframeWindown.postMessage(new MessageNotify(OPEN_COMPONENT_LISTENER, null), iframeWindown.origin)
      // 开启点击触发树刷新
      const iframeWindown = (document.getElementById('iframeTest') as any).contentWindow
      if (this.isOpenScan) {
        iframeWindown.postMessage(new MessageNotify(OPEN_COMPONENT_LISTENER, null), iframeWindown.origin)
      } else {
        iframeWindown.postMessage(new MessageNotify(CLOSE_COMPONENT_LISTENER, null), iframeWindown.origin)
        this.componentTree = []
        this.currentRoute = ''
      }
    },

    /// ///////////////////////////////////////////////////////////////////////////////////////////////////////
    queryApp () {
      return this.axios.get('/base/application', {
        params: { current: 1, size: 20 }
      }).then((data) => {
        this.appOptions = data.records
      })
    },
    refreshTreeAndIframe () {
      this.componentTree = []
      this.componentTree = null
      this.editData = null
      const accessPath = this.currentApp.accessPath
      if (accessPath.startsWith('http')) { // 存在以域名开头的和/开头的路径
        this.iframeUrl.origin = accessPath.replace(/(^https*:\/\/[^/]+)(.+)/, '$1')
        this.iframeUrl.path = accessPath.replace(/(^https*:\/\/[^/]+)(.+)/, '$2')
      } else {
        this.iframeUrl.origin = ''
        this.iframeUrl.path = accessPath
      }

      // this.iframeUrl = this.currentApp.accessPath
      this.refreshFunTree()
    },
    queryAppServices () {
      this.axios.get('/base/service', {
        params: { current: 1, size: 20, appId: this.currentApp.id }
      }).then((data) => {
        this.appServiceOptions = data.records
      })
    },

    refreshFunTree () {
      // debugger
      this.axios.get('/base/function-module', {
        params: { appId: this.currentApp.id }
      }).then((data) => {
        this.funTree = data
      })
    },
    openDialog (isAdd, comData) {
      const editData = {
        ...comData,
        children: null
      }
      editData.componentPropsStr = JSON.stringify(editData.componentProps)
      editData.componentTypeStr = JSON.stringify(editData.componentType)
      this.editData = editData
      this.dialogData.isAdd = isAdd
      this.dialogData.dialogVisible = true
    },
    saveData () {
      let promise = null
      if (this.dialogData.isAdd) {
        promise = this.axios.post('/base/function-module', this.editData)
      } else {
        promise = this.axios.put('/base/function-module', this.editData)
      }
      promise.then((data) => {
        this.dialogData.dialogVisible = false
        this.refreshFunTree()
      })
    },
    remove (funTreeData) {
      this.axios.delete('/base/function-module', { data: [funTreeData.id] }).then((data) => {
        this.refreshFunTree()
      })
    },

    nodeDrop (draggingNode, dropNode, dropType, ev) {
      // before、after、inner
      console.log('tree drag end: ', draggingNode, dropType)
      this.axios
        .put('/base/function-module/shift', {
          draggingId: draggingNode.data.id,
          replaceId: dropNode.data.id,
          dropType: dropType
        })
        .then((data) => {
          this.refreshFunTree()
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
