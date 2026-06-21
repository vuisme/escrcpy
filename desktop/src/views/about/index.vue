<template>
  <div class="about-vr h-full overflow-hidden">
    <div class="relative h-full px-6 py-8 lg:px-10 lg:py-10">
      <div class="absolute inset-0 about-vr-grid"></div>

      <div class="relative h-full flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
        <div class="about-logo-wrap">
          <img src="$electron/resources/build/logo.png" class="about-logo" alt="TheVisionReality" />
        </div>

        <div class="about-panel">
          <div class="text-sm uppercase tracking-[0.28em] text-cyan-300">
            VR Control Console
          </div>

          <h1 class="mt-3 text-4xl lg:text-6xl font-800 text-white">
            TheVisionReality
          </h1>

          <p class="mt-4 text-base lg:text-lg leading-7 text-slate-200">
            {{ $t("about.description") }}
          </p>

          <div class="mt-6 grid grid-cols-3 gap-3">
            <div class="about-stat">
              <div class="about-stat-value">
                Quest
              </div>
              <div class="about-stat-label">
                VR Ready
              </div>
            </div>
            <div class="about-stat">
              <div class="about-stat-value">
                Scrcpy
              </div>
              <div class="about-stat-label">
                Mirror Core
              </div>
            </div>
            <div class="about-stat">
              <div class="about-stat-value">
                v{{ version }}
              </div>
              <div class="about-stat-label">
                Build
              </div>
            </div>
          </div>

          <div class="mt-8 flex flex-wrap gap-3">
            <el-button
              :loading="loading"
              type="primary"
              :size="$grid.lg ? 'large' : 'default'"
              @click="handleUpdate"
            >
              {{
                loading && percent
                  ? `${$t("about.update.progress")}...（${percent.toFixed(1)}%）`
                  : $t("about.update")
              }}
            </el-button>

            <el-button :size="$grid.lg ? 'large' : 'default'" @click="onProjectClick">
              Mở trang dự án
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <UpdateDialog ref="updateDialogRef" />
  </div>
</template>

<script setup>
import { homepage, version } from '/package.json'
import UpdateDialog from './components/update-dialog/index.vue'

const loading = ref(false)
const percent = ref(0)
const updateDialogRef = ref()

function onProjectClick() {
  window.open(homepage)
}

function handleUpdate() {
  loading.value = true
  window.$preload.ipcRenderer.send('check-for-update')
}

function onUpdateNotAvailable() {
  window.$preload.ipcRenderer.on('update-not-available', () => {
    loading.value = false
    ElMessage.success(window.t('about.update-not-available'))
  })
}

function onDownloadProgress() {
  window.$preload.ipcRenderer.on('download-progress', (event, ret) => {
    percent.value = ret.percent
  })
}

function onUpdateDownloaded() {
  window.$preload.ipcRenderer.on('update-downloaded', async () => {
    loading.value = false
    try {
      await ElMessageBox.confirm(
        window.t('about.update-downloaded.message'),
        window.t('about.update-downloaded.title'),
        {
          confirmButtonText: window.t('about.update-downloaded.confirm'),
          cancelButtonText: window.t('common.cancel'),
          closeOnClickModal: false,
        },
      )
      window.$preload.ipcRenderer.send('quit-and-install')
    }
    catch (error) {
      console.warn(error.message)
    }
  })
}

function onUpdateError() {
  window.$preload.ipcRenderer.on('update-error', async (_, ret) => {
    loading.value = false
    try {
      await ElMessageBox.confirm(
        window.t('about.update-error.message'),
        window.t('about.update-error.title'),
        {
          closeOnClickModal: false,
          type: 'error',
        },
      )
      window.open(homepage)
    }
    catch (error) {
      console.warn(error.message)
    }
  })
}

function onUpdateAvailable() {
  window.$preload.ipcRenderer.on('update-available', async (_, ret) => {
    loading.value = false

    updateDialogRef.value.open({
      releaseNotes: ret.releaseNotes,
      onConfirm() {
        window.$preload.ipcRenderer.send('download-update')
        loading.value = true
      },
    })
  })
}

onMounted(() => {
  onUpdateNotAvailable()
  onUpdateAvailable()
  onDownloadProgress()
  onUpdateDownloaded()
  onUpdateError()
})
</script>

<style scoped>
.about-vr {
  background:
    radial-gradient(circle at 20% 18%, rgba(6, 182, 212, 0.3), transparent 28%),
    radial-gradient(circle at 82% 72%, rgba(14, 165, 233, 0.22), transparent 34%),
    linear-gradient(135deg, #020617 0%, #0f172a 48%, #111827 100%);
}

.about-vr-grid {
  opacity: 0.28;
  background-image:
    linear-gradient(rgba(34, 211, 238, 0.18) 1px, transparent 1px),
    linear-gradient(90deg, rgba(34, 211, 238, 0.18) 1px, transparent 1px);
  background-size: 34px 34px;
  mask-image: radial-gradient(circle at center, #000 0%, transparent 72%);
}

.about-logo-wrap {
  width: min(42vh, 420px);
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 0 28px rgba(34, 211, 238, 0.38));
}

.about-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.about-panel {
  width: min(680px, 100%);
  padding: 28px;
  border: 1px solid rgba(34, 211, 238, 0.28);
  background: rgba(15, 23, 42, 0.72);
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(18px);
}

.about-stat {
  min-width: 0;
  padding: 14px;
  border: 1px solid rgba(125, 211, 252, 0.2);
  background: rgba(2, 6, 23, 0.46);
}

.about-stat-value {
  color: #e0f2fe;
  font-weight: 700;
  line-height: 1.2;
}

.about-stat-label {
  margin-top: 4px;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.3;
}
</style>
