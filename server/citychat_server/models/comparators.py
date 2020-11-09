from sqlalchemy.ext.hybrid import Comparator
from werkzeug.security import check_password_hash


class CasefoldComparator(Comparator):
    def __eq__(self, other):
        return self.__clause_element__().casefold() == other.casefold()


class PasswordComparator(Comparator):
    def __eq__(self, other):
        return check_password_hash(self.__clause_element__(), other)
