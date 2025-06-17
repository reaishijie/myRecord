<!-- <script setup >
import {  } from 'vue'
</script>

<template>
    <h3>demo information</h3>
  <el-button>测试按钮</el-button>
  
</template>

<style scoped>
  
</style> -->


<!-- 
<template>
  <el-button @click="openLoading">打开全局 Loading</el-button>
</template>

<script setup>
import { ElLoading } from 'element-plus'

function openLoading() {
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '加载中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  setTimeout(() => {
    loadingInstance.close()
  }, 2000)
}
</script> -->

<!-- <template>
  <el-skeleton :rows="5" />
</template> -->


<template>
<el-skeleton :rows="5" animated style="width: 240px;" />

  <el-button @click="openLoading">全屏 Loading</el-button>
  <div ref="myBox" style="width:300px;height:150px;border:1px solid #ccc;margin-top:20px;">
    <el-button @click="openBoxLoading">局部 Loading</el-button>
    这里是局部区域
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { ElLoading } from 'element-plus'

let loadingInstance = null
const myBox = ref(null)

// 全屏 loading
function openLoading() {
  loadingInstance = ElLoading.service({
    lock: true,
    text: '全屏加载中...',
    background: 'rgba(0, 0, 0, 0.7)'
 })
  setTimeout(() => loadingInstance.close(), 2000)
}

// 局部 loading
function openBoxLoading() {
  loadingInstance = ElLoading.service({
    target: myBox.value,
    text: '局部加载中...'
  })
  setTimeout(() => loadingInstance.close(), 2000)
}

// 防止组件卸载时 loading 未关闭
onUnmounted(() => {
  if (loadingInstance) loadingInstance.close()
})
</script>



