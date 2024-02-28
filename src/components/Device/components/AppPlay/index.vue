<template>
  <el-dialog
    v-model="visible"
    title="DANH SÁCH GAME CÓ TRONG MÁY"
    width="80%"
    append-to-body
    destroy-on-close
    opened="handleDialogOpen"
    @closed="handleClose"
  >
    <div class="app-list">
      <div class="intro-text">
        Bấm vào hình để xem hướng dẫn
      </div>
      <div class="filter-section">
        <el-input v-model="filterName" placeholder="Tìm kiếm theo Tên"></el-input>
        <el-select v-model="filterComfort" placeholder="Lọc theo Độ thoải mái">
          <el-option label="Thoải mái" value="Thoải mái"></el-option>
          <el-option label="Bình thường" value="Bình thường"></el-option>
          <el-option label="Chóng mặt" value="Chóng mặt"></el-option>
          <!-- Add other comfort levels as needed -->
        </el-select>
      </div>
      <div class="app-cards">
        <el-card v-for="(app, index) in filteredApps" :key="index" class="app-card">
          <div class="app-thumbnail">
            <el-button type="warning" icon="VideoPlay" @click="openApp(app.packageName, app.runName)"></el-button>
          </div>
          <div class="app-info">
            <strong class="game-name">{{ app.name }}</strong>
            <p>{{ app.description }}</p>
            <!-- Display the comfort level with emoji and color -->
            <div class="comfort-icon" :style="{ background: getComfortIconColor(app.comfort) }">
              {{ getComfortIcon(app.comfort) }}
            </div>
          </div>
          <div class="app-video">
            <iframe width="100%" height="150" :src="getYouTubeEmbedUrl(app.video)" frameborder="0" allowfullscreen></iframe>
          </div>
        </el-card>
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
      filterName: '', // New property for filtering by name
      filterComfort: '', // New property for filtering by comfort level
    }
  },
  computed: {
    filteredApps() {
      return this.apps.filter((app) => {
        // Apply filters based on filterName and filterComfort
        const nameMatch = app.name.toLowerCase().includes(this.filterName.toLowerCase())
        const comfortMatch = this.filterComfort ? app.comfort === this.filterComfort : true
        return nameMatch && comfortMatch
      })
    },
  },
  watch: {
    device: {
      immediate: true, // Trigger the handler immediately after the component is created
      handler(newDevice, oldDevice) {
        // Reset the 'apps' array
        this.apps = []
        // Fetch and update data based on the new device information
        this.fetchData(newDevice)
      },
    },
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

        // Xử lý giá trị result ở đây, nó sẽ là giá trị được resolve từ Promise
        return result
      }
      catch (error) {
        console.error('Lỗi khi kiểm tra ứng dụng đã cài đặt:', error)

        // Trả về false hoặc xử lý lỗi theo ý bạn
        return false
      }
    },
    async openApp(packageName, runName) {
    // Hiển thị thông báo đang chạy
      const messageEl = this.$message({
        message: 'Đang mở ứng dụng...',
        icon: LoadingIcon,
        duration: 0,
      })
      // Thực hiện lệnh ADB để mở ứng dụng
      this.$adb.runApp(this.device.id, packageName, runName)
        .then(() => {
          const parent = this.$parent
          if (parent && typeof parent.countdownTimer === 'function') {
            // Gọi hàm `countdownTimer` của component cha
            parent.countdownTimer(row) // Thêm row để truyền cho hàm trong component cha
          }
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
    getComfortIcon(comfort) {
      // Map comfort levels to corresponding emojis
      const comfortEmojiMap = {
        'Thoải mái': '☻ Dễ chịu', // Black emoji for comfortable
        'Bình thường': '☻ Bình thường', // Black emoji for moderate
        'Chóng mặt': '☻ Khó chịu', // Black emoji for dizzy
        // Add other comfort levels as needed
      }
      return comfortEmojiMap[comfort] || ''
    },
    getComfortIconColor(comfort) {
      // Map comfort levels to corresponding colors
      const comfortColorMap = {
        'Thoải mái': 'green', // Green color for comfortable
        'Bình thường': 'orange', // Orange color for moderate
        'Chóng mặt': 'red', // Red color for dizzy
        // Add other comfort levels as needed
      }
      return comfortColorMap[comfort] || ''
    },
  },
}
</script>

<style scoped>
  .app-list {
    text-align: center;
    padding: 20px;
  }

  .intro-text {
    color: #ff4d4f;
    font-size: 14px;
    margin-bottom: 20px;
  }

  .filter-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .app-cards {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
  }

  .app-card {
    width: 300px;
    margin: 10px;
    cursor: pointer;
    transition: transform 0.3s ease-in-out;
    position: relative;
    overflow: hidden;
  }

  .app-card:hover {
    transform: scale(1.05);
  }

  .app-thumbnail img {
    width: 100%;
    cursor: pointer;
    border-radius: 8px;
  }

  .app-info {
    padding: 15px;
  }
  .game-name {
    font-size: 18px; /* Adjust the font size as needed */
    display: block;
    margin-bottom: 10px;
  }
  .comfort-icon {
    position: absolute;
    top: -20px;
    right: -60px;
    padding: 2px 30px; /* Adjust padding as needed */
    color: #fff;
    font-size: 12px; /* Adjust font size as needed */
    background: #3498db; /* Adjust background color as needed */
    transform: rotate(45deg);
    transform-origin: 0 0;
  }
  .comfort-icon::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background-size: cover; /* hiển thị toàn bộ background */
    transform: rotate(45deg);
    transform-origin: 0 0;
    z-index: -1;
    position: relative;
    z-index: 1;
  }

  /* Hàm để tạo linear gradient cho nền thoải mái */
  .comfort-icon-background-green::before {
    background: linear-gradient(135deg, #2ecc71 50%, transparent 50%);
  }

  .comfort-icon-background-orange::before {
    background: linear-gradient(135deg, #e67e22 50%, transparent 50%);
  }

  .comfort-icon-background-red::before {
    background: linear-gradient(135deg, #e74c3c 50%, transparent 50%);
  }
</style>
