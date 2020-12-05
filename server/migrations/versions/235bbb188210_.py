"""empty message

Revision ID: 235bbb188210
Revises: cc30b0ad0636
Create Date: 2020-12-05 00:33:17.362964

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '235bbb188210'
down_revision = 'cc30b0ad0636'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'message',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('author', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), server_default=sa.text('now()'),
                  nullable=False),
        sa.Column('parent_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['author'], ['user.id'],
                                name='fk_message_author',
                                onupdate='CASCADE', ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['parent_id'], ['message.id'],
                                name='fk_message_parent_id',
                                onupdate='CASCADE', ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'message_text',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('content', sa.String(length=512), nullable=False),
        sa.CheckConstraint('char_length(content) > 0',
                           name='cc_message_text_content'),
        sa.ForeignKeyConstraint(['id'], ['message.id'],
                                name='fk_message_text_id',
                                onupdate='CASCADE', ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    op.drop_table('message_text')
    op.drop_table('message')
