"""empty message

Revision ID: 6983a8b702fa
Revises: 760f40058d2c
Create Date: 2020-11-12 16:20:22.787892

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6983a8b702fa'
down_revision = '760f40058d2c'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('user_profile', schema=None) as batch_op:
        batch_op.drop_constraint('cc_username')
        batch_op.create_check_constraint(
            constraint_name='cc_username',
            condition="username ~ '^[\\p{L}\\p{N}-]+$'"
        )


def downgrade():
    with op.batch_alter_table('user_profile', schema=None) as batch_op:
        batch_op.drop_constraint('cc_username')
        batch_op.create_check_constraint(
            constraint_name='cc_username',
            condition="username ~ '^\\w+$'"
        )
