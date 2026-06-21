<template>
  <el-config-provider :locale="locale" :size="size">
    <Layouts />
  </el-config-provider>
</template>

<script setup>
import Layouts from './layouts/index.vue'

const router = useRouter()

const { locale, size } = useWindowStateSync()

window.$preload.ipcRenderer.on('quit-before', async () => {
  ElLoading.service({
    lock: true,
    text: window.t('appClose.quit.loading'),
  })
})

const startApp = useStartApp()
const scheduleStore = useScheduleStore()

window.$preload.ipcRenderer.on('execute-arguments-change', async (event, params) => {
  startApp.open(params)
})

window.$preload.ipcRenderer.on('navigate-to-route', (event, route) => {
  router.push(route)
})

onMounted(() => {
  showTips()
  startApp.open()
  scheduleStore.recoverSchedules()
})

async function showTips() {
  const { getScrcpyPath } = window.$preload.configs || {}

  const scrcpyPath = getScrcpyPath?.({ store: window.$preload.store })

  if (scrcpyPath) {
    return false
  }

  ElMessageBox.alert(
    `<div>
      ${window.t('dependencies.lack.content', {
        name: '<a class="hover:underline text-primary-500" href="https://github.com/Genymobile/scrcpy" target="_blank">scrcpy</a>',
      })}
    <div>`,
    window.t('dependencies.lack.title'),
    {
      dangerouslyUseHTMLString: true,
    },
  )
}
</script>

<style lang="postcss">
:root {
  --tvr-bg: #020617;
  --tvr-panel: rgba(15, 23, 42, 0.82);
  --tvr-panel-strong: rgba(2, 6, 23, 0.92);
  --tvr-cyan: #22d3ee;
  --tvr-blue: #38bdf8;
  --tvr-violet: #818cf8;
  --tvr-line: rgba(34, 211, 238, 0.22);
  --tvr-text: #e5f7ff;
  --el-color-primary: #06b6d4;
  --el-color-primary-light-3: #22d3ee;
  --el-color-primary-light-5: #67e8f9;
  --el-color-primary-light-7: rgba(103, 232, 249, 0.34);
  --el-color-primary-light-8: rgba(103, 232, 249, 0.22);
  --el-color-primary-light-9: rgba(103, 232, 249, 0.14);
  --el-color-primary-dark-2: #0891b2;
  --el-border-radius-base: 6px;
  --el-border-radius-small: 4px;
  --el-fill-color-blank: rgba(15, 23, 42, 0.72);
  --el-bg-color: rgba(15, 23, 42, 0.82);
  --el-bg-color-overlay: rgba(15, 23, 42, 0.96);
  --el-border-color: rgba(34, 211, 238, 0.22);
  --el-border-color-light: rgba(125, 211, 252, 0.22);
  --el-text-color-primary: var(--tvr-text);
  --el-text-color-regular: #cbd5e1;
  --el-text-color-secondary: #94a3b8;
}

html,
body,
#app {
  background:
    radial-gradient(circle at 18% 12%, rgba(34, 211, 238, 0.2), transparent 28%),
    radial-gradient(circle at 88% 78%, rgba(129, 140, 248, 0.16), transparent 32%),
    linear-gradient(135deg, #020617 0%, #07111f 48%, #111827 100%);
  color: var(--tvr-text);
}

body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.24;
  background-image:
    linear-gradient(rgba(34, 211, 238, 0.18) 1px, transparent 1px),
    linear-gradient(90deg, rgba(34, 211, 238, 0.18) 1px, transparent 1px);
  background-size: 32px 32px;
  mask-image: radial-gradient(circle at center, #000 0%, transparent 78%);
}

.el-header,
.el-main,
.el-card,
.el-dialog,
.el-drawer,
.el-popover.el-popper,
.el-message-box,
.el-table,
.el-tabs--border-card {
  border-color: var(--tvr-line) !important;
  background: var(--tvr-panel) !important;
  box-shadow:
    0 22px 64px rgba(0, 0, 0, 0.36),
    inset 0 1px 0 rgba(255, 255, 255, 0.06) !important;
  backdrop-filter: blur(16px);
}

.el-dialog,
.el-message-box {
  overflow: hidden;
}

.el-dialog::before,
.el-message-box::before,
.el-card::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-top: 1px solid rgba(103, 232, 249, 0.36);
}

.el-dialog__header,
.el-message-box__header {
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(34, 211, 238, 0.16);
}

.el-dialog__title,
.el-message-box__title {
  color: #e0f2fe !important;
  font-weight: 700;
}

.el-button {
  border-color: rgba(34, 211, 238, 0.28);
  background: rgba(15, 23, 42, 0.68);
  color: #e0f2fe;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.el-button:hover {
  border-color: rgba(34, 211, 238, 0.72);
  color: #fff;
  box-shadow:
    0 0 18px rgba(34, 211, 238, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.el-button--primary {
  border-color: rgba(34, 211, 238, 0.74);
  background: linear-gradient(135deg, #0891b2, #2563eb) !important;
  color: #fff !important;
  box-shadow:
    0 0 22px rgba(34, 211, 238, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.16);
}

.el-button--primary:hover {
  background: linear-gradient(135deg, #06b6d4, #4f46e5) !important;
}

.el-input__wrapper,
.el-select__wrapper,
.el-textarea__inner {
  border: 1px solid rgba(34, 211, 238, 0.2);
  background: rgba(2, 6, 23, 0.58) !important;
  box-shadow: none !important;
}

.el-input__wrapper:hover,
.el-select__wrapper:hover,
.el-textarea__inner:hover,
.el-input__wrapper.is-focus,
.el-select__wrapper.is-focused {
  border-color: rgba(34, 211, 238, 0.6);
  box-shadow:
    0 0 0 1px rgba(34, 211, 238, 0.18),
    0 0 18px rgba(34, 211, 238, 0.16) !important;
}

.el-segmented {
  padding: 3px;
  border: 1px solid rgba(34, 211, 238, 0.22);
  background: rgba(2, 6, 23, 0.6) !important;
}

.el-segmented__item {
  color: #94a3b8;
}

.el-segmented__item-selected {
  color: #e0f2fe !important;
  background: linear-gradient(135deg, rgba(8, 145, 178, 0.72), rgba(37, 99, 235, 0.72)) !important;
  box-shadow: 0 0 18px rgba(34, 211, 238, 0.24);
}

.el-table tr,
.el-table th.el-table__cell {
  background: transparent !important;
}

.el-table__row:hover > td.el-table__cell {
  background: rgba(34, 211, 238, 0.08) !important;
}

.el-dropdown__popper,
.el-select__popper,
.el-picker__popper,
.el-popper.is-light {
  border-color: var(--tvr-line) !important;
  background: var(--tvr-panel-strong) !important;
  box-shadow: 0 18px 52px rgba(0, 0, 0, 0.42) !important;
}

.el-menu,
.el-collapse,
.el-collapse-item__header,
.el-collapse-item__wrap {
  border-color: rgba(34, 211, 238, 0.16) !important;
  background: transparent !important;
}
</style>
