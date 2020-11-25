"""empty message

Revision ID: 244e83ce078c
Revises: 526a3f5e3f0d
Create Date: 2020-11-25 02:08:06.498358

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '244e83ce078c'
down_revision = '526a3f5e3f0d'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'jwt_blacklist',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('audience', sa.Integer(), nullable=True),
        sa.Column('jti', sa.String(length=255), nullable=False),
        sa.Column('token_type', sa.String(length=255), nullable=False),
        sa.Column('issue_date', sa.DateTime(), nullable=False),
        sa.Column('expiration_date', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ['audience'],
            ['user.id'],
            ondelete='SET NULL'
        ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('jti')
    )


def downgrade():
    op.drop_table('jwt_blacklist')
