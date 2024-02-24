<template>
  <div class="flex flex-col items-center justify-center h-full -mt-8">
    <a class="block" :href="escrcpyURL" target="_blank">
      <img src="@electron/resources/build/logo.png" class="h-48" alt="" />
    </a>

    <div class="pt-4 text-xl text-center italic text-gray-700 dark:text-white">
      {{ $t("about.description") }}
    </div>

    <div class="pt-12 pb-4">
      <el-button
        :loading="loading"
        type="primary"
        size="large"
        @click="handleUpdate"
      >
        {{
          loading && percent
            ? `${$t("about.update.progress")}...（${percent.toFixed(1)}%）`
            : $t("about.update")
        }}
      </el-button>
      <el-button
        type="primary"
        size="large"
        @click="handleUpdateGames"
      >
        {{ $t("Cập nhật Game") }}
      </el-button>
    </div>

    <div class="text-sm">
      The Vision Reality phiên bản v{{ version }}
      <br>
      Số điện thoại:
      <a
        class="hover:underline text-primary-500"
        href="https://facebook.com/bunhin"
        target="_blank"
      >0977.091.190</a>
    </div>
  </div>
</template>

<script>
import { version } from '/package.json'

export default {
  data() {
    return {
      loading: false,
      version,
      percent: 0,
      escrcpyURL: 'https://github.com/vuisme/escrcpy',
    }
  },
  created() {
    this.onUpdateNotAvailable()
    this.onUpdateAvailable()
    this.onDownloadProgress()
    this.onUpdateDownloaded()
    this.onUpdateError()
  },
  methods: {
    async handleUpdateGames() {
      this.$confirm(
        this.$t('Việc này cần có kết nối internet để tải về danh sách trò chơi mới'),
        this.$t('Cập nhật danh sách Game mới'),
        {
          confirmButtonText: this.$t('common.confirm'),
          cancelButtonText: this.$t('common.cancel'),
        },
      ).then(async () => {
        try {
          const response = await fetch(
            'https://raw.githubusercontent.com/vuisme/escrcpy/main/electron/resources/build/apps.json',
          )
          const data = await response.json()
          console.log(data)
          const jsonDataString = JSON.stringify(data)
          console.log(jsonDataString)
          this.$store.preference.setData({ appJson: jsonDataString })
          this.$message.success(this.$t('Cập nhật danh sách trò chơi thành công. Chắc chắn rằng bạn đã cài đặt trò chơi mới'))
        }
        catch (error) {
          console.error(error)
          this.$message.error(this.$t('Có lỗi xảy ra'))
        }
      })
    },
    handleUpdate() {
      this.loading = true
      this.$electron.ipcRenderer.send('check-for-update')
    },
    onUpdateNotAvailable() {
      this.$electron.ipcRenderer.on('update-not-available', () => {
        this.loading = false
        this.$message.success(this.$t('about.update-not-available'))
      })
    },
    onUpdateError() {
      this.$electron.ipcRenderer.on('update-error', async (_, ret) => {
        this.loading = false
        console.log('onUpdateError.ret', ret)
        try {
          await this.$confirm(
            this.$t('about.update-error.message'),
            this.$t('about.update-error.title'),
            {
              confirmButtonText: this.$t('common.confirm'),
              cancelButtonText: this.$t('common.cancel'),
              closeOnClickModal: false,
              type: 'error',
            },
          )
          window.open(`${this.escrcpyURL}/releases`)
        }
        catch (error) {
          console.warn(error.message)
        }
      })
    },
    onDownloadProgress() {
      this.$electron.ipcRenderer.on('download-progress', async (event, ret) => {
        console.log('ret', ret)
        this.percent = ret.percent
      })
    },
    async onUpdateDownloaded() {
      this.$electron.ipcRenderer.on('update-downloaded', async (event, ret) => {
        console.log('ret', ret)
        this.loading = false
        try {
          await this.$confirm(
            this.$t('about.update-downloaded.message'),
            this.$t('about.update-downloaded.title'),
            {
              confirmButtonText: this.$t('about.update-downloaded.confirm'),
              cancelButtonText: this.$t('common.cancel'),
              closeOnClickModal: false,
            },
          )
          this.$electron.ipcRenderer.send('quit-and-install')
        }
        catch (error) {
          console.warn(error.message)
        }
      })
    },
    onUpdateAvailable() {
      this.$electron.ipcRenderer.on('update-available', async (event, ret) => {
        this.loading = false
        try {
          console.log('ret', ret)
          await this.$confirm(
            ret.releaseNotes,
            this.$t('about.update-available.title'),
            {
              dangerouslyUseHTMLString: true,
              closeOnClickModal: false,
              confirmButtonText: this.$t('about.update-available.confirm'),
              cancelButtonText: this.$t('common.cancel'),
            },
          )
          this.$electron.ipcRenderer.send('download-update')
          this.loading = true
        }
        catch (error) {
          console.warn(error.message)
        }
      })
    },
  },
}
</script>

<style></style>
