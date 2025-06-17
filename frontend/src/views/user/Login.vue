<script setup>
import { reactive } from 'vue'
import { login } from '../../api/user'
import { showError, showSuccess, processResponse } from '../../utils/message'
import { useRouter } from 'vue-router';
import { setToken, setUserInfo } from '../../utils/auth';
import { isLoading, openLoading, closeLoading } from '../../utils/loading';
const router = useRouter();
const userInfo = reactive({
   username: "",
   password: ""
})
//处理登录
const handleLogin = async () => {
   if (!userInfo.username || !userInfo.password) {
      showError('请输入登录信息')
      return
   }
   openLoading()
   const result = await processResponse(login(userInfo), '登录成功')
   if (result.success) {
      //将token、用户信息 存储在本地
      setToken(result.data.token)
      setUserInfo(result.data)
      closeLoading()
      router.push({ name: 'userInfo' })
   } else {
      closeLoading()
   }
}
</script>

<template>
   <div class="">
      <el-row justify="center" align="middle" style="height: 100vh;">
         <el-card style="width: 350px; max-width: 90%;">
            <!-- 卡片头部 -->
            <template #header>
               <div class="card-header">
                  <span>用户登录</span>
               </div>
            </template>
            <!-- 登录表单 -->
            <el-form label-position="left" label-width="auto" :model="userInfo" style="max-width: 600px">
               <el-form-item label="用户名" >
                  <el-input v-model="userInfo.username" placeholder="请输入账号" />
               </el-form-item>
               <el-form-item label="密码">
                  <el-input v-model="userInfo.password" placeholder="请输入密码" clearable show-password />
               </el-form-item>
            </el-form>

            <div style="margin: 20px 0" />
            <div style="text-align: center;">
               <el-button :loading="isLoading" style="width: 65%;" @click="handleLogin">登 录</el-button>
            </div>
            <template #footer>
               还没有账号？<router-link :to="{ name: 'register' }">点我去注册</router-link>
            </template>
         </el-card>
      </el-row>
   </div>
</template>

<style scoped></style>