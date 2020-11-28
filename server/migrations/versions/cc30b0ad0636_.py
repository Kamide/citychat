"""empty message

Revision ID: cc30b0ad0636
Revises: 2c4aadd998e0
Create Date: 2020-11-28 13:04:42.432949

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'cc30b0ad0636'
down_revision = '2c4aadd998e0'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'user_relationship',
        sa.Column('user_a', sa.Integer(), nullable=False),
        sa.Column('user_b', sa.Integer(), nullable=False),
        sa.Column('relation', sa.String(length=2), nullable=True),
        sa.Column('since', sa.DateTime(), nullable=True),
        sa.CheckConstraint("relation IN ('FX', 'XF', 'F')",
                           name='cc_user_relation_relation'),
        sa.CheckConstraint('user_a < user_b', name='cc_user_relation_pk'),
        sa.ForeignKeyConstraint(['user_a'], ['user.id'],
                                name='fk_user_relationship_user_a',
                                onupdate='CASCADE', ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_b'], ['user.id'],
                                name='fk_user_relationship_user_b',
                                onupdate='CASCADE', ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('user_a', 'user_b', name='pk_user_relation')
    )


def downgrade():
    op.drop_table('user_relationship')
