<template>
  <el-color-picker
    v-bind="{
      clearable: true,
      ...(data.props || {}),
    }"
  >
    <template v-if="data.append" #append>
      {{ data.append }}
    </template>
  </el-color-picker>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
  },
}
</script>

<style></style>
