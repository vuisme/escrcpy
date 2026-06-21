import ColorPicker from './color-picker/index.vue'
import Input from './input/index.vue'
import InputNumber from './input-number/index.vue'
import InputPath from './input-path/index.vue'
import Select from './select/index.vue'
import SelectAudioCodec from './select-audio-codec/index.vue'
import SelectCameraFps from './select-camera-fps/index.vue'
import SliderCameraZoom from './slider-camera-zoom/index.vue'
import SelectDisplay from './select-display/index.vue'
import SelectKeyboardInject from './select-keyboard-inject/index.vue'
import SelectVideoCodec from './select-video-codec/index.vue'
import Switch from './switch/index.vue'

export const inputModel = {
  PathInput: InputPath,
  VideoCodecSelect: SelectVideoCodec,
  AudioCodecSelect: SelectAudioCodec,
  DisplaySelect: SelectDisplay,
  KeyboardInjectSelect: SelectKeyboardInject,
  CameraFpsSelect: SelectCameraFps,
  CameraZoomSlider: SliderCameraZoom,

  ColorPicker,
  Input,
  InputNumber,
  InputPath,
  Select,
  SelectAudioCodec,
  SelectDisplay,
  SelectKeyboardInject,
  SelectVideoCodec,
  Switch,
}
