<template>
  <div class="vditor-test">
    <h3>Vditor 测试</h3>
    <div ref="vditorContainer" style="height: 400px;"></div>
    <div v-if="error" class="error">
      错误信息: {{ error }}
    </div>
    <div v-if="isLoaded" class="success">
      ✅ Vditor 加载成功！
    </div>
  </div>
</template>

<script setup>
// Vue API 现在通过自动导入提供，无需手动导入
const vditorContainer = ref(null)
const vditor = ref(null)
const error = ref('')
const isLoaded = ref(false)

onMounted(async () => {
  try {
    // 动态导入Vditor
    const { default: Vditor } = await import('vditor')
    await import('vditor/dist/index.css')
    
    await nextTick()
    
    if (!vditorContainer.value) {
      throw new Error('容器元素未找到')
    }
    
    vditor.value = new Vditor(vditorContainer.value, {
      height: 360,
      mode: 'wysiwyg',
      placeholder: '测试Vditor编辑器...',
      theme: 'classic',
      toolbar: [
        'headings',
        'bold',
        'italic',
        '|',
        'list',
        'ordered-list',
        '|',
        'link',
        'code',
        '|',
        'undo',
        'redo'
      ],
      cache: {
        enable: false
      },
      after: () => {
        console.log('Vditor初始化成功')
        isLoaded.value = true
        vditor.value.setValue('# 测试成功！\n\n这是一个Vditor测试编辑器。')
      }
    })
    
  } catch (err) {
    console.error('Vditor初始化失败:', err)
    error.value = err.message
  }
})

onBeforeUnmount(() => {
  if (vditor.value) {
    try {
      vditor.value.destroy()
    } catch (err) {
      console.error('销毁Vditor时出错:', err)
    }
  }
})
</script>

<style scoped>
.vditor-test {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.error {
  margin-top: 20px;
  padding: 10px;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  color: #c33;
}

.success {
  margin-top: 20px;
  padding: 10px;
  background-color: #efe;
  border: 1px solid #cfc;
  border-radius: 4px;
  color: #3c3;
}
</style> 