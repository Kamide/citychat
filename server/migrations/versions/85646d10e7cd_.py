"""empty message

Revision ID: 85646d10e7cd
Revises: dbf33c92fd33
Create Date: 2020-12-13 19:30:36.072250

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = '85646d10e7cd'
down_revision = 'dbf33c92fd33'
branch_labels = None
depends_on = None


def upgrade():
    op.execute(
        'ALTER TABLE direct_chat '
        'RENAME CONSTRAINT fk_private_chat_chat_id '
        'TO fk_direct_chat_chat_id'
    )


def downgrade():
    op.execute(
        'ALTER TABLE direct_chat '
        'RENAME CONSTRAINT fk_direct_chat_chat_id '
        'TO fk_private_chat_chat_id'
    )
