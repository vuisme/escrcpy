<template>
  <div>
    <slot :trigger="show" />

    <el-dialog
      v-model="visible"
      :title="$t('tvr.vrApps.title')"
      width="86%"
      append-to-body
      destroy-on-close
      @open="refreshInstalledApps"
    >
      <div class="vr-apps space-y-4">
        <div class="flex gap-3 flex-wrap items-center">
          <el-input
            v-model="filterName"
            class="vr-filter-control"
            clearable
            :placeholder="$t('tvr.vrApps.searchPlaceholder')"
          />

          <el-select
            v-model="filterComfort"
            class="vr-filter-control"
            clearable
            :placeholder="$t('tvr.vrApps.comfortPlaceholder')"
          >
            <el-option label="Thoải mái" value="Thoải mái" />
            <el-option label="Bình thường" value="Bình thường" />
            <el-option label="Chóng mặt" value="Chóng mặt" />
          </el-select>
        </div>

        <div v-loading="loading" class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
          <el-card
            v-for="app in filteredApps"
            :key="app.packageName"
            class="vr-app-card"
            body-class="h-full flex flex-col p-0"
          >
            <div class="vr-app-cover">
              <img
                v-if="getImageSrc(app)"
                :src="getImageSrc(app)"
                :alt="app.name"
              >
              <div v-else class="vr-app-cover-fallback">
                {{ app.name }}
              </div>
            </div>

            <div class="flex flex-col gap-3 p-4 flex-1">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="font-600 truncate text-base">
                    {{ app.name }}
                  </div>
                  <div class="text-xs text-gray-500 mt-1 truncate">
                    {{ app.packageName }}
                  </div>
                </div>

                <el-tag :type="getComfortType(app.comfort)" effect="dark">
                  {{ getComfortLabel(app.comfort) }}
                </el-tag>
              </div>

              <p class="text-sm leading-5 flex-1 line-clamp-3">
                {{ app.description }}
              </p>

              <div class="flex gap-2">
                <el-button
                  type="primary"
                  class="flex-1"
                  :loading="startingPackage === app.packageName"
                  @click="openApp(app)"
                >
                  {{ $t('tvr.vrApps.openGame') }}
                </el-button>

                <el-button
                  v-if="getVideoSrc(app)"
                  :icon="VideoPlay"
                  @click="previewVideo(app)"
                >
                  {{ $t('tvr.vrApps.video') }}
                </el-button>
              </div>
            </div>
          </el-card>
        </div>

        <AppEmpty v-if="!loading && filteredApps.length === 0" />
      </div>
    </el-dialog>

    <el-dialog
      v-model="videoVisible"
      :title="activeVideoApp?.name || $t('tvr.vrApps.video')"
      width="720px"
      append-to-body
      destroy-on-close
    >
      <video
        v-if="activeVideoApp && isLocalVideo(activeVideoApp)"
        class="vr-video"
        :src="getVideoSrc(activeVideoApp)"
        controls
        autoplay
      />

      <div v-else class="flex justify-center">
        <el-button type="primary" :icon="VideoPlay" @click="openExternalVideo">
          {{ $t('tvr.vrApps.openVideo') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { VideoPlay } from '@element-plus/icons-vue'
import { useStartApp } from '$/hooks/useStartApp/index.js'
import AppEmpty from '$/components/app-empty/index.vue'
import { getStoredVrApps } from '$/utils/vr-app-catalog/index.js'

const props = defineProps({
  device: {
    type: Object,
    default: () => ({}),
  },
})
const imageAssets = import.meta.glob('../../../../electron/resources/build/img/*', {
  eager: true,
  query: '?url',
  import: 'default',
})
const videoAssets = import.meta.glob('../../../../electron/resources/build/video/*', {
  eager: true,
  query: '?url',
  import: 'default',
})

const visible = ref(false)
const loading = ref(false)
const filterName = ref('')
const filterComfort = ref('')
const installedApps = ref([])
const startingPackage = ref('')
const videoVisible = ref(false)
const activeVideoApp = ref(null)
const startApp = useStartApp()

const imageAssetMap = createAssetMap(imageAssets)
const videoAssetMap = createAssetMap(videoAssets)

const filteredApps = computed(() => {
  const name = filterName.value.trim().toLowerCase()
  const comfort = filterComfort.value

  return installedApps.value.filter((app) => {
    const nameMatched = !name || app.name.toLowerCase().includes(name)
    const comfortMatched = !comfort || app.comfort === comfort

    return nameMatched && comfortMatched
  })
})

function show() {
  visible.value = true
}

async function refreshInstalledApps() {
  loading.value = true

  try {
    const catalogApps = getStoredVrApps()
    const apps = await Promise.all(catalogApps.map(async (app) => {
      const installed = await window.$preload.adb
        .isInstalled(props.device.id, app.packageName)
        .catch(() => false)

      return installed ? app : null
    }))

    const installed = apps.filter(Boolean)

    installedApps.value = installed

    const appsWithDeviceIcons = await Promise.all(installed.map(async (app) => {
      const deviceIcon = await window.$preload.adb
        .getAppIcon(props.device.id, app.packageName)
        .catch(() => '')

      return {
        ...app,
        deviceIcon,
      }
    }))

    installedApps.value = appsWithDeviceIcons
  }
  finally {
    loading.value = false
  }
}

async function openApp(app) {
  startingPackage.value = app.packageName

  try {
    await startApp.open({
      deviceId: props.device.id,
      appName: app.name,
      packageName: app.packageName,
      activity: app.runName,
      useNewDisplay: false,
    })

    visible.value = false
  }
  finally {
    startingPackage.value = ''
  }
}

function openVideo(url) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

function previewVideo(app) {
  activeVideoApp.value = app
  videoVisible.value = true
}

function openExternalVideo() {
  if (activeVideoApp.value?.video) {
    openVideo(activeVideoApp.value.video)
  }
}

function createAssetMap(modules) {
  return Object.entries(modules).reduce((map, [path, url]) => {
    const name = path.split('/').pop()
    map[name] = url
    return map
  }, {})
}

function getAssetName(value = '') {
  return value.split(/[\\/]/).pop()
}

function getImageSrc(app) {
  if (app.deviceIcon) {
    return app.deviceIcon
  }

  const iconName = getAssetName(app.icon)
  return imageAssetMap[iconName]
}

function getVideoSrc(app) {
  const iconName = getAssetName(app.icon || '')
  const baseName = iconName.replace(/\.[^.]+$/, '')

  return videoAssetMap[`${baseName}.mp4`] || app.video
}

function isLocalVideo(app) {
  return Object.values(videoAssetMap).includes(getVideoSrc(app))
}

function getComfortType(value) {
  return {
    'Thoải mái': 'success',
    'Bình thường': 'warning',
    'Chóng mặt': 'danger',
  }[value] || 'info'
}

function getComfortLabel(value) {
  return {
    'Thoải mái': 'Dễ chịu',
    'Bình thường': 'Bình thường',
    'Chóng mặt': 'Khó chịu',
  }[value] || value
}
</script>

<style scoped>
.vr-app-card {
  min-height: 360px;
  overflow: hidden;
}

.vr-filter-control {
  width: 260px;
}

.vr-app-cover {
  height: 160px;
  overflow: hidden;
  background: #111827;
}

.vr-app-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.vr-app-cover-fallback {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: #fff;
  text-align: center;
  font-weight: 600;
  background: linear-gradient(135deg, #1f2937, #0f766e);
}

.vr-video {
  width: 100%;
  max-height: 70vh;
  background: #000;
}

@media (max-width: 720px) {
  .vr-filter-control {
    width: 100%;
  }
}
</style>
