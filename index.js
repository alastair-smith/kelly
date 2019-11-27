const { createCanvas, loadImage } = require('canvas')
const MAX_WIDTH = 580

exports.handler = async event => {
  if (event.queryStringParameters && event.queryStringParameters.text) {
    let text = event.queryStringParameters.text

    const canvas = createCanvas(968, 681)
    const context = canvas.getContext('2d')

    context.font = '38px AbhayaLibre-Regular'

    const image = await loadImage('./base-image2.jpg')
    context.drawImage(image, 0, 0)
    context.save()
    context.rotate(0.6)
    context.fillStyle = '#0049af'
    while (context.measureText(text).width > MAX_WIDTH) {
      console.log('text', text)
      text = text.substring(0, text.length - 1)
    }
    context.fillText(text, 320, -110)
    context.restore()
    const buffer = canvas.toBuffer()

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/png'
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true
    }
  }
  else {
    // redirect to actual page
    return {
      statusCode: 302,
      headers: {
        Location: 'https://alsmith.dev/kelly'
      },
      isBase64Encoded: false,
      body: ''
      }
  }
}
