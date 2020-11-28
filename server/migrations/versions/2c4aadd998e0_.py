"""empty message

Revision ID: 2c4aadd998e0
Revises: 4f9c597b1140
Create Date: 2020-11-28 03:29:41.667892

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '2c4aadd998e0'
down_revision = '4f9c597b1140'
branch_labels = None
depends_on = None


def upgrade():
    op.drop_table('user_relationship')
    sa.Enum(name='user_relation').drop(op.get_bind())


def downgrade():
    op.create_table(
        'user_relationship',
        sa.Column('user_a', sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column('user_b', sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column(
            'relation',
            postgresql.ENUM(
                'friend_request_pending',
                'friend',
                name='user_relation'
            ),
            autoincrement=False,
            nullable=False
        ),
        sa.Column(
            'since',
            postgresql.TIMESTAMP(),
            server_default=sa.text('now()'),
            autoincrement=False,
            nullable=False
        ),
        sa.CheckConstraint('user_a < user_b', name='cc_user_relation_pk'),
        sa.ForeignKeyConstraint(
            ['user_a'],
            ['user.id'],
            name='fk_user_relationship_user_a',
            onupdate='CASCADE',
            ondelete='CASCADE'
        ),
        sa.ForeignKeyConstraint(
            ['user_b'],
            ['user.id'],
            name='fk_user_relationship_user_b',
            onupdate='CASCADE',
            ondelete='CASCADE'
        ),
        sa.PrimaryKeyConstraint('user_a', 'user_b', name='pk_user_relation')
    )
