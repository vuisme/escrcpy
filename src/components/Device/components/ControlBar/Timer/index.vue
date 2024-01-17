<template>
  <div>
    <div v-if="countdown > 0">
      Time remaining: {{ formatTime(countdown) }}
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
    }
  },
  methods: {
    startCountdown() {
      this.countdown = 10 * 60; // 10 phút
      this.countdownTimer = setTimeout(() => {
        this.handleShell({ command: 'input keyevent 26' });
      }, this.countdown * 1000); // Chuyển đổi giây thành mili giây
    },
    handleShell(row) {
      if (row.label === 'Start') {
        this.startCountdown();
      } else {
        this.$adb.deviceShell(this.device.id, row.command);
      }
    },
  },
}
</script>
<style></style>
