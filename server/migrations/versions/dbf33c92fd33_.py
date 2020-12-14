"""empty message

Revision ID: dbf33c92fd33
Revises: 501d3b5494bf
Create Date: 2020-12-13 18:57:21.252193

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = 'dbf33c92fd33'
down_revision = '501d3b5494bf'
branch_labels = None
depends_on = None


def upgrade():
    op.rename_table('private_chat', 'direct_chat')


def downgrade():
    op.rename_table('direct_chat', 'private_chat')
