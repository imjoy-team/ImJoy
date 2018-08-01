import os
from aiohttp import web
import asyncio
import socketio
import logging
import threading
import sys
import traceback
import time
import platform
import signal
import random
import string
from subprocess import Popen, PIPE, STDOUT
try:
    from Queue import Queue, Empty
except ImportError:
    from queue import Queue, Empty  # python 3.x

NAME_SPACE = '/'
sio = socketio.AsyncServer()
app = web.Application()
sio.attach(app)
plugins = {}
plugin_sids = {}
@sio.on('connect', namespace=NAME_SPACE)
def connect(sid, environ):
    print("connect ", sid)

@sio.on('init_plugin', namespace=NAME_SPACE)
async def on_init_plugin(sid, kwargs):
    print("init_plugin: ", kwargs)
    secretKey = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
    pid = kwargs['id']
    env = kwargs.get('env', 'source activate python2 || activate python2 && pip install six requests gevent websocket-client numpy && python')
    plugins[pid] = {'secret': secretKey, 'id': pid, 'sid': sid}
    plugin_sids[sid] = plugins[pid]
    @sio.on('from_plugin_'+secretKey, namespace=NAME_SPACE)
    async def message_from_plugin(sid, kwargs):
        # print('forwarding message_'+secretKey, kwargs)
        if kwargs['type'] in ['initialized', 'importSuccess', 'importFailure', 'executeSuccess', 'executeFailure']:
            await sio.emit('message_from_plugin_'+pid,  kwargs)
        else:
            await sio.emit('message_from_plugin_'+pid, {'type': 'message', 'data': kwargs})

    @sio.on('message_to_plugin_'+pid, namespace=NAME_SPACE)
    async def message_to_plugin(sid, kwargs):
        # print('forwarding message_to_plugin_'+pid, kwargs)
        if kwargs['type'] == 'message':
            await sio.emit('to_plugin_'+secretKey, kwargs['data'])
        else:
            print(kwargs)

    try:
        abort = threading.Event()
        plugins[pid]['abort'] = abort #
        taskThread = threading.Thread(target=execute, args=[env+' '+'workerTemplate.py --id='+pid+' --secret='+secretKey, './', abort, pid])
        taskThread.daemon = True
        taskThread.start()
        # execute('python pythonWorkerTemplate.py', './', abort, pid)
        return {'success': True, 'secret': secretKey}
    except Exception as e:
        print(e)
        return {'success': False}



@sio.on('kill_plugin', namespace=NAME_SPACE)
async def on_kill_plugin(sid, kwargs):
    pid = kwargs['id']
    if pid in plugins:
        await sio.emit('to_plugin_'+plugins[pid]['secret'], {'type': 'disconnect'})
        plugins[pid]['abort'].set()
        del plugins[pid]
        print('killing plugin ' + pid)
    return {'success': True}


@sio.on('message', namespace=NAME_SPACE)
async def on_message(sid, kwargs):
    print("message recieved: ", kwargs)


@sio.on('disconnect', namespace=NAME_SPACE)
async def disconnect(sid):
    if sid in plugin_sids:
        await on_kill_plugin(sid, plugin_sids[sid])
        del plugin_sids[sid]
    print('disconnect ', sid)


async def index(request):
    """Serve the client-side application."""
    return web.Response(text='home', content_type='text/html')
    #
    # with open('index.html') as f:
    #     return web.Response(text=f.read(), content_type='text/html')

# app.router.add_static('/files', 'data-files')
app.router.add_get('/', index)

logger = logging.getLogger('task_processor')

def process_output(line):
    print(line)
    return True

def execute(args, workdir, abort, name):
    env = os.environ.copy()
    if type(args) is str:
        args = args.split()
    if not args:
        args = []
    # Convert them all to strings
    args = [str(x) for x in args if str(x) != '']
    logger.info('%s task started.' % name)
    unrecognized_output = []
    env['PYTHONPATH'] = os.pathsep.join(
        ['.', workdir, env.get('PYTHONPATH', '')] + sys.path)
    # https://docs.python.org/2/library/subprocess.html#converting-argument-sequence
    #if platform.system() == 'Windows':
        #args = ' '.join(args)
    args = ' '.join(args)
    logger.info('Task subprocess args: {}'.format(args))
    print('Task subprocess args: {}'.format(args))


    # set system/version dependent "start_new_session" analogs
    kwargs = {}
    if platform.system() == 'Windows':
        # from msdn [1]
        CREATE_NEW_PROCESS_GROUP = 0x00000200  # note: could get it from subprocess
        DETACHED_PROCESS = 0x00000008          # 0x8 | 0x200 == 0x208
        kwargs.update(creationflags=DETACHED_PROCESS | CREATE_NEW_PROCESS_GROUP)
    # elif sys.version_info < (3, 2):  # assume posix
    #     kwargs.update(preexec_fn=os.setsid)
    else:  # Python 3.2+ and Unix
        # kwargs.update(start_new_session=True)
        kwargs.update(preexec_fn=os.setsid)

    try:
        # we use shell mode, so it won't work nicely on windows
        p = Popen(args, bufsize=0, stdout=PIPE, stderr=STDOUT,
                  shell=True, universal_newlines=True, **kwargs)
        pid = p.pid
    except Exception as e:
        print('error from task:', e)
        # traceback.print_exc()
        #task.set('status.error', # traceback.format_exc())
        # end(force_quit=True)
        return False
    # run the shell as a subprocess:

    nbsr = NonBlockingStreamReader(p.stdout)
    try:
        sigterm_time = None  # When was the SIGTERM signal sent
        sigterm_timeout = 2  # When should the SIGKILL signal be sent
        # get the output
        endofstream = False
        while p.poll() is None or not endofstream:
            try:
                line = nbsr.readline(0.1)
            except(UnexpectedEndOfStream):
                line = None
                endofstream = True

            if line is not None:
                # Remove whitespace
                line = line.strip()
            if line:
                try:
                    if not process_output(line):
                        logger.warning('%s unrecognized output: %s' % (
                            name, line.strip()))
                        unrecognized_output.append(line)
                except Exception as e:
                    print('error from task:', e)
                    # traceback.print_exc()
                    #task.set('status.error', # traceback.format_exc())
            else:
                time.sleep(0.05)

            if abort.is_set():
                if sigterm_time is None:
                    # Attempt graceful shutdown
                    p.send_signal(signal.SIGINT)
                    p.send_signal(signal.SIGTERM)
                    try:
                        os.killpg(os.getpgid(pid), signal.SIGTERM)
                    except Exception as e:
                        pass
                    sigterm_time = time.time()
            if sigterm_time is not None and (time.time() - sigterm_time > sigterm_timeout):
                p.send_signal(signal.SIGKILL)
                logger.warning(
                    'Sent SIGKILL to task "%s"' % name)
                time.sleep(0.1)
    except:
        # traceback.print_exc()
        try:
            p.terminate()
        except Exception as e:
            print('error occured during terminating a process.')
        raise
    if abort.is_set():
        return False
    elif p.returncode != 0:
        # Report that this task is finished
        logger.error('%s task failed with error code %s' %
                          (name, str(p.returncode)))
        # if exception is None:
        #     exception = 'error code %s' % str(p.returncode)
        #     if unrecognized_output:
        #         if traceback is None:
        #             traceback = '\n'.join(unrecognized_output)
        #         else:
        #             traceback = traceback + \
        #                 ('\n'.join(unrecognized_output))
        print('error from task'+str(p.returncode))
        return False
    else:
        logger.info('%s task completed.' % name)
        return True

class NonBlockingStreamReader:

    def __init__(self, stream):
        '''
        stream: the stream to read from.
                Usually a process' stdout or stderr.
        '''
        self._s = stream
        self._q = Queue()

        def _populateQueue(stream, queue):
            '''
            Collect lines from 'stream' and put them in 'quque'.
            '''

            while True:
                line = stream.readline()
                if line:
                    queue.put(line)
                else:
                    self.end = True
                    break
                    #raise UnexpectedEndOfStream
                time.sleep(0.01)
        self.end = False
        self._t = threading.Thread(target=_populateQueue,
                                   args=(self._s, self._q))
        self._t.daemon = True
        self._t.start()  # start collecting lines from the stream

    def readline(self, timeout=None):
        try:
            return self._q.get(block=timeout is not None,
                               timeout=timeout)
        except Empty:
            if self.end:
                raise UnexpectedEndOfStream
            return None


class UnexpectedEndOfStream(Exception):
    pass

if __name__ == '__main__':
    web.run_app(app)
