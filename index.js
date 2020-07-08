const { createCanvas, loadImage } = require('canvas')
const { exec } = require('child_process')
const GifEncoder = require('gif-encoder')
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
      text = text.substring(0, text.length - 1)
    }
    context.fillText(text, 320, -110)
    context.restore()

    if (event.queryStringParameters.gif === 'yes') {
        const completeGif = await new Promise((resolve, reject) => {
          context.drawImage(canvas, 0, 0, 480, 360)

          const gif = new GifEncoder(480, 360)
          const file = require('fs').createWriteStream('/tmp/img.gif')
          file.on('error', error => reject(error))
          file.on('finish', () => {
            exec('/opt/lib/gifsicle -d 200 /tmp/img.gif -o /tmp/del.gif', (error, stdout, stderr) => {
              if (error) return reject(error)
              exec('/opt/lib/gifsicle --colors 256 --merge kelly1del.gif /tmp/del.gif kelly2del.gif | base64', { maxBuffer: 1024 * 1024 * 5 }, (error2, stdout2, stderr2) => {
                if (error2) return reject(error2)
                return resolve(stdout2)
              })
            })
          })
          const pixels = context.getImageData(0, 0, 480, 360).data

          gif.pipe(file)
    
          // Write out the image into memory
          gif.writeHeader()
          gif.addFrame(pixels)
          gif.finish() 
        })  
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'image/gif'
          },
          body: completeGif,
          isBase64Encoded: true
       }
    } else  {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'image/png'
        },
        body: canvas.toBuffer().toString('base64'),
        isBase64Encoded: true
     }
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

exports.handler({
  queryStringParameters: { text: 'test', gif: 'yes' }
}).then(res => console.log(res.body))
