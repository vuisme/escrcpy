<template>
  <el-dialog
    v-model="visible"
    title="Lựa game đi thằng L*n`"
    width="800"
    append-to-body
    destroy-on-close
    opened="handleDialogOpen"
  >
    <div class="h-full flex flex-col">
      <div class="text-red-500 text-sm pb-8 pl-4">
        Bấm icon để chơi
      </div>
      <div>
        <table class="w-full border">
          <thead>
            <tr>
              <th class="w-16 py-2 px-4 border-r">
                Icon
              </th>
              <th class="flex-1 py-2 px-4 border-r">
                Name & Description
              </th>
              <th class="text-right py-2 px-4">
                Video
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(app, index) in apps" :key="index" class="border-t">
              <td class="py-2 px-4 border">
                <img :src="app.icon" alt="App Icon" class="w-12 h-12" @click="openApp(device, app.packageName)">
              </td>
              <td class="py-2 px-4 border">
                <strong>{{ app.name }}</strong><br>
                {{ app.description }}
              </td>
              <td class="text-right py-2 px-4 border">
                <iframe width="100%" height="150" :src="getYouTubeEmbedUrl(app.video)" frameborder="0" allowfullscreen></iframe>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import LoadingIcon from '@/components/Device/components/LoadingIcon/index.vue'

export default {
  props: {
    device: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      apps: [], // This will be populated with data from the JSON file
      visible: false,
    }
  },
  watch: {
    device: {
      immediate: true, // Trigger the handler immediately after the component is created
      handler(newDevice, oldDevice) {
        // Reset the 'apps' array
        this.apps = []
        console.log('new device', newDevice)
        // Fetch and update data based on the new device information
        this.fetchData(newDevice)
      },
    },
  },
  mounted() {
    console.log('Component Con Mounted with Device:', this.$toRaw(this.device))
  },
  updated() {
    console.log('Component Con Updated with Device:', this.$toRaw(this.device))
    // Rest of the code...
  },
  methods: {
    async fetchData(device) {
      const dataB = this.$store.preference.getData()
      // Fetch data from the JSON file or API
      // For simplicity, I'll use a hardcoded path. You may need to adjust this.
      try {
        const appJson = JSON.parse(dataB.appJson)

        if (Array.isArray(appJson)) {
          const apps = await this.filterInstalledApps(appJson, device)
          this.apps = apps
          console.log('Updated apps:', this.apps)
        }
        else {
          console.error('Invalid appJson format. Expected an array.')
        }
      }
      catch (error) {
        console.error('Error parsing appJson:', error)
      }
    },
    preferenceData(...args) {
      return this.$store.preference.getData(...args)
    },
    async filterInstalledApps(appJson) {
      const tempApps = []

      for (const app of appJson) {
        const isInstalled = await this.isAppInstalled(app.packageName)
        console.log('isAppInstalled result:', isInstalled)

        if (isInstalled) {
          tempApps.push(app)
        }
      }

      return tempApps
    },
    async isAppInstalled(packageName) {
      if (!packageName) {
        return false
      }
      try {
        const result = await this.$adb.isInstalled(this.device.id, packageName)
        console.log('result:', result)

        // Xử lý giá trị result ở đây, nó sẽ là giá trị được resolve từ Promise
        return result
      }
      catch (error) {
        console.error('Lỗi khi kiểm tra ứng dụng đã cài đặt:', error)

        // Trả về false hoặc xử lý lỗi theo ý bạn
        return false
      }
    },
    async openApp(packageName) {
    // Hiển thị thông báo đang chạy
      const messageEl = this.$message({
        message: 'Đang mở ứng dụng...',
        icon: LoadingIcon,
        duration: 0,
      })
      // Thực hiện lệnh ADB để mở ứng dụng
      this.$adb.runApp(this.device.id, { component: `${packageName}/.MainActivity` })
        .then(() => {
          // Hiển thị thông báo thành công
          this.$message.success('Ứng dụng đã được mở thành công.')
          this.visible = false
        })
        .catch((error) => {
          console.error('Lỗi khi thực hiện lệnh ADB:', error)

          // Hiển thị thông báo lỗi
          this.$message.warning('Có lỗi xảy ra khi mở ứng dụng.')
        })
        .finally(() => {
          // Đóng thông báo đang chạy
          messageEl.close()
        })
    },
    async show() {
      console.log('load bảng ra show')
      this.fetchData(this.device)
      this.visible = true
      console.log('Is dialog visible?', this.visible)
    },
    handleClose() {
      this.visible = false
    },
    getYouTubeEmbedUrl(videoUrl) {
      // Extract YouTube video ID from the URL
      const videoIdMatch = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
      const videoId = videoIdMatch ? videoIdMatch[1] : null

      // Return the embedded YouTube video URL
      return videoId ? `https://www.youtube.com/embed/${videoId}` : ''
    },
  },
}
</script>

<style></style>
