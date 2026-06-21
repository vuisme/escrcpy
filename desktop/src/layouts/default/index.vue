<template>
  <div
    class="tvr-shell absolute inset-0 h-full flex overflow-hidden"
  >
    <aside class="tvr-rail app-region-drag flex flex-col items-center gap-3">
      <img src="$electron/resources/build/logo.png" class="tvr-rail-logo" alt="" />

      <button
        v-for="item of tabsModel"
        :key="item.value"
        type="button"
        class="tvr-rail-tab app-region-no-drag"
        :class="{ 'is-active': activeTab === item.value }"
        :title="$t(item.label)"
        @click="activeTab = item.value"
      >
        <i :class="item.icon"></i>
      </button>
    </aside>

    <div class="tvr-stage flex min-w-0 flex-1 flex-col">
      <AppHeader class="flex-none">
        <template #default>
          <div class="tvr-title-stack">
            <div class="tvr-eyebrow">
              TheVisionReality
            </div>
            <div class="tvr-page-title">
              {{ activeTabLabel }}
            </div>
          </div>
        </template>

        <template #right>
          <QuickBar />
        </template>
      </AppHeader>

      <main class="tvr-main flex-1 min-h-0 overflow-auto">
        <RouterView v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<script setup>
import AppHeader from '$/components/app-header/index.vue'
import QuickBar from '$/components/quick-bar/index.vue'

const router = useRouter()
const route = useRoute()

const tabsModel = [
  {
    label: 'device.list',
    value: '/device',
    icon: 'i-bi-headset-vr',
  },
  {
    label: 'preferences.name',
    value: '/preference',
    icon: 'i-bi-sliders',
  },
  {
    label: 'about.name',
    value: '/about',
    icon: 'i-bi-info-circle',
  },
]

const activeTab = computed({
  get() {
    return route.path
  },
  set(value) {
    router.push(value)
  },
})

provide('activeTab', activeTab)

const activeTabLabel = computed(() => {
  const tab = tabsModel.find(item => item.value === activeTab.value)
  return tab ? window.t(tab.label) : ''
})
</script>

<style lang="postcss" scoped>
.tvr-shell {
  background:
    linear-gradient(90deg, rgba(34, 211, 238, 0.1), transparent 32%),
    radial-gradient(circle at 20% 0%, rgba(14, 165, 233, 0.22), transparent 24%),
    radial-gradient(circle at 100% 80%, rgba(59, 130, 246, 0.18), transparent 30%);
}

.tvr-rail {
  width: 76px;
  padding: 14px 10px;
  border-right: 1px solid rgba(34, 211, 238, 0.18);
  background: rgba(2, 6, 23, 0.72);
  box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.04);
}

.tvr-rail-logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
  filter: drop-shadow(0 0 18px rgba(34, 211, 238, 0.42));
}

.tvr-rail-tab {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(34, 211, 238, 0.2);
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.56);
  color: #94a3b8;
  transition: 160ms ease;
}

.tvr-rail-tab i {
  font-size: 20px;
}

.tvr-rail-tab:hover,
.tvr-rail-tab.is-active {
  border-color: rgba(34, 211, 238, 0.72);
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.26), rgba(37, 99, 235, 0.34));
  color: #e0f2fe;
  box-shadow:
    0 0 26px rgba(34, 211, 238, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.tvr-stage {
  padding: 10px 12px 12px;
}

.tvr-main {
  margin-top: 10px;
}

.tvr-eyebrow {
  color: #67e8f9;
  font-size: 11px;
  line-height: 1;
  letter-spacing: 0;
  text-transform: uppercase;
}

.tvr-page-title {
  margin-top: 4px;
  color: #f8fafc;
  font-size: 20px;
  font-weight: 800;
  line-height: 1.05;
}
</style>
