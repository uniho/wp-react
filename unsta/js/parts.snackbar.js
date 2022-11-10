
import IconBatsu from './icons/batsu.js'
import {Style, Ref} from './namespaces.js'

// Snackbar
export const Snackbar = class extends React.Component { 
  constructor(props) {
    super(props)
    this.state = {
      show: false,
      message: null,
    }
    this.timeId = false
    this.showAnimeDuration = 1000
    this.hideAnimeDuration = 300
    this.handleClick = this.handleClick.bind(this)
  }
  componentWillUnmount() {
    if (this.timeId) clearTimeout(this.timeId)
  }
  handleClick(e) {
    this.hide();
  }
  show(message, msec) {
    this.setState({show: 1, message})
    if (!msec || msec < 1000 || msec > 180000) msec = 5000;
    if (this.timeId) clearTimeout(this.timeId)
    this.timeId = setTimeout(() => {
      this.timeId = false
      this.hide()
    }, msec)
  }
  hide() {
    this.setState({show: -1})
    if (this.timeId) clearTimeout(this.timeId)
    this.timeId = setTimeout(() => {
      this.timeId = false
      this.setState({show: false})
    }, this.hideAnimeDuration)
  }
  render() {
    const show = this.state.show
    if (!show) return null

    const style ={
      top: '10px',
      opacity: '0.9',
      animationName: kfShow,
      animationDuration: `${this.showAnimeDuration}ms`,
      animationTimingFunction: 'cubic-bezier(.64,.09,.08,1)',
    }
    if (show < 0) {
      style.animationName = kfHide, 
      style.animationDuration = `${this.hideAnimeDuration}ms`
      style.animationTimingFunction = 'ease-in'
      style.animationFillMode = 'forwards' // keyframeアニメーション終了時に終了時の状態を維持する
    }

    return ReactDOM.createPortal(html`
    <div className="${snackbarStyle} snackbar" style=${style}>
      <div className="caption">
        <div className="icon" onClick=${this.handleClick}>
          <${IconBatsu} size=16 strokeWidth=4 />
        </div>
      </div>
      <div className="body">${this.state.message}</div>
    </div>
    `, Ref.desktop)
  }
}

//
const kfShow = keyframes`
  0% { transform: translateY(calc(-100% - 10px)); opacity: 0; }
  100% { transform: translateY(0); opacity: 0.9; }
`

const kfHide = keyframes`
  0% { transform: translateX(0); opacity: 0.9; }
  100% { transform: translateX(calc(50vw + 50%)); opacity: 0; }
`

const snackbarStyle = css`
  &.snackbar {
    display: flex;
    flex-direction: column;
    z-index: 99;
    position: fixed;
    border-radius: 5px;
    border-width: 0;
    width: 90%;
    max-width: 300px;
    background-color: ${Style.secondary};
    color: ${Style.textOnSecondary};
    padding: 0;
    /* 下記４つの指定で横センタリングになる */
    right: 0;
    left: 0;
    margin-right: auto;
    margin-left: auto;

    .caption {
      display: flex;
      justify-content: flex-end;
    }

    .icon {
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      height: 30px;
      width: 30px;
      min-width: 30px;
      max-width: 30px;
      border-radius: 4px;
    }

    .icon:active {
      padding-left: 2px;
      padding-top: 2px;
    }

    .body {
      margin: 0 1rem 2rem 1rem;
      white-space: pre-wrap; /* 改行コードで改行するように */
    }
  }
`
