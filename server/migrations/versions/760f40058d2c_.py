"""empty message

Revision ID: 760f40058d2c
Revises: 82a1e41958bc
Create Date: 2020-11-10 23:20:33.850012

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '760f40058d2c'
down_revision = '82a1e41958bc'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('user_profile', schema=None) as batch_op:
        batch_op.drop_constraint('cc_username')
        batch_op.create_check_constraint(
            constraint_name='cc_username',
            condition="username ~ '^\\w+$'"
        )


def downgrade():
    with op.batch_alter_table('user_profile', schema=None) as batch_op:
        batch_op.drop_constraint('cc_username')
        batch_op.create_check_constraint(
            constraint_name='cc_username',
            condition='char_length(username) > 0'
        )
