import re
from abc import ABC, abstractmethod


class Validator(ABC):
    def __init__(self, _attributes=None):
        self._attributes = _attributes or {}

    @property
    def attributes(self):
        return self._attributes

    @abstractmethod
    def validate(self, label=None, value=None):
        return NotImplemented

    @classmethod
    def field(cls, label):
        return label or 'This field'


class Required(Validator):
    @property
    def attributes(self):
        return super().attributes | {'required': 'required'}

    def validate(self, label=None, value=None):
        if value is None \
           or isinstance(value, str) and not value:
            return [self.field(label) + ' cannot be left blank']

        return []


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

    def validate(self, label=None, value=None):
        if not value:
            return []

        f = self.field(label)

        if len(value) < self.min:
            return [f'{f} must have at least {self.min} characters.']
        elif self.has_max and len(value) > self.max:
            return [f'{f} cannot have more than {self.max} characters.']
        else:
            return []


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

    def validate(self, label=None, value=None):
        if not re.fullmatch(self.pattern, value or ''):
            return [self.title]
