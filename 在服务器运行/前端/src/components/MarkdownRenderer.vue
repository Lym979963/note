<!-- components/MarkdownRenderer.vue -->
<template>
  <div class="markdown-renderer" v-html="renderedContent"></div>
</template>

<script setup>
import { computed } from 'vue'
import { marked } from 'marked'  // 需要安装：npm install marked
import hljs from 'highlight.js'  // 需要安装：npm install highlight.js
import 'highlight.js/styles/github.css' // 代码高亮样式

const props = defineProps({
  source: {
    type: String,
    default: ''
  }
})

// 配置 marked
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true,  // 支持换行符
  gfm: true      // 支持 GitHub 风格的 Markdown
})

// 将 Markdown 转换为 HTML
const renderedContent = computed(() => {
  return props.source ? marked(props.source) : ''
})
</script>

<style scoped>
.markdown-renderer {
  line-height: 1.7;
  font-size: 16px;
  color: #24292e;
}

/* Markdown 样式 */
.markdown-renderer :deep(h1) {
  font-size: 2em;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
}

.markdown-renderer :deep(h2) {
  font-size: 1.5em;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid #eaecef;
}

.markdown-renderer :deep(h3) {
  font-size: 1.25em;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.markdown-renderer :deep(h4) {
  font-size: 1em;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.markdown-renderer :deep(p) {
  margin: 1em 0;
}

.markdown-renderer :deep(blockquote) {
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
  margin: 1em 0;
}

.markdown-renderer :deep(ul),
.markdown-renderer :deep(ol) {
  padding-left: 2em;
  margin: 1em 0;
}

.markdown-renderer :deep(li) {
  margin: 0.25em 0;
}

.markdown-renderer :deep(pre) {
  background-color: #f6f8fa;
  border-radius: 6px;
  padding: 16px;
  overflow-x: auto;
  margin: 1em 0;
}

.markdown-renderer :deep(code) {
  background-color: rgba(27, 31, 35, 0.05);
  border-radius: 4px;
  padding: 0.2em 0.4em;
  font-size: 85%;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
}

.markdown-renderer :deep(pre code) {
  background-color: transparent;
  padding: 0;
  font-size: 100%;
}

.markdown-renderer :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.markdown-renderer :deep(th),
.markdown-renderer :deep(td) {
  padding: 6px 13px;
  border: 1px solid #dfe2e5;
}

.markdown-renderer :deep(tr:nth-child(2n)) {
  background-color: #f6f8fa;
}

.markdown-renderer :deep(img) {
  max-width: 100%;
  height: auto;
}

.markdown-renderer :deep(hr) {
  height: 0.25em;
  padding: 0;
  margin: 24px 0;
  background-color: #e1e4e8;
  border: 0;
}
</style>