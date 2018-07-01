import os
from aiohttp import web
import asyncio
import socketio

NAME_SPACE = '/imjoy_plugin_engine'
sio = socketio.AsyncServer()
app = web.Application()
sio.attach(app)

@sio.on('connect', namespace=NAME_SPACE)
def connect(sid, environ):
    print("connect ", sid)

@sio.on('remote_call', namespace=NAME_SPACE)
async def remote_call(sid, kwargs):
    print("remote_call: ", kwargs)
    if kwargs['cmd'] == 'train':
        # await asyncio.sleep(1)
        return 'Training started on the server.'
    else:
        return 'command not implemented'
    #await sio.emit('rpc_result', room=sid)

@sio.on('send_file', namespace=NAME_SPACE)
async def send_file(sid, kwargs):
    # print("send_file: ", kwargs)
    fname = kwargs['name']
    fdir = os.path.join('./data-files', kwargs['sample_set'], kwargs['sample'])
    fobj = kwargs['file_obj']
    if not os.path.exists(fdir):
        os.makedirs(fdir)
    with open(os.path.join(fdir , fname), 'wb') as f:
        f.write(fobj)
    print(f'file {fname} saved to {fdir}')
    return 'server: remote_call finished!'

@sio.on('disconnect', namespace=NAME_SPACE)
def disconnect(sid):
    print('disconnect ', sid)

import numpy as np
from PIL import Image

from io import BytesIO
@sio.on('get_frame', namespace=NAME_SPACE)
async def get_frame(sid, kwargs):
    # print("send_file: ", kwargs)
    img = np.random.random((512,512))*255   # Test data
    image = Image.fromarray(img.astype('uint8'))
    output = BytesIO()
    image.save(output, format='JPEG')
    contents = output.getvalue()
    output.close()
    return contents

async def index(request):
    """Serve the client-side application."""
    return web.Response(text='home', content_type='text/html')
    #
    # with open('index.html') as f:
    #     return web.Response(text=f.read(), content_type='text/html')

# app.router.add_static('/files', 'data-files')
app.router.add_get('/', index)

if __name__ == '__main__':
    web.run_app(app)
