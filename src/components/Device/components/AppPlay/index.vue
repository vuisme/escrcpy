<template>
  <el-dialog
    v-model="visible"
    title="Lựa game đi thằng L*n`"
    width="800"
    append-to-body
    destroy-on-close
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
            <tr v-for="(app, index) in filteredApps" :key="index" class="border-t">
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
  computed: {
    filteredApps() {
      // Lọc danh sách ứng dụng chỉ hiển thị những ứng dụng đã cài đặt
      return this.apps.filter(app => this.isAppInstalled(app.packageName))
    },
  },
  mounted() {
    this.$store.preference.setScope('global')
    const dataB = this.$store.preference.getData()
    // Fetch data from the JSON file or API
    // For simplicity, I'll use a hardcoded path. You may need to adjust this.
    const appJson = dataB.appJson
    try {
      const appJson = JSON.parse(dataB.appJson)

      // Assuming appJson is an array of objects
      if (Array.isArray(appJson)) {
        this.apps = appJson
      }
      else {
        console.error('Invalid appJson format. Expected an array.')
      }
    }
    catch (error) {
      console.error('Error parsing appJson:', error)
    }
  },
  methods: {
    preferenceData(...args) {
      return this.$store.preference.getData(...args)
    },
    isAppInstalled(packageName) {
      if (!packageName) {
        return false
      }
      const result = this.$adb.isInstalled(this.device.id, packageName)
      console.log('Result from isInstalled:', result)
      return result
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
    show() {
      this.visible = true
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
