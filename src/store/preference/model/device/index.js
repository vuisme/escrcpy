export default {
  label: 'preferences.device.name',
  field: 'scrcpy',

  children: {
    showTouches: {
      label: 'preferences.device.show-touch.name',
      field: '--show-touches',
      type: 'Switch',
      value: undefined,
      placeholder: 'preferences.device.show-touch.placeholder',
      tips: 'preferences.device.show-touch.tips',
    },
    stayAwake: {
      label: 'preferences.device.stay-awake.name',
      field: '--stay-awake',
      type: 'Switch',
      value: undefined,
      placeholder: 'preferences.device.stay-awake.placeholder',
      tips: 'preferences.device.stay-awake.tips',
    },
    turnScreenOff: {
      label: 'preferences.device.control-in-close-screen.name',
      field: '--turn-screen-off',
      type: 'Switch',
      value: undefined,
      placeholder: 'preferences.device.control-in-close-screen.placeholder',
    },
    powerOffOnClose: {
      label: 'preferences.device.control-end-video.name',
      field: '--power-off-on-close',
      type: 'Switch',
      value: undefined,
      placeholder: 'preferences.device.control-end-video.placeholder',
    },
    noPowerOn: {
      label: 'preferences.device.control-in-stop-charging.name',
      field: '--no-power-on',
      type: 'Switch',
      value: undefined,
      placeholder: 'preferences.device.control-in-stop-charging.placeholder',
      tips: 'preferences.device.control-in-stop-charging.tips',
    },
    overlayDisplay: {
      label: 'preferences.device.display-overlay.name',
      field: '--display-overlay',
      type: 'Input',
      value: undefined,
      placeholder: 'preferences.device.display-overlay.placeholder',
      tips: 'preferences.device.display-overlay.tips',
    },
  },
}
