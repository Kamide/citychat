"""empty message

Revision ID: 526a3f5e3f0d
Revises: be3673cb0224
Create Date: 2020-11-18 11:56:33.637778

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '526a3f5e3f0d'
down_revision = 'be3673cb0224'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column(
            'date_registered',
            sa.DateTime(),
            server_default=sa.text('now()'),
            nullable=False
        ))
        batch_op.add_column(sa.Column(
            'date_activated',
            sa.DateTime(),
            nullable=True
        ))
        batch_op.drop_column('date_joined')


def downgrade():
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column(
            'date_joined',
            postgresql.TIMESTAMP(),
            autoincrement=False,
            nullable=True
        ))
        batch_op.drop_column('date_activated')
        batch_op.drop_column('date_registered')
