
import {Const, Style, Ref} from './namespaces.js'
import {cssBase} from './style.js'
import {ModalSpinner} from './parts.spinner.js'
import {Snackbar} from './parts.snackbar.js'
import {DialogBox, StdDialogBox, MessageBox} from './parts.dialog-box.js'
import post2rest from './submod.post2rest.js'
import IconEye from './icons/eye.js'
import IconEyeOff from './icons/eye-off.js'

// ログイン App
export default props => {
  Const.uri = props.uri
  resource = getResource() // Start Fetch

  return html`
  <div className=${cssBase} ref=${e => Ref.desktop = e}>
    <${Suspense} fallback=${html`<div>Loading...</div>`}>
      <${Page}/>
    <//>
  </div>
  `
}

let resource

const getResource = async function() {
  const res = {}
  res.userResponce = await fetch(Const.uri + '/index.php?rest_route=/unsta/v1/api/current-user/-', {
    mode: 'cors', credentials: 'include',
  })

  if (res.userResponce.ok) {
    const json = await res.userResponce.json()
    res.user = json.data
    if (res.user.id) {
      location.href = Const.uri + '/?page_id=' + Const.pageID.myPage
    }
  }

  return res
}

//
const Page = props => {
  const data = React.use(resource)
  if (data.user?.id) return null;

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
      try {
        const r = await fetch(Const.uri + '/?rest_route=/unsta/v1/api/login/-', {
          method: 'POST', 
          mode: 'cors', credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }, 
          body: JSON.stringify({
            name: state.user, pass: state.pass,
          }),
        })
  
        if (r.status == 200 || r.status == 403) {
          // 成功
          location.href = Const.uri + '/?page_id=' + Const.pageID.myPage
        } else {
          throw new Error(await r.json() + ` (${r.status})`)
        }
      } catch(e) {
        messageBox.show(e.message)
      }
    } finally {
      modalSpinner.hide()
    }            
  }

  const resetData = React.useRef(false)

  //
  const doReset = e => {

    if (!state.user) {
      refInputId.current.focus()
      return
    }

    const doSend = async() => {
      modalSpinner.show('送信中です...')
      try {
        try {
          if (!resetData.current) {
            const r = await post2rest(
              '/?rest_route=/unsta/v1/api/reset-pass1/-', {
                mail: state.user,
              },
            )
      
            const json = await r.json()
            if (!r.ok) throw new Error(r.status + ':' + json)
  
            if (json.data) {
              // メール送信成功
              resetData.current = json.data
              resetData.current.mail = state.user
            } else {
              let r = json.error?.message || "ERROR!"
              if (r == 'unknown mail') r = '未登録のメールアドレスです'
              throw new Error(r)
            }
          }
  
          if (resetData.current) {
            resetPassDialog.show({
              message: '確認コードと新しいパスワードを入力してください。', 
              title: '',
              data: resetData.current,
              callback: (e, r) => {
                if (r == 'OK') {
                  location.href = Const.uri + '/?page_id=' + Const.pageID.myPage
                  return
                }  
                if (r == 'CXL') return;
                if (r == 'no pass') r = '新しいパスワードを入力してください'
                if (r == 'bad pass') r = '新しいパスワードが短すぎるか、不正な文字が含まれています'
                if (r == 'code mismatch') r = '確認コードが違います'
                if (r == 'over challenge') r = '回数制限を越えました'
                snackbar.show(r)
              }
            })
          }
        } catch(e) {
          snackbar.show(e.message)
        }
      } finally {
        modalSpinner.hide()
      }            
    } 

    confirmBox.show(state.user + ' 宛てに確認コードを送信します。よろしいですか？', '確認', 1, 
      ['送信する', 'キャンセル'], (e, index) => {
        if (index == 0) doSend()
      })
  }

  return html`<${Fragment}>

  <${ModalSpinner} ref=${e => modalSpinner = e} />
  <${Snackbar} ref=${e => snackbar = e} />
  <${MessageBox} ref=${e => messageBox = e} />
  <${StdDialogBox} ref=${e => confirmBox = e} />
  <${ResetPassDialog} ref=${e => resetPassDialog = e} />

  <div className=${cx(cssPage, 'flex j-center')}>
    <div className='login-form shadow fade-in animation-delay0'>
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

      <button className="btn--raised2 mt-8 w-full" onClick=${doLogin}>
        ログイン
      </button>

      <button className="btn--flat mt-8 w-full" onClick=${doReset}>
        パスワードをリセットする
      </button>
    </div>
  </div>
  <//>`
}

let modalSpinner, snackbar, confirmBox, messageBox, resetPassDialog;

//
const cssPage = css`
  .login-form {
    padding: 2rem;
    flex-basis: 100%;
    @media screen and (max-width : ${Style.breakpoint.sm}px) {
      padding: .5rem;
    }  
  }
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
    color: ${Style.textLight};
    background: rgba(0,0,0,0);
    cursor: pointer;
  }
  &.focus {
    border-color: ${Style.primary};
    .eye {
      color: ${Style.primary};
    }
  }
`;

//
const ResetPassDialog = class extends DialogBox { 
  constructor(props) {
    super(props)
  }
  show(props) {
    props.hide = this.hide.bind(this)
    super.show(html`<${ResetPassDialogInner} ...${props} />`)
  }
}

//
const ResetPassDialogInner = props => { 

  const [state, setState] = React.useState({code: '', pass: ''})

  const handleChange = e => {
    state[e.target.name] = e.target.value;
    const newobj = Object.assign({}, state) // オブジェクトを新しくして更新を通知
    setState(newobj);
  }
  
  const checkInput = async(e) => {
    if (!state.pass) {
      props.callback(e, 'no pass')
      return
    }

    modalSpinner.show('確認中です...')
    try {
      try {
        const r = await post2rest(
          '/?rest_route=/unsta/v1/api/reset-pass2/-', {
            code: state.code, pass: state.pass, uid: props.data.uid, hash: props.data.hash, mail: props.data.mail,
          },
        )

        const json = await r.json()
        if (r.ok) {
          if (json.data) {
            props.callback(e, 'OK')
            props.hide()
            return
          }
        }
        props.callback(e,  json.error?.message + ` (${r.status})`)
      } catch(e) {
        props.callback(e, e.message)
      }
    } finally {
      modalSpinner.hide()
    }
  }
  
  return html`
  <div className="flex-col">
    <div>${props.title}</div>
    <div className="mt-4">
      ${props.message}
    </div>

    <div className="flex-col mt-4">
      <div className="flex-col">
        <label htmlFor="code">確認コード</label>
        <input name="code" id="code" type="text"
          value=${state.code} onChange=${handleChange}
          style=${{marginTop:'.25rem'}}
        />
      </div>
    </div>
    
    <div className="flex-col mt-4">
      <div className="flex-col">
        <label htmlFor="pass">新しいパスワード</label>
        <input name="pass" id="pass" type="password"
          value=${state.pass} onChange=${handleChange}
          style=${{marginTop:'.25rem'}}
        />
      </div>
    </div>

    <button className="btn--raised2 mt-8 w-full" onClick=${checkInput}>
      パスワードを変更する
    </button>

    <button className="btn--flat mt-8 w-full" onClick=${e => {
      props.callback(e, 'CXL')
      props.hide()
    }}>          
      キャンセル
    </button>

  </div>  
  `
}
