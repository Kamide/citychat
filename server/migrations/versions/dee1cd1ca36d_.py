"""empty message

Revision ID: dee1cd1ca36d
Revises: 85646d10e7cd
Create Date: 2020-12-13 19:51:37.215833

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'dee1cd1ca36d'
down_revision = '85646d10e7cd'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'group_chat',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=True),
        sa.ForeignKeyConstraint(['id'], ['chat.id'],
                                name='fk_group_chat_chat_id',
                                onupdate='CASCADE', ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    op.drop_table('group_chat')
