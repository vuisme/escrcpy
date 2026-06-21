<template>
  <div class="device-command h-full flex flex-col overflow-hidden">
    <section class="device-hero flex-none">
      <div class="min-w-0">
        <div class="hero-kicker">
          VR Device Matrix
        </div>
        <div class="hero-title">
          {{ connectedCount }}/{{ deviceList.length }} {{ $t('device.list') }}
        </div>
        <div class="hero-sub">
          Wireless, mirror, record and Quest presets in one command surface.
        </div>
      </div>

      <div class="hero-metrics">
        <div class="metric-tile">
          <span>{{ connectedCount }}</span>
          <small>Online</small>
        </div>
        <div class="metric-tile">
          <span>{{ wirelessCount }}</span>
          <small>Wi-Fi</small>
        </div>
        <div class="metric-tile">
          <span>{{ selectionRows.length }}</span>
          <small>Selected</small>
        </div>
      </div>
    </section>

    <BatchActions
      class="batch-strip overflow-hidden transition-all"
      :class="isMultipleRow ? 'max-h-12 opacity-100 mb-2' : 'max-h-0 opacity-0 mb-0'"
      :devices="selectionRows"
    />

    <div
      v-loading="loading && !deviceList.length"
      :element-loading-text="$t('common.loading')"
      class="device-grid-wrap flex-1 min-h-0 overflow-auto"
    >
      <AppEmpty v-if="!loading && !deviceList.length" class="empty-panel" :sub-title="$t('device.list.empty')" />

      <div v-else class="device-grid">
        <article
          v-for="row of deviceList"
          :key="row.id"
          class="device-card"
          :class="[`is-${row.status}`, { 'is-selected': isSelected(row) }]"
        >
          <div class="device-card-scan"></div>

          <div class="device-card-head">
            <el-checkbox
              :model-value="isSelected(row)"
              class="device-select"
              @change="checked => onToggleSelection(row, checked)"
            />

            <div class="device-orb">
              <i :class="row.wifi ? 'i-bi-wifi' : 'i-bi-usb-symbol'"></i>
            </div>

            <div class="min-w-0 flex-1">
              <div class="device-name">
                <Remark :device="row" />
              </div>
              <div class="device-id" :title="row.id">
                {{ row.id }}
              </div>
            </div>

            <DevicePopover :key="row.status" :device="row" />
          </div>

          <div class="device-card-body">
            <div class="status-pill">
              <span class="status-dot"></span>
              <span>{{ $t(getDictLabel('deviceStatus', row.status)) || '-' }}</span>
            </div>

            <el-tooltip
              v-if="['unauthorized'].includes(row.status)"
              :content="$t('device.permission.error')"
              placement="top"
            >
              <el-tag type="danger" effect="dark">
                ADB
              </el-tag>
            </el-tooltip>
          </div>

          <div class="primary-actions">
            <ConnectAction
              v-if="['offline'].includes(row.status) && row.wifi"
              v-bind="{ device: row, handleConnect }"
            />

            <MirrorAction
              v-if="['device', 'unauthorized'].includes(row.status)"
              :ref="getMirrorActionRefs"
              v-bind="{ row, toggleRowExpansion }"
            />

            <VrApps
              v-if="['device'].includes(row.status)"
              :device="row"
            >
              <template #default="{ trigger }">
                <el-button
                  type="primary"
                  text
                  title="VR Apps"
                  @click="trigger"
                >
                  <template #icon>
                    <i class="i-fluent-games-24-regular"></i>
                  </template>
                </el-button>
              </template>
            </VrApps>

            <MoreDropdown v-if="['device'].includes(row.status)" v-bind="{ row, toggleRowExpansion }" />

            <WirelessAction v-if="['device', 'unauthorized'].includes(row.status)" v-bind="{ row, handleConnect, handleRefresh }" />

            <RemoveAction
              v-if="['offline'].includes(row.status)"
              v-bind="{ device: row, handleRefresh }"
            />
          </div>

          <ControlBar :device="row" :swapy-enabled="true" :show-labels="false" button-class="control-tile" />
        </article>
      </div>
    </div>

    <div class="dock-bar flex-none flex items-center overflow-hidden">
      <div class="min-w-0 flex-1">
        <WirelessGroup ref="wirelessGroupRef" v-bind="{ handleRefresh }" @auto-connected="onAutoConnected" />
      </div>

      <div class="flex-none flex items-center justify-end pl-3">
        <el-button
          type="primary"
          :icon="loading ? '' : 'Refresh'"
          :loading="loading"
          class="refresh-command"
          :title="$t('device.refresh.name')"
          @click="handleRefresh"
        >
          {{ $t('device.refresh.name') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import pLimit from 'p-limit'
import { sleep } from '$/utils/index.js'

import AppEmpty from '$/components/app-empty/index.vue'
import BatchActions from './components/batch-actions/index.vue'
import ControlBar from '$/components/control-bar/index.vue'
import VrApps from '$/components/control-bar/vr-apps/index.vue'
import MirrorAction from './components/mirror-action/index.vue'
import MoreDropdown from './components/more-dropdown/index.vue'
import Remark from './components/remark/index.vue'
import WirelessAction from './components/wireless-action/index.vue'
import ConnectAction from './components/connect-action/index.vue'
import RemoveAction from './components/remove-action/index.vue'
import WirelessGroup from './components/wireless-group/index.vue'
import DevicePopover from './components/device-popover/index.vue'

import { getDictLabel } from '$/dicts/helper'

const MIRROR_START_INTERVAL = 1000

const deviceStore = useDeviceStore()
const preferenceStore = usePreferenceStore()

const loading = ref(false)
const autoMirrorConcurrencyLimit = Number(window.$preload.store.get('common.concurrencyLimit') ?? 5)
const autoMirrorLimit = pLimit(autoMirrorConcurrencyLimit)

const mirrorActionRefs = ref([])
const selectionRows = ref([])
const selectedDeviceIds = ref([])

const wirelessGroupRef = ref(null)

const deviceList = computed({
  get: () => deviceStore.list,
  set: (val) => {
    deviceStore.list = val
  },
})

const isMultipleRow = computed(() => selectionRows.value.length > 0)

const connectedCount = computed(() =>
  deviceList.value.filter(item => ['device', 'emulator'].includes(item.status)).length,
)

const wirelessCount = computed(() =>
  deviceList.value.filter(item => item.wifi).length,
)

async function getDeviceData(options = {}) {
  const { unloading = false } = options

  if (!unloading) {
    loading.value = true
  }

  try {
    await deviceStore.getList()
  }
  catch (error) {
    const message = error?.message || error?.cause?.message || ''
    console.warn('Device list fetch error:', message)

    if (message.includes('failed to start daemon')) {
      await getDeviceData()
      return false
    }

    if (message) {
      ElMessage.warning(message)
    }

    deviceList.value = []
  }

  loading.value = false
}

function isSelected(row) {
  return selectedDeviceIds.value.includes(row.id)
}

function onToggleSelection(row, checked) {
  if (checked) {
    selectedDeviceIds.value = [...new Set([...selectedDeviceIds.value, row.id])]
  }
  else {
    selectedDeviceIds.value = selectedDeviceIds.value.filter(id => id !== row.id)
  }

  selectionRows.value = deviceList.value.filter(item => selectedDeviceIds.value.includes(item.id))
}

async function onAdbWatch(type, ret) {
  if (ret && ret.id) {
    await sleep(1000)
    getDeviceData()
  }

  if (type === 'remove') {
    mirrorActionRefs.value = mirrorActionRefs.value.filter(
      item => item.row.id !== ret.id,
    )
  }
}

async function getMirrorActionRefs(ref) {
  await nextTick()

  if (!ref?.row?.id) {
    return false
  }

  if (['unauthorized', 'offline'].includes(ref.row.status)) {
    return false
  }

  const exists = mirrorActionRefs.value.some(item => item.row.id === ref.row.id)
  if (exists) {
    return false
  }

  mirrorActionRefs.value.push(ref)

  const autoMirror = preferenceStore.data.autoMirror
  if (autoMirror) {
    await autoMirrorLimit(async () => {
      ref.handleClick(ref.row)
      await sleep(MIRROR_START_INTERVAL)
    })
  }
}

function toggleRowExpansion() {}

function handleConnect(...args) {
  wirelessGroupRef.value.connect(...args)
}

async function handleRefresh() {
  loading.value = true
  await sleep()
  getDeviceData({ resetResolve: true, unloading: true })
}

function onAutoConnected() {}

let unAdbWatch = null

onMounted(async () => {
  await getDeviceData()
  unAdbWatch = await window.$preload.adb.watch(onAdbWatch)
})

onBeforeUnmount(() => {
  unAdbWatch?.()
})

onActivated(() => {
  getDeviceData()
})

watch(deviceList, () => {
  selectionRows.value = deviceList.value.filter(item => selectedDeviceIds.value.includes(item.id))
})
</script>

<style lang="postcss" scoped>
.device-command {
  gap: 10px;
}

.device-hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  min-height: 118px;
  padding: 18px 20px;
  overflow: hidden;
  border: 1px solid rgba(34, 211, 238, 0.22);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(8, 47, 73, 0.76), rgba(2, 6, 23, 0.82)),
    radial-gradient(circle at 86% 22%, rgba(34, 211, 238, 0.22), transparent 28%);
  box-shadow:
    0 22px 64px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.device-hero::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #22d3ee, transparent);
  opacity: 0.7;
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

.hero-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(74px, 1fr));
  gap: 10px;
}

.metric-tile {
  min-width: 82px;
  padding: 12px;
  border: 1px solid rgba(34, 211, 238, 0.2);
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.5);
  text-align: center;
}

.metric-tile span {
  display: block;
  color: #e0f2fe;
  font-size: 24px;
  font-weight: 800;
}

.metric-tile small {
  color: #7dd3fc;
  font-size: 11px;
  text-transform: uppercase;
}

.device-grid-wrap {
  padding-right: 4px;
}

.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(390px, 1fr));
  gap: 12px;
}

.device-card {
  position: relative;
  min-height: 238px;
  overflow: hidden;
  border: 1px solid rgba(34, 211, 238, 0.18);
  border-radius: 8px;
  background:
    linear-gradient(145deg, rgba(15, 23, 42, 0.88), rgba(2, 6, 23, 0.76)),
    radial-gradient(circle at 10% 0%, rgba(34, 211, 238, 0.16), transparent 28%);
  box-shadow:
    0 16px 44px rgba(0, 0, 0, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.device-card.is-selected {
  border-color: rgba(103, 232, 249, 0.74);
  box-shadow:
    0 0 0 1px rgba(34, 211, 238, 0.18),
    0 24px 58px rgba(8, 145, 178, 0.18);
}

.device-card-scan {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, transparent, rgba(34, 211, 238, 0.08), transparent);
  transform: translateY(-100%);
  animation: scanline 4.8s linear infinite;
  opacity: 0.48;
}

.device-card-head {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 14px 10px;
}

.device-orb {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(34, 211, 238, 0.26);
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(8, 145, 178, 0.22), rgba(37, 99, 235, 0.2));
  color: #67e8f9;
  font-size: 20px;
}

.device-name {
  color: #f8fafc;
  font-weight: 800;
}

.device-id {
  margin-top: 4px;
  color: #94a3b8;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-card-body {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 14px 12px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 30px;
  padding: 0 10px;
  border: 1px solid rgba(34, 211, 238, 0.18);
  border-radius: 999px;
  background: rgba(2, 6, 23, 0.5);
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 700;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #64748b;
  box-shadow: 0 0 12px currentColor;
}

.is-device .status-dot,
.is-emulator .status-dot {
  background: #22d3ee;
}

.is-unauthorized .status-dot {
  background: #f59e0b;
}

.is-offline .status-dot {
  background: #64748b;
}

.primary-actions {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
  overflow: hidden;
  padding: 0 14px 12px;
}

.primary-actions :deep(.el-button) {
  flex: 0 0 42px;
  width: 42px;
  height: 40px;
  padding: 0 !important;
  border-radius: 7px !important;
  border: 1px solid rgba(34, 211, 238, 0.22) !important;
  background: rgba(8, 47, 73, 0.42) !important;
}

.primary-actions :deep(.el-button .el-icon),
.primary-actions :deep(.el-button i) {
  margin: 0 !important;
  font-size: 18px;
}

.primary-actions :deep(.el-button--danger) {
  border-color: rgba(248, 113, 113, 0.42) !important;
  background: rgba(127, 29, 29, 0.42) !important;
  color: #fecaca !important;
}

.dock-bar {
  min-height: 64px;
  padding: 10px;
  border: 1px solid rgba(34, 211, 238, 0.16);
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.54);
}

.refresh-command {
  min-width: 132px;
}

.empty-panel {
  height: 100%;
  display: grid;
  place-items: center;
}

:deep(.control-tile) {
  min-width: 46px !important;
  width: 48px !important;
  max-width: 52px !important;
}

@keyframes scanline {
  0% {
    transform: translateY(-100%);
  }

  100% {
    transform: translateY(100%);
  }
}
</style>
