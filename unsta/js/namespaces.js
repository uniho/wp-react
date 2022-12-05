
export const Style = {} // color, size, etc.
export const Ref = {} // DOM Element または Component への参照
export const Sys ={} // 機能など

export const Const = {
  // タッチデバイスなら true
  isTouchDevice: 
    ('ontouchstart' in window.document.documentElement) 
    || window.navigator.maxTouchPoints > 0
    || window.navigator.msMaxTouchPoints > 0,

  // スマホサイズなら true  
  isSmartPhone: document.documentElement.clientWidth < 640,

}
