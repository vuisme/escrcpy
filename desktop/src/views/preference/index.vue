<template>
  <div class="preference-console h-full flex flex-col overflow-hidden">
    <section class="preference-hero flex-none">
      <div class="min-w-0">
        <div class="hero-kicker">
          VR Stream Presets
        </div>
        <div class="hero-title">
          {{ $t('preferences.name') }}
        </div>
        <div class="hero-sub">
          Tune Quest crop, bitrate, codec and device behavior from a focused control panel.
        </div>
      </div>

      <div class="scope-panel">
        <div class="scope-label">
          Scope
        </div>
        <ScopeSelect
          v-model="deviceScope"
          @change="onScopeChange"
          @device-change="onDeviceChange"
        />
      </div>

      <div class="config-actions">
        <el-button :title="$t('common.import')" icon="Upload" @click="handleImport">
        </el-button>
        <el-button :title="$t('common.export')" icon="Download" @click="handleExport">
        </el-button>
        <el-button :title="$t('preferences.config.edit.name')" icon="Edit" @click="handleEdit">
        </el-button>
        <el-button :title="$t('preferences.config.reset.name')" icon="RefreshRight" @click="handleReset">
        </el-button>
      </div>
    </section>

    <div class="preference-body flex-1 min-h-0">
      <PreferenceForm
        v-model="preferenceData"
        v-bind="{
          deviceScope,
        }"
      >
      </PreferenceForm>

      <VrAppCatalog />
    </div>
  </div>
</template>

<script setup>
import { debounce } from 'lodash-es'

import PreferenceForm from '$/components/preference-form/index.vue'
import ScopeSelect from './components/scope-select/index.vue'
import VrAppCatalog from './components/vr-app-catalog/index.vue'

const preferenceStore = usePreferenceStore()
const themeStore = useThemeStore()

const preferenceData = computed({
  get() {
    return preferenceStore.data
  },
  set(value) {
    preferenceStore.data = value
  },
})

const deviceScope = computed({
  get() {
    return preferenceStore.deviceScope
  },
  set(value) {
    preferenceStore.setScope(value)
  },
})

function onDeviceChange(options) {
  const hasCurrentScope = options.some(item => item.value === deviceScope.value)

  if (hasCurrentScope)
    return false

  deviceScope.value = 'global'
}

async function handleReset() {
  try {
    await ElMessageBox.confirm(window.t('preferences.config.reset.tips'), window.t('common.tips'), {
      type: 'warning',
    })
  }
  catch (error) {
    return false
  }

  preferenceStore.reset(deviceScope.value)
}

function onScopeChange(value) {
  deviceScope.value = value
}

async function handleImport() {
  try {
    await window.$preload.ipcRenderer.invoke('show-open-dialog', {
      preset: 'replaceFile',
      filePath: window.$preload.store.getPath(),
      filters: [
        {
          name: window.t('preferences.config.import.placeholder'),
          extensions: ['json'],
        },
      ],
    })

    ElMessage.success(window.t('preferences.config.import.success'))
    preferenceStore.init()
  }
  catch (error) {
    if (error.message) {
      const message = error.message?.match(/Error: (.*)/)?.[1]
      ElMessage.warning(message || error.message)
    }
  }
}

function handleEdit() {
  window.$preload.store.openInEditor()
}

async function handleExport() {
  const message = ElMessage.loading(
    window.t('preferences.config.export.message'),
  )

  try {
    await window.$preload.ipcRenderer.invoke('show-save-dialog', {
      defaultPath: 'escrcpy-configs.json',
      filePath: window.$preload.store.getPath(),
      filters: [
        {
          name: window.t('preferences.config.export.placeholder'),
          extensions: ['json'],
        },
      ],
    })

    ElMessage.success(window.t('preferences.config.export.success'))
  }
  catch (error) {
    if (error.message) {
      const message = error.message?.match(/Error: (.*)/)?.[1]
      ElMessage.warning(message || error.message)
    }
  }

  message.close()
}

const handleSave = debounce(_handleSave, 500)

watch(() => JSON.stringify(preferenceData.value), () => {
  handleSave()
})

watch(() => preferenceData.value.theme, (val) => {
  themeStore.update(val)
})

function _handleSave() {
  preferenceStore.setData(preferenceData.value)
}
</script>

<style scoped lang="postcss">
.preference-console {
  gap: 10px;
}

.preference-hero {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(260px, 360px) auto;
  align-items: center;
  gap: 14px;
  min-height: 118px;
  padding: 18px 20px;
  border: 1px solid rgba(34, 211, 238, 0.2);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(2, 6, 23, 0.84), rgba(8, 47, 73, 0.68)),
    radial-gradient(circle at 88% 20%, rgba(34, 211, 238, 0.18), transparent 30%);
  box-shadow:
    0 22px 64px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.hero-kicker {
  color: #67e8f9;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.hero-title {
  margin-top: 6px;
  color: #f8fafc;
  font-size: 30px;
  font-weight: 900;
  line-height: 1.05;
}

.hero-sub {
  margin-top: 8px;
  color: #94a3b8;
  font-size: 13px;
}

.scope-panel {
  padding: 10px;
  border: 1px solid rgba(34, 211, 238, 0.16);
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.45);
}

.scope-label {
  margin-bottom: 8px;
  color: #7dd3fc;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.config-actions {
  display: grid;
  grid-template-columns: repeat(2, 42px);
  gap: 8px;
}

.config-actions :deep(.el-button) {
  width: 42px;
  height: 42px;
  margin: 0 !important;
  border-radius: 7px !important;
}

.preference-body {
  overflow: auto;
  padding-right: 4px;
}

:deep(.el-collapse) {
  display: grid;
  gap: 10px;
  border: 0 !important;
}

:deep(.el-collapse-item) {
  overflow: hidden;
  border: 1px solid rgba(34, 211, 238, 0.16);
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.62);
}

:deep(.el-collapse-item__header) {
  height: 46px;
  padding: 0 14px;
  color: #e0f2fe;
  font-weight: 800;
}

:deep(.el-collapse-item__content) {
  padding: 12px 14px 14px;
}

:deep(.el-collapse-item__arrow) {
  @apply w-2em;
}
</style>
