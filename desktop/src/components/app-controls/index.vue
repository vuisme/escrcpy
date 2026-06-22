<template>
  <div class="app-controls *:app-region-no-drag" :class="background ? 'has-background' : ''">
    <el-button text plain circle class="app-control-button" :title="$t('window.minimize')" @click="onMinimizeClick">
      <template #icon>
        <i class="i-ph-minus"></i>
      </template>
    </el-button>
    <el-button text plain circle class="app-control-button" :title="$t(maximized ? 'window.restore' : 'window.maximize')" @click="onMaximizeClick">
      <template #icon>
        <i v-if="maximized" class="i-ph-copy-simple"></i>
        <i v-else class="i-ph-square"></i>
      </template>
    </el-button>
    <el-button text plain circle class="app-control-button is-close" :title="$t('window.close')" @click="onCloseClick">
      <template #icon>
        <i class="i-ph-x"></i>
      </template>
    </el-button>
  </div>
</template>

<script setup>
const props = defineProps({
  background: {
    type: Boolean,
    default: false,
  },
})

const maximized = ref(false)

let disposeWindowMaximizeSubscribe = null

onMounted(async () => {
  const { dispose } = await window.$preload.ipcxRenderer.invokeRetained(
    'window-is-maximized',
    (isMaximized) => {
      maximized.value = isMaximized
    })

  disposeWindowMaximizeSubscribe = dispose
})

onBeforeUnmount(() => {
  disposeWindowMaximizeSubscribe?.()
})

function onMinimizeClick() {
  window.$preload.ipcRenderer.invoke('window-minimize')
}

function onMaximizeClick() {
  window.$preload.ipcRenderer.invoke('window-maximize')
}

function onCloseClick() {
  window.$preload.ipcRenderer.invoke('window-close')
}
</script>

<style lang="postcss" scoped>
.app-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px;
  border: 1px solid rgba(34, 211, 238, 0.14);
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.36);
  backdrop-filter: blur(12px);
}

.app-controls.has-background {
  background: rgba(15, 23, 42, 0.92);
}

:deep(.app-control-button) {
  width: 34px;
  height: 30px;
  margin: 0 !important;
  border-radius: 6px !important;
  color: #bfdbfe !important;
}

:deep(.app-control-button:hover) {
  background: rgba(34, 211, 238, 0.16) !important;
  color: #fff !important;
}

:deep(.app-control-button.is-close:hover) {
  background: #ef4444 !important;
}
</style>
