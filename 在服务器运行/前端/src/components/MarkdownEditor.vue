<!-- components/MarkdownEditor.vue -->
<template>
  <div class="markdown-editor">
    <div ref="editorRef" class="vditor-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import request from '@/utils/request' 
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  height: {
    type: Number,
    default: 500
  },
  placeholder: {
    type: String,
    default: '开始写作...'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])
const editorRef = ref(null)
let vditor = null

// 初始化编辑器
onMounted(() => {
  vditor = new Vditor(editorRef.value, {
    height: props.height,
    mode: 'ir',  // 所见即所得模式
    placeholder: props.placeholder,
    value: props.modelValue,
    toolbar: [
      'emoji',
      'headings',
      'bold',
      'italic',
      'strike',
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
      'link',
      '|',
      'undo',
      'redo',
      '|',
      'edit-mode',
      'content-theme',
      'code-theme',
      'export'
    ],
    toolbarConfig: {
      pin: true
    },
    cache: {
      enable: false
    },
    upload: {
      url: '/upload',  // 你的上传接口
      multiple: true,    
      filename: 'file',
      accept: 'image/*',
      handler(files) {
        // 自定义上传逻辑
        return new Promise((resolve, reject) => {
          const formData = new FormData()
          formData.append('file', files[0])
          
          request({
            url: '/upload/image',
            method: 'post',
            data: formData,
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }).then(res => {
            resolve({
              url: res.data  // 假设返回的图片URL在 data 里
            })
          }).catch(() => {
            reject(new Error('上传失败'))
          })
        })
      }
    },
    input: (value) => {
      emit('update:modelValue', value)
      emit('change', value)
    },
    after: () => {
      // 编辑器初始化完成
    }
  })
})

// 监听外部 v-model 变化
watch(() => props.modelValue, (newVal) => {
  if (vditor && newVal !== vditor.getValue()) {
    vditor.setValue(newVal)
  }
})

// 组件销毁时清理
onBeforeUnmount(() => {
  vditor?.destroy()
})

// 暴露方法给父组件
defineExpose({
  getValue: () => vditor?.getValue(),
  setValue: (val) => vditor?.setValue(val),
  insertValue: (val) => vditor?.insertValue(val),
  focus: () => vditor?.focus()
})
</script>

<style scoped>
.markdown-editor {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.vditor-container {
  width: 100%;
}
</style>