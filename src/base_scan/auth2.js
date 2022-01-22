import { h, resolveComponent } from 'vue'

/**
 * 组件解析
 *  node_modules\@vue\shared\dist\shared.d.ts 273
    ELEMENT = 1,
    FUNCTIONAL_COMPONENT = 2,
    STATEFUL_COMPONENT = 4,
    TEXT_CHILDREN = 8,
    ARRAY_CHILDREN = 16,
    SLOTS_CHILDREN = 32,
    TELEPORT = 64,
    SUSPENSE = 128,
    COMPONENT_SHOULD_KEEP_ALIVE = 256,
    COMPONENT_KEPT_ALIVE = 512,
    COMPONENT = 6  这是一个有毒的数字  6=4+2 ~.~
 * @param {Array} vNodes 虚拟节点数组
 * @param {*} parentNode 解析的父节点
 * @returns componentNode
 */
function parseComponentTree (vNode, parentNode) {
  if (vNode == null) {
    return
  }
  if (vNode.shapeFlag & 6) { // 组件节点 寻找component 不去找children
    const vComponent = vNode.component// 虚拟节点的组件实例
    const componentNode = new ComponentNode(vComponent, parentNode)
    // 继续寻找当前是否有下一个组件节点
    const vSubTreeVNode = vComponent.subTree// subTree是一个虚拟节点
    parseComponentTree(vSubTreeVNode, componentNode)
  }
  if (vNode.shapeFlag & (16)) { // 数组节点
    const vNodes = vNode.children
    if (vNodes) {
      for (let i = 0; i < vNodes.length; i++) {
        parseComponentTree(vNodes[i], parentNode)
      }
    }
  }

  // 组件节点   (componentNode.shapeFlag === 6 || componentNode.shapeFlag & (4 + 16 + 256 + 512))
}

class ComponentNode {
  constructor (_vComponent, parentNode) {
    const vType = _vComponent.type
    const vNode = _vComponent.vnode
    this.uid = _vComponent.uid
    this.shapeFlag = vNode.shapeFlag// 组键标记
    this._vnode = vNode

    this.name = vType.name != null ? vType.name : vType.__file.substring(vType.__file.lastIndexOf('/') + 1)// 组件名
    this.type = { name: _vComponent.type.name, __file: _vComponent.type.__file }
    this.props = vNode.props
    // 指令解析的值
    this.functionModuleFlag = _vComponent.ctx.functionModuleFlag

    this.childNodes = []
    this.sequence = 0// 默认自己是0
    if (parentNode) {
      const parentChildNodes = parentNode.childNodes
      parentChildNodes.push(this)
      this.sequence = parentChildNodes.length - 1
    }
    this.parentNode = parentNode

    // 唯一标记将名字相同的视为同一个功能点
    this.uniqueFlag = parentNode ? (parentNode.uniqueFlag + ':' + this.name + '[' + this.sequence + ']') : (this.name + '[' + this.sequence + ']')
    // 访问路径，顶层就是一个数组为[0]
    this.accessPath = parentNode ? (parentNode.accessPath + '.' + 'childNodes[' + this.sequence + ']') : ('[' + this.sequence + ']')
  }

  toJSON () {
    return {
      shapeFlag: this.shapeFlag,
      name: this.name,
      type: this.type,
      props: this.props,

      functionModuleFlag: this.functionModuleFlag,
      childNodes: this.childNodes,
      sequence: this.sequence,
      uniqueFlag: this.uniqueFlag,
      accessPath: this.accessPath
    }
  }
}

export class MessageNotify {
  constructor (massageType, data, currentRoute) {
    this.massageType = massageType
    this.dataJson = data ? JSON.stringify(data, this.circularJsonHander()) : data
    this.currentRouteJson = currentRoute ? JSON.stringify(currentRoute.value, this.circularJsonHander()) : currentRoute
  }

  circularJsonHander () {
    const cache = []
    return (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.indexOf(value) !== -1) {
          // 循环引用找到，丢弃关键字 Circular reference found, discard key
          return
        }
        cache.push(value)
      }
      return value
    }
    // cache = null
  }
}

export const OPEN_COMPONENT_LISTENER = 'openBodyListener'
export const CLOSE_COMPONENT_LISTENER = 'closeBodyListener'
export const NEW_COMPONENT_TREE = 'newComponetTree'
// export const OPEN_COMPONENT_LISTENER = 'startBodyListener'

class EachOtherNotify {
  constructor (app) {
    this.app = app
    this.hasWindownListener = false
    this.hasBodyListener = false
    this.otherWin = null

    this.bodyClickEventListener = (function (_this) {
      // const _this1 = _this
      return e => {
        _this.scanTreeAndSendMsg(e)
      }
    }(this))
  }

  // bodyClickEventListener (e) {
  //   debugger
  //   EachOtherNotify.prototype.scanTreeAndSendMsg(e)
  //   // this.scanTreeAndSendMsg(e)
  // }

  registerWindownEventListener () { // 注册窗口监听 用于不同窗口间通讯
    if (!this.hasWindownListener) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const _this = this
      window.addEventListener('message', function (event) {
        return _this.windowMsgHandle(event)
      })
      this.hasWindownListener = true
    } else {
      console.log('已经有一个监听，不需要再注册了 hasWindownListener', this)
    }
  }

  registerBodyClickEventListener () { // 注册body点击监听
    if (!this.hasBodyListener) {
      document.body.addEventListener('click', this.bodyClickEventListener, false)
      this.hasBodyListener = true
    } else {
      console.log('已经有一个监听，不需要再注册了 hasBodyListener', this)
    }
  }

  cancelBodyClickEventListener () { // 注册body点击监听
    document.body.removeEventListener('click', this.bodyClickEventListener)
    this.hasBodyListener = false
  }

  scanTreeAndSendMsg (e) { // 每次点击都扫描树并发送数据到另外一个窗口
    const vRootComponet = this.app._instance
    const rootComponentNode = new ComponentNode(vRootComponet, null)
    // vRouter = recentlyComponent.appContext.config.globalProperties.$router
    parseComponentTree(vRootComponet.subTree, rootComponentNode)
    console.log('组件树==', rootComponentNode)
    // 将数据传递给外部的树去接受
    const currentRoute = this.app.config.globalProperties.$router.currentRoute
    this.otherWin.source.postMessage(new MessageNotify(NEW_COMPONENT_TREE, rootComponentNode, currentRoute), this.otherWin.origin)// http://localhost:8080/#/iframeTree'
  }

  windowMsgHandle (winEvent) { // 处理窗口消息，与上乘进行消息交互
    if (winEvent.source === window) {
      // console.log('Auth忽略自己', window.location, 'data=', winEvent.data, winEvent)
      return
    }
    this.otherWin = winEvent
    // 接收消息 开始监听body所有点击事件，以便实时组件收集。
    const messageNotify = winEvent.data
    console.log('Auth收到的信息', winEvent, 'data=', messageNotify, 'origin=', winEvent.origin, 'source=', winEvent.source)
    if (messageNotify.massageType) {
      switch (messageNotify.massageType) {
        case OPEN_COMPONENT_LISTENER:// 收到开启body的监听，用于
          this.registerBodyClickEventListener()
          this.scanTreeAndSendMsg()
          break
        case CLOSE_COMPONENT_LISTENER:
          this.cancelBodyClickEventListener()
      }
    }
  }
}

class FunctionModuleFlag {
  constructor (_this, dirObject) {
    const initRouter = _this.$router.currentRoute.value
    const type = _this.$.type
    // 路由:组件:[字段/标记]
    this.webFullPath = initRouter.fullPath
    this.comUniqueFlag = `${this.webFullPath}:${type.name}:${dirObject.arg ? dirObject.arg : ''}`// href
    this.requestMethods = Object.keys(dirObject.modifiers)
    this.requestUrl = dirObject.value
  }
}

export default {

  install: (app, options) => {
    // 全局注册相关的组件
    const msgNotify = new EachOtherNotify(app)
    msgNotify.registerWindownEventListener()
    // 指令 用于扫描过滤，和拦截两用。
    app.directive('funFlag', {
      funFlag: true// 用于标记组件是否需要权限，并使用这个标记来取组件指令的值
    })

    // 注入全局混入代理  这里对比是否需要拦截或者展示auth按钮配置
    // 默认开启
    app.mixin({
      beforeCreate () {
        // DOM 尚未更新
        // this.$nextTick(function () {
        // // DOM 现在更新了
        // // `this` 被绑定到当前实例
        //   this.initRouter = { ...this.$router.currentRoute.value, matched: '忽略' }// new InitRouter(this.$router.currentRoute)
        // })
        // debugger
        const instance = this.$
        console.log(instance.type, this.$router.currentRoute.value)
        const dirs = instance.vnode.dirs ? instance.vnode.dirs : []
        for (let index = 0; index < dirs.length; index++) {
          const dirObject = dirs[index]
          if (dirObject.dir.funFlag) {
            // console.log('需要代理', funFlag)
            const funFlag = new FunctionModuleFlag(this, dirObject)
            this.functionModuleFlag = funFlag
            const targetRender = instance.render
            const handler = {
              apply: function (target, ctx, args) {
                // 从用户返回值中取出值，对比是否相同，如果有就放行，没有就返回一个空节点，注释
                const userAuthStr = window.localStorage.getItem('userAuth')
                const hasAuth = JSON.parse(userAuthStr).indexOf(funFlag.comUniqueFlag)
                // if (hasAuth === -1) { // 存在运行渲染
                //   // 组件不需要渲染，这时它可以返回 null。这样我们在 DOM 中会渲染一个注释节点。
                //   return h(null, {}, ` permission denied  ${funFlag.comUniqueFlag} `)
                // }
                return Reflect.apply(target, ctx, args)
              }
            }
            const proxy = new Proxy(targetRender, handler)
            instance.render = proxy
          }
        }
      }
      // const parent = this.$parent

      // <transition> 元素作为单个元素/组件的过渡效果。<transition> 只会把过渡效果应用到其包裹的内容上，
      // 而不会额外渲染 DOM 元素，也不会出现在可被检查的组件层级中。
      // todo 动画组件的完善？？
      // if (mySelfComponent.type.name.endsWith('Transition')) { // transition
      //   console.log('内部组件', mySelfComponent)
      //   return
      // }
      //   let useTreeConfig = this.useTreeConfig
      //   if (!useTreeConfig) {
      //     const use = JSON.parse(localStorage.getItem('useTreeConfig'))
      //     if (!use) {
      //       return
      //     }
      //     const dynamicPraseTree = new DynamicPraseTree(use)
      //     // .config.globalProperties.$router.currentRoute.value
      //     useTreeConfig = dynamicPraseTree.getCurrentRouterTree(this.$router.currentRoute.value)
      //     this.useTreeConfig = useTreeConfig
      //   }

      //   let selfPosition = new SelfPosition(mySelfComponent.type)
      //   if (parent !== null) { // 内部组件的特殊情况。这里特殊处理
      //     selfPosition = findMySelfSequence(parent.$.subTree, mySelfComponent, selfPosition) ? selfPosition : selfPosition
      //   }
      //   selfPosition.setUniqueFlag(parent)
      //   this.selfPosition = selfPosition

      //   let needAuth = false
      //   let needDataAuth = false
      //   try {
      //     // eslint-disable-next-line no-eval
      //     const treeConfig = eval('useTreeConfig' + selfPosition.accessPath)
      //     if (treeConfig.uniqueFlag === selfPosition.uniqueFlag) {
      //       needAuth = treeConfig.needAuth
      //       needDataAuth = treeConfig.needDataAuth
      //       console.log('treeConfig', treeConfig)
      //     } else {
      //       // console.warn('运行时树与配置树不一致', selfPosition, useTreeConfig)
      //     }
      //   } catch (error) {
      //     // console.warn('运行时树与配置树不一致', selfPosition, useTreeConfig, error)
      //     needAuth = false
      //   }// 从这里要得到访问的准确路

      //  if (needDataAuth) { // 显示数据级弹框规则配置
      //   // if (typeName === 'ElTableColumn' && this.$props && this.$props.label === 'Operations') {
      //     // debugger
      //     const slot = this.$.slots.default
      //     // <el-button type="text" size="small">Edit</el-button> AuthRule ElButton
      //     const AuthRule = resolveComponent('AuthRule')
      //     const currentRowKey = this.$parent.currentRowKey

      //     const proxy = new Proxy(slot, {
      //       apply: function (target, ctx, args) {
      //       // 这一定是个数组
      //         return Reflect.apply(target, ctx, args).concat(
      //           h(AuthRule, { rowData: args, currentRowKey }, args))
      //       }
      //     })
      //     this.$.slots.default = proxy
      //   }
      // }

    })
  }

}
