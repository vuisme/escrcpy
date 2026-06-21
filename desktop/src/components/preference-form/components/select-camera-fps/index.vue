<template>
  <el-select
    v-bind="{
      clearable: true,
      ...(data.props || {}),
    }"
    v-model="selectValue"
    class="!w-full"
    @focus="getOptions"
  >
    <el-option
      v-for="(item, index) in options"
      :key="index"
      :label="$t(item.label)"
      :value="item.value"
    >
    </el-option>
  </el-select>
</template>

<script>
import { getDeviceId } from '../helper.js'

export default {
  props: {
    modelValue: {
      type: [String, Number],
      default: void 0,
    },
    data: {
      type: Object,
      default: () => ({}),
    },
    deviceScope: {
      type: String,
      default: '',
    },
    preferenceData: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['update:model-value'],
  data() {
    return {
      deviceOptions: [],
    }
  },
  computed: {
    options() {
      return this.deviceOptions.length ? this.deviceOptions : this.data.options
    },
    selectValue: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:model-value', value)
      },
    },
  },
  watch: {
    'preferenceData.--camera-facing': {
      handler() {
        this.getOptions()
      },
    },
  },
  methods: {
    async getOptions() {
      const deviceId = getDeviceId(this.deviceScope)

      if (!deviceId) {
        return false
      }

      const res = await this.$scrcpy.getCameraList(deviceId, { dedupe: true })

      const cameraFacing = this.preferenceData['--camera-facing'] || 'back'

      const data = res.find(item => item.facing === cameraFacing)

      const fps = data?.fps || []

      if (!fps.length) {
        return false
      }

      this.deviceOptions = fps.map((item) => {
        return {
          label: `${item} FPS`,
          value: item,
        }
      })
    },
  },
}
</script>

<style></style>
