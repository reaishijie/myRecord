<script setup >
import {  } from 'vue'
</script>

<template>
  <div class="content-main">

    <div class="content-left">
      <img src="../../public/vite.svg" alt="logo">456
    </div>
    <div class="content-center">789</div>
    <div calss="content-right">123</div>

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