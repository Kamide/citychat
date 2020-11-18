from flask_mail import Mail, email_dispatched

mail = Mail()


def debug_email(message, app):
    app.logger.debug(f'Subject: {message.subject}\n'
                     f'Body: {message.body}')


email_dispatched.connect(debug_email)
