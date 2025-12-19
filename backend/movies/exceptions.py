import logging
from rest_framework.views import exception_handler

logger = logging.getLogger('movies.errors')

def movies_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        request = context.get('request')
        view_name = context['view'].__class__.__name__

        # build message with context
        log_data = {
            'status': response.status_code,
            'view': view_name,
            'method': request.method if request else 'N/A',
            'path': request.path if request else 'N/A',
            'user': str(request.user) if request and hasattr(request, 'user') else 'Anonymous',
            'ip': get_client_ip(request) if request else 'N/A',
            'detail': str(exc)
        }

        log_message = f"Status: {log_data['status']} | Method: {log_data['method']} | Path: {log_data['path']} | User: {log_data['user']} | IP: {log_data['ip']} | View: {log_data['view']} | Detail: {log_data['detail']}"

        if response.status_code >= 500:
            logger.error(log_message)
        else:
            logger.warning(log_message)

    return response

# helper to get the real IP
def get_client_ip(request):
    x_forwarded_for  = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip