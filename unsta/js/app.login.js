
import {Const, Style, Ref} from './namespaces.js'
import {cssBase} from './style.js'
import {ModalSpinner} from './parts.spinner.js'
import {Snackbar} from './parts.snackbar.js'
import IconEye from './icons/eye.js'
import IconEyeOff from './icons/eye-off.js'

// ログイン App
export default props => {
  return html`
  <div className=${cssBase} ref=${e => Ref.desktop = e}>
    <${Page}/>
  </div>
  `
}

//
const Page = props => {

  let modalSpinner, snackbar;

  const [state, setState] = React.useState({user: '', pass: ''})
  const [statePass, setStatePass] = React.useState('password')
  const [stateFocusPass, setStateFocusPass] = React.useState(false)

  const handleChange = e => {
    state[e.target.name] = e.target.value;
    const newobj = Object.assign({}, state) // オブジェクトを新しくして更新を通知
    setState(newobj);
  }

  const refInputId = React.useRef()
  const refInputPass = React.useRef()

  React.useEffect(() => {
    // on componentDidMount
    if (!Const.isTouchDevice) {  // あると、スマホでIMEが起動してうざいので PC のみ
      refInputId.current.focus()
    }

    refInputPass.current.addEventListener('focus', (event) => {
      setStateFocusPass(true)
    })
    refInputPass.current.addEventListener('blur', (event) => {
      setStateFocusPass(false)
    })
  }, [])

  //
  const doLogin = async(e) => {
    if (!state.user) {
      refInputId.current.focus()
      return
    }

    if (!state.pass) {
      refInputPass.current.focus()
      return
    }
    
    modalSpinner.show('ログイン中です...')
    try {
      const r = await fetch('/index.php?rest_route=/unsta/v1/post-api/login/-', {
        method: 'POST', 
        mode: 'cors', credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': window.unstaToken,
        }, 
        body: JSON.stringify({
          name: state.user, pass: state.pass,
        }),
      })

      if (r.status == 200 || r.status == 403) {
        // 成功
        location.href = 'index.php?page_id=190'
      } else {
        snackbar.show('登録されていません。abcd 1234')
      }
    } finally {
      modalSpinner.hide()
    }            
  }

  return html`<${Fragment}>

  <${ModalSpinner} ref=${e => modalSpinner = e} />
  <${Snackbar} ref=${e => snackbar = e} />

  <div className=${cssPage}>
    <div className="flex-col">
      <div className="flex-col">
        <label htmlFor="login-id">メールアドレス</label>
        <input name="user" id="login-id" type="text" ref=${refInputId}
          value=${state.user} onChange=${handleChange}
          style=${{marginTop:'.25rem'}}
        />
      </div>
    </div>
    
    <div className="flex-col mt-4">
      <div className="flex-col">
        <label htmlFor="login-pw">パスワード</label>
        <div className=${cx(cssPass, {focus:stateFocusPass})}>
          <input name="pass" id="login-pw" type=${statePass} ref=${refInputPass}
            value=${state.pass} onChange=${handleChange}
          />
          <div className="eye" onClick=${e => {
            if (statePass == 'password') {
              setStatePass('text')
            } else {
              setStatePass('password')
            }
            refInputPass.current.focus()
          }}>
            ${
              statePass == 'password' ? 
                html`<${IconEye} size="1.2rem"/>` :
                html`<${IconEyeOff} size="1.2rem"/>`
            }
          </div>
        </div>
      </div>
    </div>

    <button className="btn--raised2 mt-8 w-full" onClick=${doLogin}>ログイン</button>

    <button className="btn--flat mt-8 w-full" onClick=${e => {
    }}>
      パスワードをリセットする
    </button>

  </div>

  <//>`
}

const cssPage = css`
  /* div {
    background-color: var(--wp--preset--color--primary);
  } */
`;

//
const cssPass = css`
  position: relative;
  // input と同じ感じで表示されるフィールドなど(テキスト)
  border: thin solid ${Style.textLight};
  border-radius: 0;
  overflow: hidden;
  font-family : inherit;
  font-size : 100%;
  /*letter-spacing: .04em;*/
  line-height: 1.4;
  white-space: nowrap; /* 改行しない */
  height: 2rem;
  margin-top: .25rem;
  &.focus {
    border-color: ${Style.primary};
  }
  input {
    width: calc(100% - 2rem);
    border: none !important;
    margin-top: -.25rem;
    padding-right: 0 !important;
    height: 2.25rem !important;
  }
  .eye {
    position: absolute;
    display: flex;
    justify-content:center; align-items:center;
    right: 0; top: 0;
    width: 2rem; height: 2rem;
    padding: 0;
    background: rgba(0,0,0,0);
    cursor: pointer;
  }
`;
