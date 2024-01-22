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
            <tr v-for="(app, index) in apps" :key="index" class="border-t">
              <td class="py-2 px-4 border">
                <img :src="app.icon" alt="App Icon" class="w-12 h-12" @click="openApp(app.packageName)">
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
export default {
  data() {
    return {
      apps: [], // This will be populated with data from the JSON file
      visible: false,
    }
  },
  mounted() {
    this.$store.preference.setScope('global')
    const dataB = this.$store.preference.getData(id)
    console.log(dataB)
    // Fetch data from the JSON file or API
    // For simplicity, I'll use a hardcoded path. You may need to adjust this.
    const appJson = [
      {
        packageName: 'com.example.app1',
        icon: 'https://i0.wp.com/waytoomany.games/wp-content/uploads/2022/02/les-mills-4.jpg?fit=875%2C491&ssl=1',
        name: 'Les Mills Bodycombat',
        description: 'Đấm chết cm thằng nào mày ghét.',
        video: 'https://www.youtube.com/watch?v=mGYQDEZFzU8',
      },
      {
        packageName: 'com.example.app1',
        icon: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/570aeb50-b4d7-4ae3-a4e6-bcc1e8d563da/dd8hrns-32b6bb23-060c-4a82-9372-2c6defdb6e20.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzU3MGFlYjUwLWI0ZDctNGFlMy1hNGU2LWJjYzFlOGQ1NjNkYVwvZGQ4aHJucy0zMmI2YmIyMy0wNjBjLTRhODItOTM3Mi0yYzZkZWZkYjZlMjAucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.DrC2CjVHtNMmrO-vCbs5dVOSS-3wxZBKqvO9lN_X6SE',
        name: 'Beat Sab',
        description: 'Chém chết cm thằng nào mày ghét.',
        video: 'https://www.youtube.com/watch?v=BUXPOqt4O2E',
      },
      {
        packageName: 'com.example.app1',
        icon: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/570aeb50-b4d7-4ae3-a4e6-bcc1e8d563da/dd8hrns-32b6bb23-060c-4a82-9372-2c6defdb6e20.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzU3MGFlYjUwLWI0ZDctNGFlMy1hNGU2LWJjYzFlOGQ1NjNkYVwvZGQ4aHJucy0zMmI2YmIyMy0wNjBjLTRhODItOTM3Mi0yYzZkZWZkYjZlMjAucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.DrC2CjVHtNMmrO-vCbs5dVOSS-3wxZBKqvO9lN_X6SE',
        name: 'Beat Sab',
        description: 'Chém chết cm thằng nào mày ghét.',
        video: 'https://www.youtube.com/watch?v=BUXPOqt4O2E',
      },
      {
        packageName: 'com.example.app1',
        icon: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/570aeb50-b4d7-4ae3-a4e6-bcc1e8d563da/dd8hrns-32b6bb23-060c-4a82-9372-2c6defdb6e20.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzU3MGFlYjUwLWI0ZDctNGFlMy1hNGU2LWJjYzFlOGQ1NjNkYVwvZGQ4aHJucy0zMmI2YmIyMy0wNjBjLTRhODItOTM3Mi0yYzZkZWZkYjZlMjAucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.DrC2CjVHtNMmrO-vCbs5dVOSS-3wxZBKqvO9lN_X6SE',
        name: 'Beat Sab',
        description: 'Chém chết cm thằng nào mày ghét.',
        video: 'https://www.youtube.com/watch?v=BUXPOqt4O2E',
      },
      {
        packageName: 'com.example.app1',
        icon: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/570aeb50-b4d7-4ae3-a4e6-bcc1e8d563da/dd8hrns-32b6bb23-060c-4a82-9372-2c6defdb6e20.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzU3MGFlYjUwLWI0ZDctNGFlMy1hNGU2LWJjYzFlOGQ1NjNkYVwvZGQ4aHJucy0zMmI2YmIyMy0wNjBjLTRhODItOTM3Mi0yYzZkZWZkYjZlMjAucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.DrC2CjVHtNMmrO-vCbs5dVOSS-3wxZBKqvO9lN_X6SE',
        name: 'Beat Sab',
        description: 'Chém chết cm thằng nào mày ghét.',
        video: 'https://www.youtube.com/watch?v=BUXPOqt4O2E',
      },
      // Add more apps as needed
    ]
    this.apps = appJson
  },
  methods: {
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
    openApp(packageName) {
      // Gọi lệnh ADB để mở ứng dụng
      // Đảm bảo rằng thiết bị đã được kết nối và ADB đã được cài đặt
      const adbCommand = `adb shell am start -n ${packageName}/.MainActivity`
      // Thực hiện lệnh ADB sử dụng fetch hoặc một phương thức khác tùy thuộc vào cách bạn triển khai
      fetch('/execute-adb-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command: adbCommand }),
      })
        .then(response => response.json())
        .then((data) => {
          console.log('ADB Command executed:', data)
        })
        .catch(error => console.error('Error executing ADB Command:', error))
    },
  },
}
</script>

<style></style>
