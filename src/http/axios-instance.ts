import axios from 'axios'
// import VueAxios from 'vue-axios'

// Set config defaults when creating the instance
const instance = axios.create({
  // baseURL: 'http://47.112.148.138:9000/'
  baseURL: 'http://localhost:9000/'
})

const f = () => {
  return Math.random() + ''
}
const q = f()
// Alter defaults after instance has been created
instance.defaults.headers.common.Authorization = q// 'xxx'

// AUTH_TOKEN
// instance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
// 覆写库的超时默认值
// 现在，在超时前，所有请求都会等待 2.5 秒
// instance.defaults.timeout = 2500;

// 添加请求拦截器
instance.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么
  // debugger
  // const a = config.data.data
  // const b = a.dataRule
  // delete a.dataRule
  // config.data.data = a
  // console.log(a, b)
  // debugger
  const currentUser = window.sessionStorage.getItem('currentUser')
  if (currentUser) {
    config.headers.token = JSON.parse(currentUser).id
  }

  return config
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error)
})

// // 添加响应拦截器
instance.interceptors.response.use(function (response) {
  // 对响应数据做点什么
  const responseData = response.data
  if (responseData.code === 200) {
    return responseData.data
  } else {
    alert(responseData.message)
  }
}, function (error) {
  // 对响应错误做点什么
  return Promise.reject(error)
})

export default instance
