<script setup>
import { ref, reactive } from 'vue'
import { register } from '../../api/user';
import { showError, processResponse, showSuccess } from '../../utils/message';
import { useRouter } from 'vue-router';
import { isLoading, openLoading, closeLoading } from '../../utils/loading'
//路由跳转使用
const router = useRouter();
const userInfo = reactive({
   username: "",
   password: "",
   email: ""
})

const handleRegister = async () => {
   //用户输入信息为空时错误提示
   if (!userInfo.username || !userInfo.password || !userInfo.email) {
      showError('请先输入注册信息')
      return
   }
   //使用processResponse统一处理
   openLoading()
   const result = await processResponse(register(userInfo), '注册成功')
   if (result.success) {
      closeLoading()
      router.push({ name: 'login' })
   } else {
      closeLoading()
   }
}
</script>

<template>
   <div class="main">
      <el-row justify="center" align="middle" style="height: 100vh;">
         <el-card style="width: 350px; max-width: 90%;">
            <!-- 卡片头部 -->
            <template #header>
               <div class="card-header">
                  <span>用户注册</span>
               </div>
            </template>

            <!-- 注册表单 -->
            <el-form label-position="left" label-width="auto" :model="userInfo" style="max-width: 600px">
               <el-form-item label="用户名">
                  <el-input v-model="userInfo.username" placeholder="请输入账号" />
               </el-form-item>
               <el-form-item label="密码">
                  <el-input v-model="userInfo.password" placeholder="请输入密码" clearable show-password />
               </el-form-item>
               <el-form-item label="邮箱">
                  <el-input v-model="userInfo.email" placeholder="请输入邮箱" />
               </el-form-item>
            </el-form>

            <div style="margin: 20px 0" />
            <div style="text-align: center;">
               <el-button :loading="isLoading" style="width: 65%;" @click="handleRegister"
                  @keyup.enter="handleRegister">注册</el-button>
            </div>
            <template #footer>
               已有账号？<router-link :to="{ name: 'login' }">点我去登录</router-link>
            </template>
         </el-card>
      </el-row>
   </div>
</template>

<style scoped>
el-card {
   box-shadow: 0 0 8px skyblue;
}
</style>