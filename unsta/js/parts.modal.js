import {Ref} from './namespaces.js'

//
export const ModalDesktop = props => {

  const scrollWidth = Math.max(
    document.body.scrollWidth, document.documentElement.scrollWidth,
    document.body.offsetWidth, document.documentElement.offsetWidth,
    document.body.clientWidth, document.documentElement.clientWidth
  )
  
  const scrollHeight = Math.max(
    document.body.scrollHeight, document.documentElement.scrollHeight,
    document.body.offsetHeight, document.documentElement.offsetHeight,
    document.body.clientHeight, document.documentElement.clientHeight
  )
  
  return ReactDOM.createPortal(html`
    <div style=${Object.assign({
        position: 'absolute',
        top: 0, left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        width: scrollWidth + 'px', height: scrollHeight + 'px',
      }, props.style)}  
      onClick=${props.onClick}
      className=${props.c}
    >
      ${props.children}
    </div>
  `, Ref.desktop)
}

//
export const ModalSystem = props => {
  return ReactDOM.createPortal(html`
    <div style=${Object.assign({
        position: 'fixed',
        zIndex: 99,
        top: 0, left: 0, width: '100%', height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, .7)',
      }, props.style)}  
      onClick=${props.onClick}
      className=${props.c}
    >
      ${props.children}
    </div>
  `, Ref.desktop)
}

export const scrollLock = lock => {
  if (lock) {
    const w = document.body.clientWidth
    document.body.style.overflow = 'hidden'
    if (document.body.clientWidth != w) {
      document.body.style.paddingRight = `${document.body.clientWidth - w}px` 
    }
  } else {
    document.body.style.overflow = ''   
    document.body.style.paddingRight = 0 
  }
}