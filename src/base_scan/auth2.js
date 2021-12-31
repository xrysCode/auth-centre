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
    COMPONENT = 6  这是一个有毒的数字  6=4+2~~~~
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

    this.isFunNode = false
    this.props = null
    // 指令
    if (vNode.dirs && vNode.el.fun === 'fun-flag') { // 有的带有指令，但是却没有作用于元素
      const funArr = vNode.dirs
      for (let i = 0; i < funArr.length; i++) {
        const dir = funArr[i]
        if (dir.modifiers.props) {
          this.isFunNode = true
          this.props = {}
          if (dir.value instanceof Array) {
            dir.value.forEach(propName => {
              this.props[propName] = vNode.props[propName]
            })
          }
          break
        }
      }
    }
    // 组件自声明名
    if (_vComponent.type.funFlag) {
      this.isFunNode = true
      this.props = {}
      if (_vComponent.type.funFlag instanceof Array) {
        _vComponent.type.funFlag.forEach(propName => {
          this.props[propName] = vNode.props[propName]
        })
      }
    }

    this.initRouter = _vComponent.ctx.initRouter// 初始化的路由
    this.initRequest = _vComponent.initRequest// 初始化的api

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
      isFunNode: this.isFunNode,

      props: this.props,
      initRouter: this.initRouter,
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

export default {

  install: (app, options) => {
    // 全局注册相关的组件
    // app.component('AuthRule', AuthRule)
    // debugger
    const msgNotify = new EachOtherNotify(app)
    msgNotify.registerWindownEventListener()
    // 指令 用于扫描过滤，和拦截两用。
    app.directive('fun', {
      // 在绑定元素的 attribute 或事件监听器被应用之前调用
      created (el, binding, vnode, prevNode) {
        // debugger
        const _this = binding.instance
        const value = binding.value
        vnode.funArr = value
        el.fun = 'fun-flag'
        console.log(_this, vnode.el === el)
      }//,      // beforeMount (el, binding, vnode, prevNode) {
      //   // el.style.backgroundColor = 'red'
      //   console.log(el)
      // },
      // // 绑定元素的父组件被挂载时调用

      // mounted (el, binding, vnode, prevNode) {
      //   console.log(el)
      // }
      // // 在包含组件的 VNode 更新之前调用
      // beforeUpdate (el, binding, vnode, prevNode) {
      //   console.log(el)
      // }

    })

    // 动态添加参数，找出初始化的接口api

    // 注入全局混入代理  这里对比是否需要拦截或者展示auth按钮配置
    // 默认开启
    app.mixin({
      beforeCreate () {
        // this.componentModule = new ComponentModule(this)
        // DOM 尚未更新
        this.$nextTick(function () {
        // DOM 现在更新了
        // `this` 被绑定到当前实例
          this.initRouter = { ...this.$router.currentRoute.value, matched: '忽略' }// new InitRouter(this.$router.currentRoute)
        })

        // console.log('beforeCreate', this)
      }
      // const parent = this.$parent
      // const mySelfComponent = this.$

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

      //   if (needAuth) { // 组件优先级最高 && vc.props.label === 'Operations' typeName === 'RouterLink'
      //     const target = mySelfComponent.render
      //     const handler = {
      //       apply: function (target, ctx, args) {
      //         if (!needAuth) {
      //           return Reflect.apply(target, ctx, args)
      //         } else { // 组件不需要渲染，这时它可以返回 null。这样我们在 DOM 中会渲染一个注释节点。
      //           return null
      //         }
      //       }
      //     }
      //     const proxy = new Proxy(target, handler)
      //     mySelfComponent.render = proxy
      //     console.log(this, target)
      //   } else if (needDataAuth) { // 显示数据级弹框规则配置
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
