<template>
  <el-dropdown :hide-on-click="false" toggle="click">
    <el-button
      type="primary"
      text
      :disabled="['unauthorized', 'offline'].includes(row.status)"
      icon="CirclePlus"
      :title="$t('device.actions.more.name')"
    >
    </el-button>

    <template #dropdown>
      <el-dropdown-menu>
        <component
          :is="item.component"
          v-for="(item, index) of options"
          :key="index"
          v-bind="{
            ...$props,
            ...(item.props || {}),
          }"
          v-slot="{ loading, trigger }"
        >
          <el-dropdown-item :disabled="loading" @click="trigger">
            <template v-if="loading">
              <el-icon class="is-loading">
                <Loading />
              </el-icon>
              {{ $t('common.starting') }}
            </template>
            <template v-else>
              <i :class="item.icon" class="mr-2"></i>
              {{ $t(item.label) }}
            </template>
          </el-dropdown-item>
        </component>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import Record from './components/record/index.vue'
import Camera from './components/camera/index.vue'
import Otg from './components/otg/index.vue'
import Custom from './components/custom/index.vue'

const props = defineProps({
  ...Record.props,
  ...Otg.props,
  ...Camera.props,
  ...Custom.props,
})

const options = computed(() => {
  return [
    {
      label: 'device.actions.more.record.name',
      icon: 'i-bi-record-circle',
      component: Record,
    },
    {
      label: 'device.actions.more.recordCamera.name',
      icon: 'i-bi-camera-video',
      component: Record,
      props: {
        recordType: 'camera',
      },
    },
    {
      label: 'device.actions.more.recordAudio.name',
      icon: 'i-bi-mic',
      component: Record,
      props: {
        recordType: 'audio',
      },
    },
    {
      label: 'device.actions.more.camera.name',
      icon: 'i-bi-camera',
      component: Camera,
    },
    {
      label: 'device.actions.more.otg.name',
      icon: 'i-bi-usb-symbol',
      component: Otg,
    },
    {
      label: 'device.actions.more.custom.name',
      icon: 'i-bi-terminal',
      component: Custom,
    },
  ]
})
</script>

<style></style>
