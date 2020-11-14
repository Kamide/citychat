"""empty message

Revision ID: be3673cb0224
Revises: 6983a8b702fa
Create Date: 2020-11-13 22:28:33.847069

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'be3673cb0224'
down_revision = '6983a8b702fa'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('user_profile', schema=None) as batch_op:
        batch_op.alter_column(
            'name',
            existing_type=sa.VARCHAR(length=255),
            nullable=False
        )
        batch_op.drop_constraint('user_profile_username_key', type_='unique')
        batch_op.drop_column('username')
        batch_op.create_check_constraint(
            constraint_name='cc_name',
            condition='char_length(trim(name)) > 0'
        )


def downgrade():
    with op.batch_alter_table('user_profile', schema=None) as batch_op:
        batch_op.add_column(sa.Column(
            'username', sa.VARCHAR(length=32),
            autoincrement=False,
            nullable=False)
        )
        batch_op.create_unique_constraint(
            'user_profile_username_key',
            ['username']
        )
        batch_op.alter_column(
            'name',
            existing_type=sa.VARCHAR(length=255),
            nullable=True
        )
        batch_op.drop_constraint('cc_name')
