from abc import ABC, abstractmethod

import citychat_server.cityform.validators as validators
from citychat_server.models.user import User, UserProfile


class Field(ABC):
    def __init__(self, label=None,
                 validators=None, pre_filters=None, post_filters=None,
                 _attributes=None, _id=None, **kwargs):
        self.label = label
        self.validators = validators or []
        self.pre_filters = pre_filters or []
        self.post_filters = post_filters or []
        self._attributes = _attributes or {}

        if self.label:
            self._id = _id or ''.join(
                c
                for c in self.label.title()
                if not c.isspace()
            )
        else:
            self._id = None

        self.__dict__.update(kwargs)

    @property
    @abstractmethod
    def tag(self):
        return NotImplemented

    @property
    def attributes(self):
        attr = self._attributes

        for v in self.validators:
            attr |= v.attributes

        return attr

    def id(self, id_prefix=None):
        return (id_prefix or '') + (self._id or '')

    def to_json(self, id_prefix=None, name=None):
        return {
            'tag': self.tag,
            'args': {
                'id': self.id(id_prefix),
                'name': name,
                **self.attributes
            }
        }

    def to_list(self, id_prefix=None, name=None):
        if self.label:
            label = {
                'tag': 'label',
                'value': self.label,
                'args': {
                    'htmlFor': self.id(id_prefix)
                }
            }

            return [label, self.to_json(id_prefix, name)]

        return [self.to_json(id_prefix)]


class InputField(Field):
    def __init__(self, type, **kwargs):
        super().__init__(**kwargs)
        self.type = type

    @property
    def tag(self):
        return 'input'

    @property
    def attributes(self):
        return super().attributes | {'type': self.type}


class StringField(InputField):
    def __init__(self, type=None, **kwargs):
        super().__init__(type=type or 'text', **kwargs)
        self.pre_filters.insert(0, lambda s: '' if s is None else str(s))


class EmailField(StringField):
    def __init__(self, **kwargs):
        super().__init__(type='email', **kwargs)
        self.validators += [
            validators.Length(max=UserProfile.email.type.length),
            validators.Pattern(
                pattern=UserProfile.email_regex,
                title='Email address must follow the format '
                      '"local-part@domain", e.g. "jsmith@example.com"'
            )
        ]


class PasswordField(StringField):
    def __init__(self, **kwargs):
        super().__init__(type='password', **kwargs)
        self.validators.insert(0, validators.Length(min=User.PASSWORD_MINLEN))


class SubmitField(InputField):
    def __init__(self, **kwargs):
        super().__init__(type='submit', **kwargs)

    @property
    def attributes(self):
        return super().attributes | {'value': self.label}

    def to_list(self, id_prefix=None, name=None):
        return [self.to_json(id_prefix, name)]
