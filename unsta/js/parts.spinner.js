
import {Ref, Style} from './namespaces.js'

const stretchdelay = keyframes`
  0%, 40%, 100% { transform: scaleY(0.4) }
  20% { transform: scaleY(1.0) }
`

const spinner3Style = css`
  & {
    display: flex;
    justify-content: space-between;
    width: ${6*5+3*4}px;
    height: 30px;
  }
  & > div {
    background-color: ${Style.greyColor};
    width: 6px;
    animation: ${stretchdelay} 1.2s infinite ease-in-out;
  }
  & .rect2 {
    animation-delay: -1.1s;
  }
  & .rect3 {
    animation-delay: -1.0s;
  }
  & .rect4 {
    animation-delay: -0.9s;
  }
  & .rect5 {
    animation-delay: -0.8s;
  }
`

const spinner3 = html`<${React.Fragment}>
  <div className=${spinner3Style}>
    <div className="rect1"></div>
    <div className="rect2"></div>
    <div className="rect3"></div>
    <div className="rect4"></div>
    <div className="rect5"></div>
  </div>
<//>`

const skBouncedelay = keyframes`
  0%, 80%, 100% { 
    transform: scale(0);
  } 40% { 
    transform: scale(1.0);
  }
`

const spinner8Style = (size, color) => css`
& {
  margin: 0 auto 0;
  width: ${size || 70}px;
  text-align: center;
}

& > div {
  width: ${size ? size / 3 : 18}px;
  height: ${size ? size / 3 : 18}px;
  background-color: ${color || "white"};
  border-radius: 100%;
  display: inline-block;
  animation: ${skBouncedelay} 1.4s infinite ease-in-out both;
}

& .bounce1 {
  animation-delay: -0.32s;
}

& .bounce2 {
  animation-delay: -0.16s;
}
`

const spinner8 = (size, color) => {
  const style = spinner8Style(size, color)
  return html`
  <div class=${style}>
    <div class="bounce1"></div>
    <div class="bounce2"></div>
    <div class="bounce3"></div>
  </div>
  `
}

const skFoldCubeAngle = keyframes`
  0%, 10% {
    transform: perspective(140px) rotateX(-180deg);
    opacity: 0; 
  }
  25%, 75% {
    transform: perspective(140px) rotateX(0deg);
    opacity: 1; 
  }
  90%, 100% {
    transform: perspective(140px) rotateY(180deg);
    opacity: 0; 
  }
`

const spinner12Style = (size, color) => css`
& {
  margin: 0 auto;
  width: ${size || 40}px;
  height: ${size || 40}px;
  position: relative;
  transform: rotateZ(45deg);
}
& .sk-cube {
  float: left;
  width: 50%;
  height: 50%;
  position: relative;
  transform: scale(1.1); 
}
& .sk-cube:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: ${color || Style.greyColor};
  animation: ${skFoldCubeAngle} 2.4s infinite linear both;
  transform-origin: 100% 100%;
}
& .sk-cube2 {
  transform: scale(1.1) rotateZ(90deg);
}
& .sk-cube3 {
  transform: scale(1.1) rotateZ(180deg);
}
& .sk-cube4 {
  transform: scale(1.1) rotateZ(270deg);
}
& .sk-cube2:before {
  animation-delay: 0.3s;
}
& .sk-cube3:before {
  animation-delay: 0.6s; 
}
& .sk-cube4:before {
  animation-delay: 0.9s;
}
`

const spinner12 = (size, color) => {
  const style = spinner12Style(size, color)
  return html`<${React.Fragment}>
  <div class=${style}>
    <div class="sk-cube1 sk-cube"></div>
    <div class="sk-cube2 sk-cube"></div>
    <div class="sk-cube4 sk-cube"></div>
    <div class="sk-cube3 sk-cube"></div>
  </div>
  <//>`
}

export const Spinner = () => spinner3
export const Spinner4icon = (size=30, color="white") => spinner8(size, color)

export const SpinnerCenter = props => html`
  <div style=${{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: (props && props.height) || '10rem',    
  }}>
    ${Spinner()}
  </div>
`;


// デスクトップのほぼ中央にスピナー
export const SpinnerOnDesktop = () => {

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
  <div
    style=${{
      position: 'absolute',
      top: 0, left: 0,
      backgroundColor: 'rgba(0, 0, 0, 0)',
      width: scrollWidth + 'px', height: scrollHeight + 'px',
    }}  
  >
    <div style=${{
      position: 'absolute',
      top: '40vh', left: '50%',
      transform: 'translate(-50%, -50%)',
    }}>
      ${spinner12(80, "white")}
    </div>  
  </div>
  `, Ref.desktop
  )
}


// スピナー付きメッセージ
export const ModalSpinner = class extends React.Component { 
  constructor(props) {
    super(props)
    this.state = {
      show: false,
      message: null,
    }
  }
  show(message) {
    this.setState({show: 1, message, })
  }
  hide() {
    this.setState({show: false})
  }
  render() {
    const show = this.state.show
    if (!show) return null

    window.scrollTo(0, 0) // 念の為強制スクロール

    const style = {
      display: 'flex',
      flexDirection: 'column',
      position: 'absolute',
      top: '40vh', left: '50%',
      transform: 'translate(-50%, -50%)',
      borderRadius: '5px',
      borderWidth: 0,
      width: '90%',
      maxWidth: '300px',
      minHeight: '8rem',
      background: Style.background,
      padding: '1rem',
      boxShadow: '4px 4px 16px rgba(0, 0, 0, 0.5)',
    }

    const msg = this.state.message

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
    <div
      style=${{
        position: 'absolute',
        top: 0, left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        width: scrollWidth + 'px', height: scrollHeight + 'px',
      }}  
    >
      <div style=${style}>
        <div style=${{display:'flex', marginTop:'1rem', justifyContent:'center'}}>
          ${msg ? msg : ''}
        </div>
        <div style=${{display:'flex', marginTop:'2rem', justifyContent:'center'}}>
          ${spinner3}
        </div>
      </div>
    </div>
    `, Ref.desktop
    )
  }
}
