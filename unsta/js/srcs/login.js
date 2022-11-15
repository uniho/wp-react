
// ログインする
export async function main(mainProps) {
  { const load = await import('../_init_react.js'); await load.default() }
  const app = await import('../app.login.js') // <-----------------------
  const root = createRoot(document.querySelector(mainProps.root))
  root.render(React.createElement(app.default, mainProps))
}
