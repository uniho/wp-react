import {Const} from './namespaces.js'

// JSON をポストする。
export default async(uri, body, method='POST') => {
  let loop = 0
  while (1) {
    if (!token) {
      // まずはセッショントークン取得から
      try {
        const r = await fetch(Const.uri + '/?rest_route=/unsta/v1/api/unsta-token/-', {
          mode: 'cors', credentials: 'include',
        })
        if (!r.ok) throw new Error(r.status + ':' + await r.json())
        token = await r.json()
      } catch(e) {
        throw new Error(`セッショントークンが取得できませんでした。(${e.message})`)
      }
    }
    // そして POST
    const r = await fetch(Const.uri + uri, {
      method, 
      mode: 'cors', credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token,
      }, 
      body: JSON.stringify(body),
    })
    if (loop < 1 && r.status == 403) {
      loop++
    } else {
      return r
    }  
  }
}

let token = false