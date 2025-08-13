<script setup >
import { ref } from 'vue'
import { useRouter } from 'vue-router';
const token = ref(localStorage.getItem('token'))
const router = useRouter()
const toUserInfo = () => {
    router.push({ name: 'userInfo' })
}
</script>

<template>
  <div class="content-main">

    <div class="content-left">
      <img src="../../public/vite.svg" alt="logo">
    </div>
    <div class="content-center"></div>
    <div calss="content-right"> <el-button type="primary" @click="toUserInfo">{{ token ? '用户中心': '注册/登录' }}</el-button> </div>

  </div>
</template>

<style scoped>
.content-main{
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #ffffff;
  box-shadow: 0 0 8px skyblue;
}
.content-left{
  display: flex;
  justify-content: left;
  width: 1200px;
}
</style>