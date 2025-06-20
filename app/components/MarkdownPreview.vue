<script setup lang="ts">
import { isClient } from '@vueuse/core'
import { toPng } from 'html-to-image'
import { useResumeStore } from '~/stores/resume'
import useSettingsStore from '~/stores/settings'
import { autoPaginate, DEFAULT_CONFIG } from '~/utils/pagination'

const props = defineProps<{
  content: string
}>()

const theme = 'markdown-body'
const md = computed(() => useMarkdown(props.content))
const previewRef = ref<HTMLElement | null>(null)
const isShowMoveabled = ref(false)

async function exportToPDF() {
  if (!previewRef.value)
    return

  const wrapper = previewRef.value.querySelector('.rs-page-item-wrapper')
  if (!wrapper)
    return

  const pages = wrapper.querySelectorAll('.rs-page-item')
  if (pages.length === 0)
    return

  // 动态导入 jsPDF
  const { jsPDF: PDF } = await import('jspdf')

  // 创建 PDF 文档
  const pdf = new PDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
    compress: true,
  })

  // 遍历每一页
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i] as HTMLElement

    // 使用 html-to-image 转换页面
    const dataUrl = await toPng(page, {
      quality: 1.0,
      pixelRatio: 2,
      skipFonts: false,
      filter: () => {
        return true
      },
      style: {
        transform: 'none',
      },
    })

    // 计算尺寸
    const imgWidth = 595.28
    const imgHeight = 592.28 / page.offsetWidth * page.offsetHeight

    // 如果不是第一页，添加新页面
    if (i > 0) {
      pdf.addPage()
    }

    // 添加图片到 PDF
    pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight)
  }

  // 保存 PDF
  pdf.save('resume.pdf')
}

async function exportToImage() {
  if (!previewRef.value)
    return

  const wrapper = previewRef.value.querySelector('.rs-page-item-wrapper')
  if (!wrapper)
    return

  const pages = wrapper.querySelectorAll('.rs-page-item')
  if (pages.length === 0)
    return

  // 如果只有一页，直接导出
  if (pages.length === 1) {
    const dataUrl = await toPng(pages[0] as HTMLElement, {
      quality: 1.0,
      pixelRatio: 2,
      skipFonts: false,
      filter: () => true,
      style: {
        transform: 'none',
      },
    })

    // 创建下载链接
    const link = document.createElement('a')
    link.download = 'resume.png'
    link.href = dataUrl
    link.click()
    return
  }

  // 如果有多页，创建 zip 文件
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()

  // 遍历每一页并添加到 zip
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i] as HTMLElement
    const dataUrl = await toPng(page, {
      quality: 1.0,
      pixelRatio: 2,
      skipFonts: false,
      filter: () => true,
      style: {
        transform: 'none',
      },
    })

    // 将 base64 转换为 blob
    const base64Data = dataUrl.split(',')[1]
    const blob = await fetch(`data:image/png;base64,${base64Data}`).then(res => res.blob())

    // 添加到 zip
    zip.file(`resume-page-${i + 1}.png`, blob)
  }

  // 生成并下载 zip
  const content = await zip.generateAsync({ type: 'blob' })
  const link = document.createElement('a')
  link.download = 'resume-pages.zip'
  link.href = URL.createObjectURL(content)
  link.click()
}

// 监听内容变化
const resumeStore = useResumeStore()
const settingsStore = useSettingsStore()
// 提取重复逻辑为独立函数
function handleAutoPaginate() {
  nextTick(() => {
    setTimeout(() => {
      if (previewRef.value) {
        const wrapper = previewRef.value.querySelector('.rs-page-item-wrapper')
        if (wrapper) {
          autoPaginate(wrapper as HTMLElement, md.value.html, {
            ...DEFAULT_CONFIG,
            themeClass: theme,
            themeName: resumeStore.theme,
            padding: settingsStore.pagePadding,
          })
        }
      }
    }, 0)
  })
}

function bindImageClickEvent() {
  if (!previewRef.value)
    return

  // 使用事件委托监听 previewRef 内部所有 img[data-id-photo]
  previewRef.value.addEventListener('click', (event) => {
    const target = event.target as HTMLElement
    if (target.tagName.toLowerCase() === 'img' && target.hasAttribute('data-id-photo')) {
      isShowMoveabled.value = true
    }
    else {
      isShowMoveabled.value = false
    }
  })
}

const imagePositionStore = useImagePositionStore()

onMounted(() => {
  nextTick(() => {
    if (isClient) {
    // 设置全局 CSS 变量
      document.documentElement.style.setProperty('--id-photo-top', `${imagePositionStore.position.top}px`)
      document.documentElement.style.setProperty('--id-photo-left', `${imagePositionStore.position.left}px`)
      document.documentElement.style.setProperty('--id-photo-scale', imagePositionStore.position.scale.toString())
    }
  })
})

watch(() => [props.content, resumeStore.theme, settingsStore.pagePadding], () => {
  handleAutoPaginate()
})

onMounted(() => {
  handleAutoPaginate()
  bindImageClickEvent()
})

defineExpose({
  exportToPDF,
  exportToImage,
})
</script>

<template>
  <div class="preview-content py-10">
    <div ref="previewRef" class="preview-container">
      <PluginImageMoveable v-if="isShowMoveabled" />
      <div class="rs-page-item-wrapper" :class="theme" />
    </div>
  </div>
</template>

<style>
/* 分页样式 */
.rs-page-item-wrapper {
  width: fit-content !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.rs-page-item {
  position: relative;
  width: 794px;
  max-width: 794px;
  min-height: 1070px;
  max-height: 1070px;
  background: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: var(--resume-page-padding-size, '36px');
  overflow: hidden;
}

.rs-line-split {
  width: 794px;
  height: 1px;
  background: #ccc;
  position: relative;
}

.rs-line-split::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: -5px;
  height: 10px;
  background: linear-gradient(to right, transparent, #ccc, transparent);
}

/* 临时容器样式 */
.temp-container {
  position: absolute;
  visibility: hidden;
  pointer-events: none;
  width: 794px;
}

/* 导出按钮容器样式 */
.export-buttons {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 100;
  display: flex;
  gap: 10px;
}

#id-photo {
  position: absolute;
  z-index: 20;
  width: 140px;
  top: var(--id-photo-top, 66px);
  left: var(--id-photo-left, 391px);
  transform: scale(var(--id-photo-scale, '0.8 0.8'));
  border-radius: 6px;
}
</style>
