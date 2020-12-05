"""empty message

Revision ID: 501d3b5494bf
Revises: 235bbb188210
Create Date: 2020-12-05 16:51:17.324911

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '501d3b5494bf'
down_revision = '235bbb188210'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'chat',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_table(
        'chat_participant',
        sa.Column('chat_id', sa.Integer(), nullable=False),
        sa.Column('participant_id', sa.Integer(), nullable=False),
        sa.Column('nickname', sa.String(length=255), nullable=True),
        sa.ForeignKeyConstraint(['chat_id'], ['chat.id'],
                                name='fk_chat_participant_chat_id',
                                onupdate='CASCADE', ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['participant_id'], ['user.id'],
                                name='fk_chat_participant_participant',
                                onupdate='CASCADE', ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('chat_id', 'participant_id',
                                name='pk_chat_participant')
    )
    op.create_table(
        'private_chat',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['id'], ['chat.id'],
                                name='fk_private_chat_chat_id',
                                onupdate='CASCADE', ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('message', schema=None) as batch_op:
        batch_op.add_column(sa.Column('author_id', sa.Integer(),
                            nullable=False))
        batch_op.add_column(sa.Column('chat_id', sa.Integer(), nullable=False))
        batch_op.drop_constraint('fk_message_author', type_='foreignkey')
        batch_op.create_foreign_key('fk_message_chat_id', 'chat',
                                    ['chat_id'], ['id'],
                                    onupdate='CASCADE', ondelete='CASCADE')
        batch_op.create_foreign_key('fk_message_author_id', 'user',
                                    ['author_id'], ['id'],
                                    onupdate='CASCADE', ondelete='CASCADE')
        batch_op.drop_column('author')


def downgrade():
    with op.batch_alter_table('message', schema=None) as batch_op:
        batch_op.add_column(sa.Column('author', sa.INTEGER(),
                                      autoincrement=False, nullable=False))
        batch_op.drop_constraint('fk_message_author_id', type_='foreignkey')
        batch_op.drop_constraint('fk_message_chat_id', type_='foreignkey')
        batch_op.create_foreign_key('fk_message_author', 'user',
                                    ['author'], ['id'],
                                    onupdate='CASCADE', ondelete='CASCADE')
        batch_op.drop_column('chat_id')
        batch_op.drop_column('author_id')

    op.drop_table('private_chat')
    op.drop_table('chat_participant')
    op.drop_table('chat')
