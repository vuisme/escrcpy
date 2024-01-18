<template>
  <div>
    <div v-if="!countdownStarted">
      Tính giờ
    </div>
    <div v-if="countdown > 0">
      Thời gian còn lại: {{ formatTime(countdown) }}
    </div>
    <el-button
      type="primary"
      class="el-button-nav next"
      title="Timer"
      @click="startCountdown"
    ></el-button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      countdown: 0,
      countdownTimer: null,
      countdownStarted: false,
    }
  },
  methods: {
    toggleCountdown() {
      if (!this.countdownStarted) {
        this.countdownStarted = true;
        this.startCountdown();
      } else {
        // Nếu bấm lại khi đang đếm, có thể xử lý tùy ý
      }
    },
    startCountdown() {
      this.countdown = 10 * 60;
      this.countdownTimer = setTimeout(() => {
        this.handleShell({ command: 'input keyevent 26' });
        this.countdownStarted = false; // Đặt lại trạng thái khi đếm kết thúc
      }, this.countdown * 1000);
    },
    handleShell(row) {
      if (row.label === 'Start') {
        this.startCountdown()
      }
      else {
        this.$adb.deviceShell(this.device.id, row.command)
      }
    },
  },
}
</script>

<style></style>
