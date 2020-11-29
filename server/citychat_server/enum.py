class EnumMixin:
    @classmethod
    def to_list(cls):
        return [name.value for name in cls]

    @classmethod
    def to_csv_str(cls):
        return ', '.join(cls.to_list())

    @classmethod
    def to_quoted_csv_str(cls):
        return ', '.join(f"'{s}'" for s in cls.to_list())

    @classmethod
    def has(cls, value):
        return value in cls.to_list()
