<template>
  <div
    class="control-deck flex group overflow-hidden"
  >
    <el-button
      type="primary"
      class="el-button-nav"
      :style="{
        ...buttonHeightStyle,
      }"
      title="Prev"
      @click="handlePrev"
    >
      <el-icon>
        <CaretLeft />
      </el-icon>
    </el-button>

    <Scrollable ref="scrollableRef" class="flex-1 min-w-0" disabled-drag>
      <Swapy
        :key="controlStore.swapyKey"
        :enabled="swapyEnabled"
        class="flex items-center"
        :class="floating ? '!h-full' : ''"
        :config="{ animation: 'dynamic', dragAxis: 'x', autoScrollOnDrag: false }"
        @swap-end="onSwapEnd"
      >
        <SwapyItem
          v-for="item of controlModel"
          :key="item.id"
          class="flex-none"
          :class="[buttonClass]"
          v-bind="{
            slotId: item.id,
            itemId: item.id,
          }"
        >
          <component
            :is="item.component || 'div'"
            v-bind="{
              device,
              floating,
            }"
          >
            <template #default="{ loading = false, trigger } = {}">
              <el-button
                type="primary"
                plain
                class="control-command !mx-0 !py-0"
                :class="[
                  ['unauthorized', 'offline'].includes(device.status) ? '!bg-transparent' : '',
                  !showLabels || floating ? 'is-icon-only' : '',
                  buttonClass,
                ]"
                :style="{
                  ...buttonHeightStyle,
                }"
                :disabled="['unauthorized', 'offline'].includes(device.status)"
                :title="$t(item.tips || item.label)"
                :loading="loading"
                @click="handleClick(item, trigger || item.trigger)"
              >
                <template #icon>
                  <el-icon v-if="item.elIcon" :class="item.iconClass">
                    <component :is="item.elIcon" />
                  </el-icon>

                  <i v-else-if="item.fontIcon" :class="item.fontIcon"></i>
                </template>
                <span v-if="showLabels && !floating" class="control-command-label">
                  {{ $t(item.label) }}
                </span>
              </el-button>
            </template>
          </component>
        </SwapyItem>
      </Swapy>
    </Scrollable>

    <el-button
      type="primary"
      class="el-button-nav"
      :style="{
        ...buttonHeightStyle,
      }"
      title="Next"
      @click="handleNext"
    >
      <el-icon>
        <CaretRight />
      </el-icon>
    </el-button>
  </div>
</template>

<script>
import { controlBarHeight } from '$control/configs/index.js'
import Install from './install/index.vue'
import Launch from './launch/index.vue'
import Explorer from './explorer/index.vue'
import Gnirehtet from './gnirehtet/index.vue'
import Rotation from './rotation/index.vue'
import Screenshot from './screenshot/index.vue'
import Terminal from './terminal/index.vue'
import Schedule from './schedule/index.vue'
import Volume from './volume/index.vue'

export default {
  components: {
    Screenshot,
    Install,
    Launch,
    Gnirehtet,
    Rotation,
    Volume,
    Explorer,
    Terminal,
    Schedule,
  },
  props: {
    device: {
      type: Object,
      default: () => ({}),
    },
    floating: {
      type: Boolean,
      default: false,
    },
    swapyEnabled: {
      type: Boolean,
      default: false,
    },
    buttonHeight: {
      type: Number,
      default: controlBarHeight,
    },
    buttonClass: {
      type: String,
      default: '',
    },
    showLabels: {
      type: Boolean,
      default: true,
    },
  },
  setup() {
    const controlStore = useControlStore()

    return {
      controlStore,
    }
  },
  data() {
    return {}
  },
  computed: {
    controlModel() {
      const valueMap = {
        switch: {
          label: 'device.control.switch',
          fontIcon: 'i-proicons-menu',
          command: 'input keyevent 187',
        },
        home: {
          label: 'device.control.home',
          fontIcon: 'i-bi-app',
          command: 'input keyevent 3',
        },
        back: {
          label: 'device.control.return',
          fontIcon: 'i-cil-caret-left',
          command: 'input keyevent 4',
        },
        launch: {
          label: 'device.control.launch',
          fontIcon: 'i-famicons-rocket-outline',
          component: 'Launch',
        },
        turnScreenOff: {
          label: 'device.control.turnScreenOff',
          fontIcon: 'i-bi-file-break',
          tips: 'device.control.turnScreenOff.tips',
          trigger: () => {
            window.$preload.scrcpy.helper(this.device.id, '--turn-screen-off')
          },
        },
        notification: {
          label: 'device.control.notification',
          fontIcon: 'i-bi-bell',
          command: 'cmd statusbar expand-notifications',
          tips: 'device.control.notification.tips',
        },
        power: {
          label: 'device.control.power',
          fontIcon: 'i-uiw-poweroff',
          command: 'input keyevent 26',
          tips: 'device.control.power.tips',
        },
        rotation: {
          label: 'device.control.rotation.name',
          fontIcon: 'i-solar-smartphone-rotate-2-outline',
          component: 'Rotation',
        },
        volume: {
          label: 'device.control.volume.name',
          fontIcon: 'i-simple-line-icons-volume-2',
          component: 'Volume',
        },
        screenshot: {
          label: 'device.control.capture',
          fontIcon: 'i-simple-line-icons-camera',
          component: 'Screenshot',
        },
        reboot: {
          label: 'device.control.reboot',
          fontIcon: 'i-iconoir-refresh',
          command: 'reboot',
        },
        install: {
          label: 'device.control.install',
          fontIcon: 'i-bi-file-arrow-up',
          component: 'Install',
        },
        explorer: {
          label: 'device.control.file.name',
          fontIcon: 'i-bi-folder',
          component: 'Explorer',
        },
        terminal: {
          label: 'device.terminal.name',
          fontIcon: 'i-bi-terminal',
          component: 'Terminal',
        },
        schedule: {
          label: 'device.schedule.name',
          fontIcon: 'i-bi-clock',
          component: 'Schedule',
          hiddenKeys: ['floating'],
        },
        gnirehtet: {
          label: 'device.control.gnirehtet',
          fontIcon: 'i-bi-hdd-network',
          component: 'Gnirehtet',
          tips: 'device.control.gnirehtet.tips',
        },
      }

      const isHidden = item =>
        (item.hiddenKeys || []).some(key => this.$props[key])

      const barLayout = [...new Set([...this.controlStore.barLayout, ...Object.keys(valueMap)])]

      const value = barLayout.reduce((arr, key) => {
        const item = valueMap[key]

        if (item && !isHidden(item)) {
          arr.push({
            ...item,
            id: key,
          })
        }

        return arr
      }, [])

      return value
    },
    buttonHeightStyle() {
      if (!this.buttonHeight) {
        return {}
      }

      return {
        height: `${this.buttonHeight}px !important`,
      }
    },
  },
  methods: {
    handlePrev() {
      this.$refs.scrollableRef.scrollBackward()
    },
    handleNext() {
      this.$refs.scrollableRef.scrollForward()
    },
    handleClick(row, trigger) {
      if (trigger) {
        trigger(row)
        return false
      }

      if (row?.command) {
        this.$adb.deviceShell(this.device.id, row.command)
      }
      else if (row?.scrcpyCommand) {
        this.$scrcpy.control(this.device.id, { command: row.scrcpyCommand })
      }
    },
    onSwapEnd(event) {
      const value = event.slotItemMap.asArray.map(obj => obj.item)

      this.controlStore.setBarLayout(value)
    },
  },
}
</script>

<style lang="postcss" scoped>
.control-deck {
  position: relative;
  margin: 0 12px 12px;
  padding: 6px;
  border: 1px solid rgba(34, 211, 238, 0.14);
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.44);
}

.control-deck::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(34, 211, 238, 0.08), transparent 34%, rgba(59, 130, 246, 0.1));
}

.el-button.is-disabled {
  opacity: 0.34;
}

:deep(.control-command) {
  position: relative;
  display: flex !important;
  flex-direction: column;
  gap: 2px;
  min-width: 52px;
  border: 1px solid rgba(34, 211, 238, 0.18) !important;
  border-radius: 7px !important;
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.74), rgba(8, 47, 73, 0.54)) !important;
  color: #bae6fd !important;
  box-shadow: none !important;
}

:deep(.control-command:hover) {
  z-index: 2;
  transform: translateY(-1px);
  border-color: rgba(34, 211, 238, 0.76) !important;
  background: linear-gradient(145deg, rgba(8, 145, 178, 0.54), rgba(37, 99, 235, 0.46)) !important;
  box-shadow: 0 0 20px rgba(34, 211, 238, 0.22) !important;
}

:deep(.control-command .el-icon),
:deep(.control-command i) {
  font-size: 18px;
}

:deep(.control-command.is-icon-only) {
  justify-content: center;
  align-items: center;
  min-width: 48px;
}

:deep(.control-command.is-icon-only .el-icon),
:deep(.control-command.is-icon-only i) {
  margin: 0 !important;
}

.control-command-label {
  width: 100%;
  overflow: hidden;
  color: #cbd5e1;
  font-size: 9px;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.el-button.el-button-nav {
  @apply !flex-none !flex !items-center !justify-center;
  @apply !w-7 !p-0;
  @apply !border-0;
  border-radius: 6px !important;
  opacity: 0.38;
  background: rgba(8, 47, 73, 0.62) !important;
  color: #7dd3fc !important;
}

.el-button.el-button-nav:hover {
  opacity: 1;
  background: rgba(8, 145, 178, 0.62) !important;
  color: #fff !important;
}
</style>
