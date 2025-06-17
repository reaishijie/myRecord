<template>
<el-skeleton :loading="loading" animated>
  <template #template>
    <el-skeleton-item variant="circle" style="width:40px; height:40px;" />
    <el-skeleton-item variant="h1" style="width:60%;" />
    <el-skeleton-item variant="h1"/>
    
    <el-skeleton-item variant="h2"  />
    <el-skeleton-item variant="h3"  />
    <el-skeleton-item variant="text" />
    <el-skeleton-item variant="p"  />
    <el-skeleton-item variant="p"  />
    <el-skeleton-item variant="p"  />
    <el-skeleton-item variant="p"  />
    <el-skeleton-item variant="p"  />

    <el-skeleton-item variant="image" style="width:100px; height:60px;" />
    <el-skeleton-item variant="button" style="width:90px;" />
  </template>
</el-skeleton>

  </template>
  
  <script lang="ts" setup>
  import { ref } from 'vue'
  
  const loading = ref(true)
  const currentDate = new Date().toDateString()
  </script>
  