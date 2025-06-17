import { ref } from 'vue'
import { ElLoading } from 'element-plus' //全局遮罩加载

//加载组件加载
const isLoading = ref(false)
const openLoading = () => {
   isLoading.value = true
}
const closeLoading = () => {
   isLoading.value = false
}

let loadingInstance = null
//全屏加载
function fullLoading() {
   //创建加载实例
   loadingInstance = ElLoading.service({
      lock:true,
      text: '正在加载中...',
      background: 'rgba(0, 0, 0, 0.7)'
   })
}
//关闭全屏加载
function closeFullLoading() {
   loadingInstance.close()
}

// 防止组件卸载时 loading 未关闭，在组件中使用
// onUnmounted(() => {
//    if (loadingInstance) loadingInstance.close()
//  })

export { isLoading, openLoading, closeLoading, fullLoading, closeFullLoading }