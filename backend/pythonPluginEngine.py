import os
from aiohttp import web
import asyncio
import socketio
import logging
import threading
import os
import traceback
import time
import platform
import signal
from subprocess import Popen, PIPE, STDOUT
try:
    from Queue import Queue, Empty
except ImportError:
    from queue import Queue, Empty  # python 3.x

NAME_SPACE = '/'
sio = socketio.AsyncServer()
app = web.Application()
sio.attach(app)
secretKey = 'osdfu3dosru39727oeu420'
plugins = {}

@sio.on('connect', namespace=NAME_SPACE)
def connect(sid, environ):
    print("connect ", sid)

@sio.on('init_plugin', namespace=NAME_SPACE)
async def on_init_plugin(sid, kwargs):
    print("init_plugin: ", kwargs)
    pid = kwargs['id']
    plugins[pid] = {'secret': secretKey}
    #TODO: start a plugin with the id
    abort = threading.Event()
    plugins[pid]['abort'] = abort
    taskThread = threading.Thread(target=execute, args=['python pythonWorkerTemplate.py --id='+pid+' --secret='+secretKey, './', abort, pid])
    taskThread.daemon = True
    taskThread.start()
    # execute('python pythonWorkerTemplate.py', './', abort, pid)
    return {'success': True, 'secret': secretKey}

@sio.on('message', namespace=NAME_SPACE)
async def on_message(sid, kwargs):
    print("message: ", kwargs)

@sio.on('disconnect', namespace=NAME_SPACE)
def disconnect(sid):
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

def execute(args, workdir, abort, name):
    env = os.environ.copy()
    if type(args) is str:
        args = args.split()
    if not args:
        args = []
    # Convert them all to strings
    args = [str(x) for x in args if str(x) != '']
    print('executing ', args)
    logger.info('%s task started.' % name)
    unrecognized_output = []
    import sys
    env['PYTHONPATH'] = os.pathsep.join(
        ['.', workdir, env.get('PYTHONPATH', '')] + sys.path)
    # https://docs.python.org/2/library/subprocess.html#converting-argument-sequence
    #if platform.system() == 'Windows':
        #args = ' '.join(args)
    args = ' '.join(args)
    logger.info('Task subprocess args: {}'.format(args))
    print('Task subprocess args: {}'.format(args))
    try:
        # we use shell mode, so it won't work nicely on windows
        p = Popen(args, bufsize=0, stdout=PIPE, stderr=STDOUT,
                  shell=True, universal_newlines=True)
    except Exception as e:
        print('error from task:', e)
        # traceback.print_exc()
        #task.set('status.error', # traceback.format_exc())
        end(force_quit=True)
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
        if exception is None:
            exception = 'error code %s' % str(p.returncode)
            if unrecognized_output:
                if traceback is None:
                    traceback = '\n'.join(unrecognized_output)
                else:
                    traceback = traceback + \
                        ('\n'.join(unrecognized_output))
        after_runtime_error()
        print('error from task, taskName:{} taskId:{} widgetId:{}'.format(task.get('name'), task.id, task.get('widgetId')))
        task.set('status.error', '%s task failed with error code %s' % (name, str(p.returncode)))
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
