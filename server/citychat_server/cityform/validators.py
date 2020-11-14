import re
from abc import ABC, abstractmethod

import citychat_server.cityform.fields as fields


class Validator(ABC):
    def __init__(self, _attributes=None):
        self._attributes = _attributes or {}

    @property
    def attributes(self):
        return self._attributes

    @abstractmethod
    def validate(self, field):
        return NotImplemented


class Required(Validator):
    @property
    def attributes(self):
        return super().attributes | {'required': 'required'}

    def validate(self, field):
        if field.value is None \
           or isinstance(field, fields.StringField) and not field.value:
            field.errors.append(field.label + ' cannot be empty.')


class Length(Validator):
    def __init__(self, min=-1, max=-1, _attributes=None):
        super().__init__(_attributes=_attributes)
        self.min = min
        self.max = max

    @property
    def has_min(self):
        return self.min > -1

    @property
    def has_max(self):
        return self.max > -1

    @property
    def attributes(self):
        attr = {}

        if self.has_min:
            attr['minLength'] = self.min

        if self.has_max:
            attr['maxLength'] = self.max

        return super().attributes | attr

    def validate(self, field):
        if not field.value:
            return

        if len(field.value) < self.min:
            field.errors.append(f'{field.label}  must have at least '
                                f'{self.min} characters.')

        if self.has_max and len(field.value) > self.max:
            field.errors.append(f'{field.label} cannot have more than '
                                f'{self.max} characters.')


class Pattern(Validator):
    def __init__(self, pattern, title=None, _attributes=None):
        super().__init__(_attributes=_attributes)
        self.pattern = pattern
        self.title = title

    @property
    def attributes(self):
        attr = {'pattern': self.pattern}

        if self.title:
            attr['title'] = self.title

        return super().attributes | attr

    def validate(self, field):
        if not re.fullmatch(self.pattern, field.value or ''):
            field.errors.append(self.title)
