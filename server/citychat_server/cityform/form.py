from citychat_server.cityform.fields import Field


class Form:
    def __init__(self, method=None, id_prefix=None, attributes=None):
        self.method = method
        self.id_prefix = id_prefix
        self.attributes = attributes or {}

    @property
    def _fields(self):
        return [
            (key, value)
            for key, value in self.__class__.__dict__.items()
            if isinstance(value, Field)
        ]

    @property
    def fields(self):
        return {field[0]: field[1] for field in self._fields}

    @property
    def values(self):
        return {k: f.value for k, f in self.fields.items()}

    @property
    def errors(self):
        return {k: f.errors for k, f in self.fields.items()}

    def populate(self, values):
        for k, v in values.items():
            if k in self.fields:
                self.fields[k].value = v

    def validate(self):
        return sum(len(f.validate()) for f in self.fields.values())

    def to_json(self):
        return {
            'args': {
                'method': self.method.lower(),
                'id': self.id_prefix + 'Form',
                **self.attributes
            },
            'fields': {
                k: f.to_list(self.id_prefix)
                for k, f in self.fields.items()
            }
        }
