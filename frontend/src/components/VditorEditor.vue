<template>
  <div class="vditor-editor">
    <h2>Vditor 编辑器示例</h2>
    
    <!-- 编辑器模式切换 -->
    <div class="mode-selector">
      <button 
        v-for="mode in modes" 
        :key="mode.value"
        :class="{ active: currentMode === mode.value }"
        @click="switchMode(mode.value)"
      >
        {{ mode.label }}
      </button>
    </div>

    <!-- Vditor编辑器容器 -->
    <div class="editor-container">
      <div ref="vditorRef" class="vditor-instance"></div>
    </div>

    <!-- 内容输出 -->
    <div class="content-output">
      <div class="output-section">
        <h4>Markdown内容：</h4>
        <pre class="markdown-content">{{ markdownContent }}</pre>
      </div>
      
      <div class="output-section">
        <h4>HTML预览：</h4>
        <div class="html-preview" v-html="htmlContent"></div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <button @click="getContent">获取内容</button>
      <button @click="setContent">设置内容</button>
      <button @click="clearContent">清空内容</button>
      <button @click="insertText">插入文本</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'

// 响应式数据
const vditorRef = ref(null)
const vditor = ref(null)
const markdownContent = ref('')
const htmlContent = ref('')
const currentMode = ref('wysiwyg')

// 编辑器模式选项
const modes = [
  { value: 'wysiwyg', label: '所见即所得' },
  { value: 'ir', label: '即时渲染' },
  { value: 'sv', label: '分屏预览' }
]

// 初始化编辑器
const initVditor = () => {
  if (vditor.value) {
    vditor.value.destroy()
  }

  vditor.value = new Vditor(vditorRef.value, {
    height: 400,
    mode: currentMode.value,
    placeholder: '请输入Markdown内容...',
    theme: 'classic',
    icon: 'ant',
    
    // 工具栏配置
    toolbar: [
      'emoji',
      'headings',
      'bold',
      'italic',
      'strike',
      'link',
      '|',
      'list',
      'ordered-list',
      'check',
      'outdent',
      'indent',
      '|',
      'quote',
      'line',
      'code',
      'inline-code',
      'insert-before',
      'insert-after',
      '|',
      'table',
      'undo',
      'redo',
      '|',
      'fullscreen',
      'edit-mode',
      {
        name: 'more',
        toolbar: [
          'both',
          'code-theme',
          'content-theme',
          'export',
          'outline',
          'preview',
          'devtools',
          'info',
          'help',
        ],
      }
    ],

    // 缓存配置
    cache: {
      enable: false
    },

    // 计数器
    counter: {
      enable: true,
      type: 'markdown'
    },

    // 预览配置
    preview: {
      delay: 1000,
      mode: 'both',
      url: '/api/markdown',
      parse: (element) => {
        if (element.style.display === 'none') {
          return
        }
        // 自定义预览处理
      }
    },

    // 上传配置
    upload: {
      accept: 'image/*,.mp3, .wav, .ogg',
      url: '/api/upload',
      linkToImgUrl: '/api/fetch',
      filename: (name) => name.replace(/[^(a-zA-Z0-9\u4e00-\u9fa5\.)]/g, '').replace(/[\?\\/:|<>\*\[\]\(\)\$%\{\}@~]/g, '').replace('/\\s/g', ''),
      success: (editor, msg) => {
        console.log('上传成功:', msg)
      },
      error: (msg) => {
        console.log('上传失败:', msg)
      }
    },

    // 内容变化回调
    input: (value) => {
      markdownContent.value = value
      htmlContent.value = vditor.value.getHTML()
    },

    // 编辑器准备完成回调
    after: () => {
      console.log('Vditor编辑器初始化完成')
      // 设置初始内容
      const initialContent = `# 欢迎使用 Vditor 编辑器

这是一个功能强大的 Markdown 编辑器，支持：

## 基础功能
- **粗体文本**
- *斜体文本*
- ~~删除线~~
- \`行内代码\`

## 列表
1. 有序列表项1
2. 有序列表项2
   - 无序子列表
   - 另一个子列表

## 代码块
\`\`\`javascript
function hello() {
  console.log('Hello Vditor!');
}
\`\`\`

## 表格
| 功能 | 支持 | 说明 |
|------|------|------|
| Markdown | ✅ | 完整支持 |
| 数学公式 | ✅ | KaTeX渲染 |
| 图表 | ✅ | Mermaid支持 |

## 数学公式
行内公式：$E = mc^2$

块级公式：
$$\\sum_{i=1}^{n} x_i = x_1 + x_2 + \\cdots + x_n$$

> 这是一个引用块，可以用来突出重要信息。

---

开始您的创作吧！ 🚀`

      vditor.value.setValue(initialContent)
      markdownContent.value = initialContent
      htmlContent.value = vditor.value.getHTML()
    }
  })
}

// 切换编辑器模式
const switchMode = (mode) => {
  currentMode.value = mode
  const content = vditor.value ? vditor.value.getValue() : ''
  initVditor()
  
  // 等待编辑器初始化完成后设置内容
  setTimeout(() => {
    if (content && vditor.value) {
      vditor.value.setValue(content)
    }
  }, 100)
}

// 获取内容
const getContent = () => {
  if (vditor.value) {
    const markdown = vditor.value.getValue()
    const html = vditor.value.getHTML()
    
    console.log('Markdown内容:', markdown)
    console.log('HTML内容:', html)
    
    markdownContent.value = markdown
    htmlContent.value = html
  }
}

// 设置内容
const setContent = () => {
  const newContent = `# 新设置的内容

这是通过 \`setValue\` 方法设置的新内容。

- 列表项1
- 列表项2

\`\`\`javascript
console.log('新内容设置成功！');
\`\`\``

  if (vditor.value) {
    vditor.value.setValue(newContent)
    markdownContent.value = newContent
    htmlContent.value = vditor.value.getHTML()
  }
}

// 清空内容
const clearContent = () => {
  if (vditor.value) {
    vditor.value.setValue('')
    markdownContent.value = ''
    htmlContent.value = ''
  }
}

// 插入文本
const insertText = () => {
  const textToInsert = '\n\n## 插入的新章节\n\n这是通过 `insertValue` 方法插入的文本。\n'
  
  if (vditor.value) {
    vditor.value.insertValue(textToInsert)
  }
}

// 组件挂载时初始化编辑器
onMounted(() => {
  // 使用nextTick确保DOM完全渲染
  nextTick(() => {
    initVditor()
  })
})

// 组件卸载时销毁编辑器
onBeforeUnmount(() => {
  if (vditor.value) {
    vditor.value.destroy()
  }
})
</script>

<style scoped>
.vditor-editor {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.mode-selector {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.mode-selector button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.mode-selector button:hover {
  background: #f5f5f5;
}

.mode-selector button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.editor-container {
  margin-bottom: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.content-output {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.output-section {
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
}

.output-section h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 5px;
}

.markdown-content {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.4;
  max-height: 200px;
  overflow-y: auto;
}

.html-preview {
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 4px;
  background: #fff;
  max-height: 200px;
  overflow-y: auto;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.actions button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.actions button:hover {
  background: #0056b3;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-output {
    grid-template-columns: 1fr;
  }
  
  .mode-selector {
    flex-wrap: wrap;
  }
  
  .actions {
    justify-content: center;
  }
}

/* Vditor编辑器样式调整 */
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
</style> 