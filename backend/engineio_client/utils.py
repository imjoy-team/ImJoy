
def format_long(message, *args):
    size = 700
    ellipsis = '[...]'
    formatted = message % args
    return formatted[:size-len(ellipsis)]+ellipsis if len(formatted) > size else formatted

