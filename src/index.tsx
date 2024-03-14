import { Hono } from 'hono'
import { upgradeWebSocket } from 'hono/cloudflare-workers'
import { renderer } from './_renderer'

const app = new Hono()
app.use(renderer)

app.get('/', (c) => {
  const reset = { 'hx-on:htmx:ws-after-message': "document.querySelector('form').reset()" }

  return c.render(
    <div style={{ display: 'flex' }} hx-ext="ws" ws-connect="/ws" {...reset}>
      <form ws-send>
        <input name="message" autocomplete="off" />
        <button type="submit">Send</button>
      </form>
      <div>
        <div id="chat"></div>
      </div>
    </div>
  )
})

app.get(
  '/ws',
  upgradeWebSocket(() => {
    return {
      onMessage: (event, ws) => {
        const data = JSON.parse(event.data)
        const tag = (
          <div hx-swap-oob="afterend:#chat">
            <div>{data.message}</div>
          </div>
        )
        ws.send(tag.toString())
      }
    }
  })
)

export default app
