import {Const, Style, Ref} from './namespaces.js'
import {cssBase} from './style.js'
import {ModalSpinner} from './parts.spinner.js'
import {ModalDesktop} from './parts.modal.js'
import IconMenu from './icons/menu.js'
import IconRight from './icons/chevron-right.js'

// User Home App
export default props => {
  Const.uri = props.uri
  Const.wp_nonce = props.wp_nonce
  Const.wp_object_id = props.wp_object_id
  Const.wp_object_slug = props.wp_object_slug
  Const.wp_user_is_admin = props.wp_user_is_admin
  resource = getResource()
  return html`
  <div className=${cssBase} ref=${e => Ref.desktop = e}>
    <${Suspense} fallback=${html`<div>...</div>`}>
      <${Page}/>
    <//>
  </div>
  `
}

let resource

const getResource = async function() {
  const res = {}

  if (Const.wp_object_slug == 'my-page') {
    res.userResponce = await fetch(Const.uri + '/?rest_route=/unsta/v1/api/current-user/fields', {
      mode: 'cors', credentials: 'include',
    })

    if (res.userResponce.ok) {
      const json = await res.userResponce.json()
      res.user = json.data
    }
  } else if (Const.wp_user_is_admin) { 
    // ダッシュボードから kokyaku CPT を表示する場合
    res.userResponce = await fetch(
      Const.uri + `/?rest_route=/unsta/v1/api/get-wpobj/${Const.wp_object_id}`,
      {
        mode: 'cors', credentials: 'include',
        headers: {'X-WP-Nonce': Const.wp_nonce}, // nonce が必要
      }
    )

    if (res.userResponce.ok) {
      const json = await res.userResponce.json()
      res.user = json.data
      res.user.id = Const.wp_object_id
      res.user.name = json.data?.Title
    }
  }

  if (res.user?.id) {
    // web analytics を取得
    res.waResponce = await fetch(Const.uri + `/?rest_route=/unsta/v1/api/query-wp-post/${res.user.id}`, {
      mode: 'cors', credentials: 'include',
      headers: {'X-WP-Nonce': Const.wp_nonce}, // kokyaku CPT の場合には nonce が必要
    })
  
    if (res.waResponce.ok) {
      const json = await res.waResponce.json()
      res.wa = json.data
      // console.log(res.wa)
    }

    if (res.user.url2title) {
      const rows = res.user.url2title.split(/\n/)
      res.user.url2title = {}
      for (const row of rows) {
        const url = row.replaceAll("\u3000", " ").split(/\s+/)
        if (url.length > 1) res.user.url2title[url[0].trim()] = url[1].trim()
      }
      console.log(res.user.url2title)
    }
    
  }  
  
  return res
}

let modalSpinner;

//
const doLogoff = async(e) => {
  modalSpinner.show('ログオフ中です...')
  try {
    const r = await fetch(Const.uri + '/?rest_route=/unsta/v1/api/logoff/-', {
      mode: 'cors', credentials: 'include',
    })
  } finally {
    location.href = Const.uri // Go Top
  }            
}

//
const Page = props => {
  const data = React.use(resource)

  const [stateMenu, setStateMenu] = React.useState(false)
  const refCursor = React.useRef(false) 

  const showMenu = e => {
    refCursor.current = e
    setStateMenu(true)
  }

  let user_name = ''
  if (data.user?.id) user_name = `${data.user.name} 様 (${data.user.id})` 

  const etsuran_page = React.useMemo(() => {
    if (!data.user?.id || !data.wa?.etsuran_page) return null;
    const json = JSON.parse(data.wa.etsuran_page)
    let s = ''
    for (const key in json) {
      if (s) s += '、'
      const url = data.user.url2title[key] || key
      s += `${url} ${json[key]}%` 
    }
    return s
  })

  return html`<${Fragment}>

  <${ModalSpinner} ref=${e => modalSpinner = e} />

  <${PopupMenu} show=${stateMenu} hide=${() => setStateMenu(false)} cursor=${refCursor.current}>
    <div>
      設定
    </div>
    <div onClick=${doLogoff}>
      ログオフ
    </div>
  <//>

  <div className="${cssPage}">

    <div className="menu-icon" onClick=${showMenu}>
      <${IconMenu} size="2rem" />
    </div>

    <div>
      ${user_name}
    </div>

    <${Render}>${() => {
      if (!data.wa) {
        return html`
        <div className="mt-8 table flex-col has-primary-background-color has-background">
          <div className="table-title">アクセス分析レポート</div>
          <div className="table-title-bottom"></div>
          <${CommentRow} c="top-row" title="なし" data="なし" />
          <div className="table-bottom"></div>
        </div>
        `
      }

      return html`<${Fragment}>
      <div className="mt-8 flex" style=${{justifyContent:'end'}}>
        <div>作成日: ${data.wa.date}</div>
      </div>

      <div className="table flex-col has-primary-background-color has-background">
        <div className="table-title">アクセス分析レポート</div>
        <div className="table-title-bottom"></div>

        <${CommentRow} c="top-row" title="サイト名" data=${data.wa.site_name} />
        <${CommentRow} title="サイトURL" data=${data.wa.site_url} />
        <${CommentRow} title="分析期間" data=${data.wa.kikan} />

        <div className="table-bottom"></div>
      </div>

      <div className="mt-8 table flex-col has-primary-background-color has-background">
        <${CommentRow} c="top-row" title="総合分析" data=${data.wa.content} />
        <div className="table-bottom"></div>
      </div>

      <div className="mt-8 table flex-col has-primary-background-color has-background">
        <${CommentRow} c="top-row" title="ユーザー" data=${data.wa.user} comment=${data.wa.user_biko}/>
        <${CommentRow} title="ページビュー" data=${data.wa.page_view} comment=${data.wa.page_view_biko}/>
        <${CommentRow} title="直帰率" data=${data.wa.chokki_ritsu} comment=${data.wa.chokki_ritsu_biko}/>
        <${CommentRow} title="閲覧ページ" data=${etsuran_page} comment=${data.wa.etsuran_page_biko}/>
        <${CommentRow} title="<span>地域</span><span>（都道府県）</span>" data=${data.wa.area_pref} comment=${data.wa.area_pref_biko}/>
        <${CommentRow} title="<span>地域</span><span>（特定地域）</span>" data=${data.wa.area_city} comment=${data.wa.area_city_biko}/>
        <${CommentRow} title="デバイス" data=${data.wa.device} comment=${data.wa.device_biko}/>
        <${CommentRow} title="流入経路" data=${data.wa.keiro} comment=${data.wa.keiro_biko}/>
        <${CommentRow} title="<span>流入</span><span>キーワード</span>" data=${data.wa.keyword} comment=${data.wa.keyword_biko} />
        <${CommentRow} title="年齢" data=${data.wa.nenrei} comment=${data.wa.nenrei_biko}/>
        <${CommentRow} title="性別" data=${data.wa.sex} comment=${data.wa.sex_biko}/>
        <${CommentRow} title="備考" data=${data.wa.biko} />
        <div className="table-bottom"></div>
      </div>
      <//>
      `
    }}<//>
  </div>
  <//>`
}

//
const Render = props => props.children()

//
const CommentRow = props => {
  const [stateShowComment, setStateShowComment] = React.useState(false)
  const handleClick = e => {
    if (!props.comment) return;
    setStateShowComment(state => !state)
  }

  const data = React.useMemo(() => {
    if (!props.data) return '';
    return props.data
    return props.data.replace(/\n/g, '<br/>')
  }, [])

  const comment = React.useMemo(() => {
    if (!props.comment) return props.data;
    return props.comment.replace(/\n/g, '<br/>')
  }, [])

  return html`
  <div className=${cx("flex", props.c)}>
    <div className="title" dangerouslySetInnerHTML=${{__html: props.title}}></div>
    <div className="field flex-col" onClick=${handleClick}>
      <div className="flex-col"> 
        <div className="row1" dangerouslySetInnerHTML=${{__html: comment}}></div>
        <div className=${cx({show: props.comment?.length > 0, showComment: stateShowComment}, "comment-button")}>
          <${IconRight} size="1.5rem"/>
        </div>
      </div>
      <div className=${cx({show: stateShowComment}, 'row2')} dangerouslySetInnerHTML=${{__html: data}}></div>
    </div>
  </div>
  `
}

//
const cssPage = css`

  .menu-icon {
    position: fixed;
    top: 64px;
    right: 32px;    
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 2px;
    background-color: ${Style.primary};
  }

  @media screen and (min-width: 1320px) {
    .menu-icon {
      right: calc((100vw - 1280px) / 2);
    }
  }

  .table-title {
    display: flex;
    height: 3rem;
    justify-content: center;
    align-items: center;
  }

  .table-title-bottom {
    height: .5rem;
    background-color: var(--wp--preset--color--base);
  }

  .title {
    display: flex;
    border-top: solid 3px var(--wp--preset--color--base);
    padding: 0 .5rem;
    width: 10rem;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    color: ${Style.textColor};
    & > span {
      display: inline-block;
      white-space: nowrap;
    }
  }

  @media screen and (max-width: 600px) {
    .title {
      width: 6rem;
    }
  }

  .top-row {
    .title {
      border-color: rgba(0,0,0,0);
    }
  }

  .field {
    flex: 1;
    margin-top: 3px;
    margin-right: 3px;
    background-color: var(--wp--preset--color--base);

    .row1 {
      padding-left: 1rem;
      * {
        margin-block-start: 0;
        margin-block-end: 0;
      }
    }

    .comment-button {
      display: none;
      margin: auto .25rem;
      /* padding: .5rem 0; */
      font-size: 2rem;
      &>svg {
        cursor: pointer;
        transition: transform .5s;
        transform: rotate(0deg);
      }	
      &.show {
        display: flex;
        &.showComment>svg {
          transform: rotate(90deg);
        }	 
        & + .data {
          padding-left: 0;
        }
      }
    }

    & > .row2 {
      height: 0;
      opacity: 0;
      overflow: hidden;
      transition: opacity 1s;
      &.show {
        height: auto;
        opacity: 100;
        border-top: solid 1px var(--wp--preset--color--primary);
        padding: .5rem 1rem;
      }
    }
  }

  .table-bottom {
    height: 3px;
  }
`;

//
const PopupMenu = props => {
  const wx = 200, wy = menuH, mx = 16, my = 16
  let x = props.cursor.pageX + mx - wx / 2
  if (x + wx + mx > document.documentElement.scrollLeft + document.body.clientWidth) {
    x = document.documentElement.scrollLeft + document.body.clientWidth - wx - mx
  }
  if (x + mx < document.documentElement.scrollLeft) x = document.documentElement.scrollLeft + mx
  
  let y = props.cursor.pageY + my
  if (y + wy + my > document.documentElement.scrollTop + document.documentElement.clientHeight) {
    y = document.documentElement.scrollTop + document.documentElement.clientHeight - wy - my
  }
  if (y + my < document.documentElement.scrollTop) y = document.documentElement.scrollTop + my

  // for Hiding Animation
  const [stateHiding, setStateHiding] = React.useState(false)
  const hideMenu = () => {
    setStateHiding(true)
    setTimeout(() => {
      props.hide()
      setStateHiding(false)
    }, menuClose_msec)
  }

  if (!props.show) return null;

  return html`
  <${ModalDesktop} c=${cssMenu} onClick=${e => hideMenu()}>
    <div className=${cx({hide: stateHiding})}
      style=${{top: y, left: x, width:wx+'px', height:wy+'px'}}
    >
      ${props.children}
    </div>
  <//>
  `
}

//
const menuH = 100
const menuClose_msec = 200

const kfMenuFadein = keyframes`
  0% {
    height: 0;
  }
  80% {
    height: ${menuH}px;
  }
  100% {
    height: ${menuH}px;
  }
`

const kfMenuFadeinChild = keyframes`
  0% {
    opacity: 0;
  }
  80% {
    opacity: 0;
  }
  100% {
    opacity: 100%;
  }
`

const kfMenuFadeout = keyframes`
  0% {
    height: ${menuH}px;
  }
  100% {
    height: 0;
  }
`

const cssMenu = css`
  display: flex;
  flex-direction: column;
  /* justify-content: end; */

  & > div {
    position: absolute;
    background-color: ${Style.background};
    display: flex;
    flex-direction: column;
    border: solid 1px var(--wp--preset--color--contrast);
    /* border-radius: 2px; */
    animation: ${kfMenuFadein} 0.5s ease-in-out forwards;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);

    &.hide {
      animation: ${kfMenuFadeout} ${menuClose_msec}ms ease-in-out forwards;
      & > div {
        display: none;
      }
    }

    & > div {
      padding: .5rem 1rem;
      overflow: hidden;
      white-space: nowrap;
      cursor: pointer;
      animation: ${kfMenuFadeinChild} 0.5s ease-in-out forwards;
    }
  }

`;
