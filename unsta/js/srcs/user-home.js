
// User Home
export async function main(mainProps) {
  { const load = await import('../_init_react.js'); await load.default() }
  const app = await import('../app.user-home.js')
  const root = createRoot(document.getElementById(mainProps.rootid))
  root.render(React.createElement(app.default, mainProps))
}
