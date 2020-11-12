def city_input(type, id, args={}):
    return {
        'type': 'input',
        'args': {
            'type': type,
            'id': id,
            **args
        }
    }


def city_input_required(type, id, args={}):
    return city_input(
        type=type,
        id=id,
        args={
            'required': True,
            **args,
        }
    )


def city_label(html_for, value, args={}):
    return {
        'type': 'label',
        'value': value,
        'args': {
            'id': html_for + 'Label',
            'htmlFor': html_for,
            **args
        }
    }


def city_submit(id, value, args={}):
    return city_input(
        type='submit',
        id=id,
        args={
            'value': value,
            **args
        }
    )


def capitalize(s):
    return s[0].upper() + s[1:]


def prefix_id(fields, prefix):
    for field in fields:
        if field['type'] == 'label':
            html_for = prefix + capitalize(field['args']['htmlFor'])
            field['args']['htmlFor'] = html_for

        field['args']['id'] = prefix + capitalize(field['args']['id'])
