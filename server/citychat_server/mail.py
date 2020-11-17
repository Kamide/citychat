from flask_mail import Mail, email_dispatched

mail = Mail()


def debug_message(message, app):
    app.logger.debug('Subject: ' + message.subject)
    app.logger.debug('B o d y: ' + message.body)


email_dispatched.connect(debug_message)
