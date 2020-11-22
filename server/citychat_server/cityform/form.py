from citychat_server.cityform.fields import Field


class Form:
    def __init__(self, method=None, id_prefix=None, attributes=None):
        self.method = method
        self.id_prefix = id_prefix
        self.attributes = attributes or {}
        self.values = {k: None for k in self.fields.keys()}
        self.errors = {k: [] for k in self.fields.keys()}

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
    def placeholder_values(self):
        return {k: '' for k in self.values.keys()}

    @property
    def placeholder_errors(self):
        return {k: '' for k in self.errors.keys()}

    def populate(self, values):
        if isinstance(values, dict):
            for k, v in values.items():
                if k in self.values:
                    self.values[k] = v

    def pre_filter(self):
        for k, f in self.fields.items():
            for p in f.pre_filters:
                self.values[k] = p(self.values[k])

    def post_filter(self):
        for k, f in self.fields.items():
            for p in f.post_filters:
                self.values[k] = p(self.values[k])

    def validate(self):
        valid = True
        self.pre_filter()

        for k, f in self.fields.items():
            for v in f.validators:
                errors = v.validate(label=f.label, value=self.values[k])

                if errors:
                    valid = False
                    self.errors[k] = errors

        if valid:
            self.post_filter()

        return valid

    def to_json(self):
        return {
            'args': {
                'method': self.method.lower(),
                'id': self.id_prefix + 'Form',
                **self.attributes
            },
            'fields': [
                (f[0], f[1].to_list(self.id_prefix, f[0]))
                for f in self._fields
            ],
            'values': self.placeholder_values,
            'errors': self.placeholder_errors
        }
