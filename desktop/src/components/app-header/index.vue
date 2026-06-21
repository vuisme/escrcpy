<template>
  <div
    :class="[
      {
        'pl-20': $platform.is('macos') && !controlProps.custom,
        'pr-[calc(70px+3.6vw)]': $platform.is('windows', 'linux') || controlProps.custom,
      },
    ]"
    class="app-header app-region-drag flex items-center"
  >
    <div class="app-header-glow"></div>

    <div v-if="title || deviceName || $slots['device-name']" class="relative z-1 flex-none flex items-center gap-4 overflow-hidden">
      <div v-if="title" class="max-w-96 truncate pl-1 text-sm font-semibold select-none" :title="title">
        {{ title }}
      </div>

      <slot name="device-name">
        <el-tag v-if="deviceName" type="primary">
          <div class="flex items-center gap-2">
            {{ deviceName }}
          </div>
        </el-tag>
      </slot>
    </div>

    <div class="relative z-1 flex-1 min-w-0">
      <slot name="default"></slot>
    </div>

    <div v-if="$slots.right" class="relative z-1 flex-none">
      <slot name="right"></slot>
    </div>

    <AppControls
      v-if="$platform.is('windows', 'linux') || controlProps.custom"
      v-bind="{
        background: controlProps.background,
      }"
    />
  </div>
</template>

<script setup>
import AppControls from '$/components/app-controls/index.vue'

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  deviceName: {
    type: String,
    default: '',
  },
  controlProps: {
    type: Object,
    default: () => ({}),
  },
})
</script>

<style lang="postcss" scoped>
.app-header {
  min-height: 68px;
  padding: 10px 14px;
  overflow: hidden;
  border: 1px solid rgba(34, 211, 238, 0.18);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(15, 23, 42, 0.86), rgba(2, 6, 23, 0.68)),
    linear-gradient(90deg, rgba(34, 211, 238, 0.12), transparent 54%);
  box-shadow:
    0 20px 54px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.07);
}

.app-header::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-top: 1px solid rgba(103, 232, 249, 0.32);
  background-image:
    linear-gradient(90deg, rgba(34, 211, 238, 0.12) 1px, transparent 1px),
    linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px);
  background-size: 44px 44px;
  opacity: 0.22;
}

.app-header-glow {
  position: absolute;
  right: 96px;
  width: 220px;
  height: 80px;
  transform: skewX(-18deg);
  background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.18), transparent);
}
</style>
