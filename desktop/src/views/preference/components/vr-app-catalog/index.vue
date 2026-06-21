<template>
  <section class="catalog-console">
    <div class="catalog-header">
      <div>
        <div class="catalog-kicker">
          App Library
        </div>
        <h3>Kho ứng dụng VR</h3>
        <p>Quản lý danh sách app hiển thị trong VR Apps và nhập nhanh từ thiết bị đang kết nối.</p>
      </div>

      <div class="catalog-actions">
        <el-button :icon="Plus" @click="addBlankApp">
          Thêm app
        </el-button>
        <el-button type="primary" :icon="Search" @click="openScanner">
          Quét từ máy
        </el-button>
        <el-button :icon="RefreshRight" @click="resetCatalog">
          Reset
        </el-button>
      </div>
    </div>

    <div class="catalog-table">
      <el-table :data="apps" row-key="packageName" max-height="420">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="catalog-detail">
              <el-input v-model="row.icon" placeholder="electron/resources/img/BeatSaber.webp" @change="saveCatalog">
                <template #prepend>
                  Icon
                </template>
              </el-input>

              <el-input v-model="row.video" placeholder="https://youtube.com/... hoặc video local" @change="saveCatalog">
                <template #prepend>
                  Video
                </template>
              </el-input>

              <el-input
                v-model="row.description"
                type="textarea"
                :rows="3"
                placeholder="Mô tả ngắn hiển thị trong VR Apps"
                @change="saveCatalog"
              />
            </div>
          </template>
        </el-table-column>

        <el-table-column width="54">
          <template #default="{ $index }">
            <div class="row-index">
              {{ $index + 1 }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Tên app" min-width="190">
          <template #default="{ row }">
            <el-input v-model="row.name" placeholder="Beat Saber" @change="saveCatalog" />
          </template>
        </el-table-column>

        <el-table-column label="Package" min-width="230">
          <template #default="{ row }">
            <el-input v-model="row.packageName" placeholder="com.company.app" @change="saveCatalog" />
          </template>
        </el-table-column>

        <el-table-column label="Activity" min-width="240">
          <template #default="{ row }">
            <el-input
              v-model="row.runName"
              placeholder="com.unity3d.player.UnityPlayerActivity"
              @change="saveCatalog"
            />
          </template>
        </el-table-column>

        <el-table-column label="Độ thoải mái" width="150">
          <template #default="{ row }">
            <el-select v-model="row.comfort" @change="saveCatalog">
              <el-option
                v-for="item of COMFORT_OPTIONS"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column width="70" fixed="right">
          <template #default="{ $index }">
            <el-button
              text
              type="danger"
              :icon="Delete"
              @click="removeApp($index)"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="scannerVisible"
      title="Quét ứng dụng từ thiết bị"
      width="820px"
      append-to-body
      destroy-on-close
      @open="prepareScanner"
    >
      <div class="scanner-panel">
        <div class="scanner-toolbar">
          <el-select
            v-model="scanDeviceId"
            class="!w-[320px]"
            filterable
            placeholder="Chọn thiết bị đang kết nối"
          >
            <el-option
              v-for="device of connectableDevices"
              :key="device.id"
              :label="deviceLabel(device)"
              :value="device.id"
            />
          </el-select>

          <el-input
            v-model="scanKeyword"
            class="!w-[260px]"
            clearable
            placeholder="Tìm tên hoặc package"
          />

          <el-button type="primary" :loading="scanning" :icon="Search" @click="scanDeviceApps">
            Quét
          </el-button>
        </div>

        <el-table v-loading="scanning" :data="filteredScannedApps" height="420">
          <el-table-column label="Tên app" min-width="220">
            <template #default="{ row }">
              <div class="font-700">
                {{ row.name }}
              </div>
              <div class="text-xs text-gray-500">
                {{ row.isSystemApp ? 'System' : 'User' }}
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="packageName" label="Package" min-width="260" show-overflow-tooltip />

          <el-table-column width="120" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                :loading="importingPackage === row.packageName"
                @click="importScannedApp(row)"
              >
                Nhập
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </section>
</template>

<script setup>
import { Delete, Plus, RefreshRight, Search } from '@element-plus/icons-vue'
import { quote } from 'shell-quote'
import {
  COMFORT_OPTIONS,
  getStoredVrApps,
  normalizeVrApp,
  parseResolveActivity,
  resetStoredVrApps,
  setStoredVrApps,
} from '$/utils/vr-app-catalog/index.js'

const deviceStore = useDeviceStore()

const apps = ref(getStoredVrApps())
const scannerVisible = ref(false)
const scanDeviceId = ref('')
const scanKeyword = ref('')
const scannedApps = ref([])
const scanning = ref(false)
const importingPackage = ref('')

const connectableDevices = computed(() =>
  deviceStore.list.filter(device => ['device', 'emulator'].includes(device.status)),
)

const filteredScannedApps = computed(() => {
  const keyword = scanKeyword.value.trim().toLowerCase()

  if (!keyword) {
    return scannedApps.value
  }

  return scannedApps.value.filter((app) => {
    return [app.name, app.packageName]
      .filter(Boolean)
      .some(value => value.toLowerCase().includes(keyword))
  })
})

function deviceLabel(device) {
  return `${device.remark || device.name || device.id} (${device.id})`
}

function saveCatalog() {
  apps.value = setStoredVrApps(apps.value)
}

function addBlankApp() {
  apps.value.unshift(normalizeVrApp({
    name: 'Ứng dụng mới',
    packageName: `com.example.vrapp.${Date.now()}`,
    comfort: COMFORT_OPTIONS[0],
  }))
  saveCatalog()
}

function removeApp(index) {
  apps.value.splice(index, 1)
  saveCatalog()
}

async function resetCatalog() {
  try {
    await ElMessageBox.confirm('Đưa kho ứng dụng VR về danh sách mặc định?', 'Reset kho ứng dụng', {
      type: 'warning',
    })
  }
  catch {
    return
  }

  apps.value = resetStoredVrApps()
}

async function openScanner() {
  scannerVisible.value = true
}

async function prepareScanner() {
  await deviceStore.getList()

  if (!scanDeviceId.value && connectableDevices.value[0]) {
    scanDeviceId.value = connectableDevices.value[0].id
  }
}

async function scanDeviceApps() {
  if (!scanDeviceId.value) {
    ElMessage.warning('Chưa chọn thiết bị để quét')
    return
  }

  scanning.value = true

  try {
    scannedApps.value = await window.$preload.scrcpy.getAppList(scanDeviceId.value)
  }
  finally {
    scanning.value = false
  }
}

async function resolveLauncherActivity(packageName) {
  const output = await window.$preload.adb.deviceShell(
    scanDeviceId.value,
    `cmd package resolve-activity --brief --components ${quote([packageName])}`,
  ).catch(() => '')

  return parseResolveActivity(output)
}

async function importScannedApp(app) {
  importingPackage.value = app.packageName

  try {
    const runName = await resolveLauncherActivity(app.packageName)
    const nextApp = normalizeVrApp({
      ...app,
      runName,
      description: '',
      comfort: COMFORT_OPTIONS[0],
    })
    const index = apps.value.findIndex(item => item.packageName === nextApp.packageName)

    if (index >= 0) {
      apps.value.splice(index, 1, {
        ...apps.value[index],
        ...nextApp,
      })
    }
    else {
      apps.value.unshift(nextApp)
    }

    saveCatalog()
    ElMessage.success(`Đã nhập ${nextApp.name}`)
  }
  finally {
    importingPackage.value = ''
  }
}
</script>

<style scoped lang="postcss">
.catalog-console {
  margin-top: 10px;
  overflow: hidden;
  border: 1px solid rgba(34, 211, 238, 0.16);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(2, 6, 23, 0.74), rgba(8, 47, 73, 0.44)),
    radial-gradient(circle at 92% 10%, rgba(34, 211, 238, 0.12), transparent 26%);
}

.catalog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid rgba(34, 211, 238, 0.14);
}

.catalog-kicker {
  color: #67e8f9;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.catalog-header h3 {
  margin: 4px 0 0;
  color: #f8fafc;
  font-size: 18px;
}

.catalog-header p {
  margin: 6px 0 0;
  color: #94a3b8;
  font-size: 13px;
}

.catalog-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.catalog-actions :deep(.el-button) {
  margin: 0 !important;
}

.catalog-table {
  padding: 12px;
}

.catalog-detail {
  display: grid;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(2, 6, 23, 0.32);
}

.row-index {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(34, 211, 238, 0.2);
  border-radius: 6px;
  color: #7dd3fc;
  font-size: 12px;
  font-weight: 800;
}

.scanner-panel {
  display: grid;
  gap: 12px;
}

.scanner-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
