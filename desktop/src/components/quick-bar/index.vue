<template>
  <div class="quick-deck relative z-10 flex items-center gap-2 *:app-region-no-drag">
    <component
      :is="item.component || 'div'"
      v-for="item in actionModel"
      :key="item.label"
      class="flex-none"
      v-bind="{
        ...(item.command
          ? {
            onClick: () => handleCommand(item),
          }
          : {}),
      }"
    >
      <template #default="{ trigger, ...slotProps } = {}">
        <el-button
          class="quick-command"
          v-bind="{
            title: $t(item.tips || item.label),
            circle: true,
            borderless: true,
            text: true,
            ...slotProps,
            ...(trigger ? { onClick: trigger } : {}),
          }"
        >
          <template #icon>
            <el-icon v-if="item.elIcon" :class="item.iconClass">
              <component :is="item.elIcon" />
            </el-icon>
            <i v-else-if="item.fontIcon" :class="item.fontIcon"></i>
          </template>
        </el-button>
      </template>
    </component>
  </div>
</template>

<script setup>
import Arrange from './components/arrange/index.vue'
import Log from './components/log/index.vue'
import Restart from './components/restart/index.vue'
import Search from './components/search/index.vue'
import Schedule from './components/schedule/index.vue'
import Terminal from './components/terminal/index.vue'

const props = defineProps({})

const actionModel = [
  {
    label: 'device.arrange.name',
    fontIcon: 'i-bi-window-split',
    component: Arrange,
  },
  {
    label: 'device.terminal.name',
    fontIcon: 'i-bi-terminal',
    component: Terminal,
  },
  {
    label: 'device.schedule.list',
    fontIcon: 'i-bi-clock',
    component: Schedule,
  },
  {
    label: 'device.log.name',
    fontIcon: 'i-qlementine-icons-run-debug-16',
    component: Log,
  },
  {
    label: 'device.restart.name',
    fontIcon: 'i-iconoir-refresh',
    component: Restart,
  },
  {
    label: 'common.search',
    fontIcon: 'i-bi-search',
    component: Search,
  },
]

function handleCommand() {}
</script>

<style lang="postcss" scoped>
.quick-deck {
  padding: 4px;
  border: 1px solid rgba(34, 211, 238, 0.16);
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.46);
}

:deep(.quick-command) {
  width: 38px;
  height: 38px;
  border: 1px solid rgba(34, 211, 238, 0.22) !important;
  border-radius: 7px !important;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.78), rgba(8, 47, 73, 0.48)) !important;
  color: #bae6fd !important;
}

:deep(.quick-command:hover) {
  transform: translateY(-1px);
  border-color: rgba(34, 211, 238, 0.78) !important;
  background: linear-gradient(135deg, rgba(8, 145, 178, 0.58), rgba(37, 99, 235, 0.5)) !important;
}
</style>
