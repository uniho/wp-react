
export default async function () {
  if (!window.React || window.React.version.startsWith("17")) {
    const modules = await Promise.all([
      import("https://jspm.dev/react@18.3"),
      import("https://jspm.dev/react-dom@18.3/client"),
    ])
    window.React = modules[0].default
    window.ReactDOM = modules[1].default
    window.Suspense = React.Suspense
    window.Fragment = React.Fragment
  }
  if (!window.html) {
    const modules = await Promise.all([
      import("https://unpkg.com/htm@3.1?module"),
      import("https://cdn.skypack.dev/@emotion/css@11?min"),
    ])
    const htm = modules[0].default
    const {cx, css, keyframes, injectGlobal} = modules[1]
    window.html = htm.bind(React.createElement)
    window.raw = window.styled = String.raw
    window.cx = cx
    window.css = css
    window.keyframes = keyframes
    window.injectGlobal = injectGlobal
  }
}
