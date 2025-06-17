<template>
  <div class="vditor-simple">
    <h3>简单的Vditor使用示例</h3>
    
    <!-- 基础编辑器 -->
    <div class="editor-section">
      <h4>基础Markdown编辑器</h4>
      <div ref="basicEditor" class="editor-container"></div>
    </div>

    <!-- 表单集成示例 -->
    <div class="form-section">
      <h4>表单集成示例</h4>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label>文章标题:</label>
          <input v-model="formData.title" type="text" placeholder="输入文章标题" />
        </div>
        
        <div class="form-group">
          <label>文章内容:</label>
          <div ref="formEditor" class="editor-container"></div>
        </div>
        
        <div class="form-group">
          <label>标签:</label>
          <input v-model="formData.tags" type="text" placeholder="输入标签，用逗号分隔" />
        </div>
        
        <button type="submit">发布文章</button>
      </form>
      
      <div v-if="submittedData" class="submitted-result">
        <h4>提交结果:</h4>
        <p><strong>标题:</strong> {{ submittedData.title }}</p>
        <p><strong>标签:</strong> {{ submittedData.tags }}</p>
        <div><strong>Markdown内容:</strong></div>
        <pre class="markdown-output">{{ submittedData.markdown }}</pre>
        <div><strong>HTML预览:</strong></div>
        <div class="html-output" v-html="submittedData.html"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Vue API 通过自动导入提供，无需手动导入
import Vditor from 'vditor'
import 'vditor/dist/index.css'

// 编辑器实例
const basicEditor = ref(null)
const formEditor = ref(null)
const basicVditor = ref(null)
const formVditor = ref(null)

// 表单数据
const formData = ref({
  title: '',
  content: '',
  tags: ''
})

const submittedData = ref(null)

// 初始化基础编辑器
const initBasicEditor = () => {
  basicVditor.value = new Vditor(basicEditor.value, {
    height: 300,
    mode: 'wysiwyg',
    placeholder: '开始编写您的Markdown内容...',
    theme: 'classic',
    
    // 简化的工具栏
    toolbar: [
      'headings',
      'bold',
      'italic',
      'strike',
      '|',
      'list',
      'ordered-list',
      'check',
      '|',
      'quote',
      'code',
      'inline-code',
      '|',
      'link',
      'table',
      '|',
      'undo',
      'redo',
      'fullscreen'
    ],

    cache: {
      enable: false
    },

    counter: {
      enable: true
    },

    after: () => {
      const initialContent = `# 欢迎使用Vditor

这是一个简化的Markdown编辑器示例。

## 支持的功能
- **粗体** 和 *斜体*
- [链接](https://github.com/Vanessa219/vditor)
- \`行内代码\`

\`\`\`javascript
// 代码块
console.log('Hello Vditor!');
\`\`\`

> 引用文本

- 列表项1
- 列表项2`

      basicVditor.value.setValue(initialContent)
    }
  })
}

// 初始化表单编辑器
const initFormEditor = () => {
  formVditor.value = new Vditor(formEditor.value, {
    height: 250,
    mode: 'ir', // 即时渲染模式
    placeholder: '请输入文章内容...',
    theme: 'classic',
    
    toolbar: [
      'headings',
      'bold',
      'italic',
      '|',
      'list',
      'ordered-list',
      '|',
      'quote',
      'code',
      '|',
      'link',
      'table',
      '|',
      'undo',
      'redo'
    ],

    cache: {
      enable: false
    },

    input: (value) => {
      formData.value.content = value
    },

    after: () => {
      console.log('表单编辑器初始化完成')
    }
  })
}

// 提交表单
const submitForm = () => {
  if (!formData.value.title.trim()) {
    alert('请输入文章标题')
    return
  }

  const markdown = formVditor.value.getValue()
  const html = formVditor.value.getHTML()

  submittedData.value = {
    title: formData.value.title,
    tags: formData.value.tags,
    markdown: markdown,
    html: html,
    timestamp: new Date().toLocaleString()
  }

  console.log('表单提交:', submittedData.value)
  
  // 这里可以发送到后端API
  // await api.createArticle(submittedData.value)
}

// 组件挂载
onMounted(() => {
  // 使用nextTick确保DOM完全渲染
  nextTick(() => {
    initBasicEditor()
    initFormEditor()
  })
})

// 组件卸载
onBeforeUnmount(() => {
  if (basicVditor.value) {
    basicVditor.value.destroy()
  }
  if (formVditor.value) {
    formVditor.value.destroy()
  }
})
</script>

<style scoped>
.vditor-simple {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.editor-section,
.form-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
}

.editor-section h4,
.form-section h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 8px;
}

.editor-container {
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

button {
  background: #007bff;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

button:hover {
  background: #0056b3;
}

.submitted-result {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #28a745;
}

.submitted-result h4 {
  margin-top: 0;
  color: #28a745;
}

.markdown-output {
  background: #f1f3f4;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.4;
  max-height: 150px;
  overflow-y: auto;
  margin: 10px 0;
}

.html-output {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 4px;
  background: white;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 10px;
}

/* Vditor样式调整 */
:deep(.vditor) {
  border: none;
}

:deep(.vditor-toolbar) {
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

:deep(.vditor-content) {
  background: #fff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .vditor-simple {
    padding: 10px;
  }
  
  .editor-section,
  .form-section {
    padding: 15px;
  }
}
</style> 