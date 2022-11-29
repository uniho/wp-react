
import {Ref, Style} from './namespaces.js'

// デスクトップモーダルなダイアログボックス
export const DialogBox = class extends React.Component { 
  constructor(props) {
    super(props)
    this.state = {
      show: false,
      message: null,
      msec: 300,
    }
    this.timeId = false
    this.handleClick = this.handleClick.bind(this)
  }
  componentWillUnmount() {
    if (this.timeId) clearTimeout(this.timeId)
  }
  handleClick(e) {
    if (this.props.closeIfClickDesktop) this.hide()
  }
  show(message) {
    this.setState({show: 1, message, })
  }
  hide() {
    this.setState({show: -1})
    if (this.timeId) clearTimeout(this.timeId)
    this.timeId = setTimeout(() => {
      this.timeId = false
      this.setState({show: false})
    }, this.state.msec)
  }
  render() {
    const show = this.state.show
    if (!show) return null

    window.scrollTo(0, 0) // 念の為強制スクロール

    const style = {
      marginTop: this.props.top || '10rem',
      borderRadius: '5px',
      borderWidth: 0,
      width: '90%',
      maxWidth: this.props.width || '300px',
      //minHeight: this.props.height || 'auto',
      background: Style.background,
      padding: this.props.padding || '1rem',
      boxShadow: '4px 4px 16px rgba(0, 0, 0, 0.5)',
      animationName: open,
      animationDuration: `${this.state.msec}ms`,
    }

    if (show < 0) {
      style.animationName = close
      style.opacity = 0
    }  

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
    <div onClick=${this.handleClick}
      style=${{
        position: 'absolute',
        top: 0, left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        width: scrollWidth + 'px', height: scrollHeight + 'px',
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}
    >
      <div style=${style}>
        ${this.state.message}
      </div>
    </div>
    `, Ref.desktop)
  }
}

//
const open = keyframes`
  0% {
    opacity: 0;
    transform: scale3d(1.1, 1.1, 1);
  }
  100% { 
    opacity: 1; 
    transform: scale3d(1, 1, 1); 
  }
`

const close = keyframes`
  0% {
    opacity: 1;
  }
  100% { 
    opacity: 0; transform: 
    scale3d(0.9, 0.9, 1); 
  }
`

// 標準ダイアログボックス
export const StdDialogBox = class extends DialogBox { 
  constructor(props) {
    super(props)
    this.handleKeyDown = this.handleKeyDown.bind(this)
  }
  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown, true);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown, true);
  }
  handleKeyDown(e) {
    if (!this.state.show) return;
    e.preventDefault()
    e.stopPropagation()
    let selectButton
    switch (e.keyCode) {
      case 0x25: // left
        selectButton = this.state.selectButton - 1
        if (selectButton < 0) selectButton = this.buttons.length - 1
        this.setState({selectButton})
        this.showSub(selectButton)
        break;
      case 0x27: // right
        selectButton = this.state.selectButton - 1
        if (selectButton >= this.buttons.length) selectButton = 0
        this.setState({selectButton})
        this.showSub(selectButton)
        break;
      case 0x0d: // enter
        if (this.callback) this.callback(e, this.state.selectButton)
        this.hide()
        break;
      case 0x1b: // esc
        if (this.callback) this.callback(e, -1)
        this.hide()
        break;
    }
  }
  showSub(selectButton) {
    const Buttons = this.buttons.map((b, index) => {
      const Callback = this.callback ? this.callback : this.handleClick
      const c = index === selectButton ? 'btn--raised2' : 'btn--flat';
      return html`
        <button key=${index} className=${c} style=${{margin:"0 .25rem"}}
          onClick=${e => {
            this.hide()
            Callback(e, index)
          }}
        >
          ${b}
        </button>
      `
    })
    
    super.show(
      html`
      <div
        style=${{display: 'flex', flexDirection: 'column'}}
      >
        <div>${this.title}</div>
        <div
          style=${{marginTop: '2rem'}}
        >
          ${this.message}
        </div>
        <div
          style=${{display: 'flex', marginTop: '2rem', justifyContent: 'space-around'}}
        >
          ${Buttons}
        </div>  
      </div>  
      `
    )
  }
  show(message, title, defbutton, buttons, callback) {
    this.message = message
    this.title = title
    this.buttons = buttons
    this.callback = callback
    let selectButton = 0
    if (defbutton >= 0 && defbutton < this.buttons.length) {
      selectButton = defbutton
    }
    this.setState({selectButton})
    this.showSub(selectButton)
  }
}


// メッセージを表示するダイアログボックス
export const MessageBox = class extends StdDialogBox { 
  show(message, title, button, callback) {
    super.show(message, title, -1, [button || '閉じる'], callback)
  }
}


// システムモーダルなダイアログボックス
export const SysDialogBox = class extends React.Component { 
  constructor(props) {
    super(props)
    this.state = {
      show: false,
      message: null,
    }
    this.handleClick = this.handleClick.bind(this)
  }
  handleClick(e) {
    this.hide();
  }
  show(message) {
    const w = document.body.clientWidth
    document.body.style.overflow = 'hidden'
    if (document.body.clientWidth != w) {
      document.body.style.paddingRight = `${document.body.clientWidth - w}px` 
    }
    this.setState({show: 1, message, })
  }
  hide() {
    document.body.style.overflow = ''   
    document.body.style.paddingRight = 0 
    this.setState({show: false})
  }
  render() {
    const show = this.state.show
    if (!show) return null

    const style = {
      borderRadius: '5px',
      borderWidth: 0,
      width: '90%',
      maxWidth: '300px',
      minHeight: '10rem',
      background: Style.background,
      padding: '1rem',
    }

    return ReactDOM.createPortal(html`
    <div onClick=${this.handleClick}
      style=${{
        position: 'fixed',
        zIndex: 99,
        top: 0, left: 0, width: '100%', height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, .7)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
      }}
    >
      <div style=${style}>
        ${this.state.message}
      </div>  
    </div>
    `, Ref.desktop
    )
  }
}
