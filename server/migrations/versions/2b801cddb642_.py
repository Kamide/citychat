"""empty message

Revision ID: 2b801cddb642
Revises: 244e83ce078c
Create Date: 2020-11-27 16:43:52.660307

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2b801cddb642'
down_revision = '244e83ce078c'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('jwt_blacklist', schema=None) as batch_op:
        batch_op.drop_constraint(
            'jwt_blacklist_audience_fkey',
            type_='foreignkey'
        )
        batch_op.create_foreign_key(
            'fk_jwt_blacklist_audience',
            'user',
            ['audience'],
            ['id'],
            onupdate='CASCADE',
            ondelete='SET NULL'
        )

    with op.batch_alter_table('user_profile', schema=None) as batch_op:
        batch_op.drop_constraint('user_profile_id_fkey', type_='foreignkey')
        batch_op.create_foreign_key(
            'fk_user_profile_id',
            'user',
            ['id'],
            ['id'],
            onupdate='CASCADE',
            ondelete='CASCADE'
        )


def downgrade():
    with op.batch_alter_table('user_profile', schema=None) as batch_op:
        batch_op.drop_constraint('fk_user_profile_id', type_='foreignkey')
        batch_op.create_foreign_key(
            'user_profile_id_fkey',
            'user',
            ['id'],
            ['id'],
            ondelete='CASCADE'
        )

    with op.batch_alter_table('jwt_blacklist', schema=None) as batch_op:
        batch_op.drop_constraint(
            'fk_jwt_blacklist_audience',
            type_='foreignkey'
        )
        batch_op.create_foreign_key(
            'jwt_blacklist_audience_fkey',
            'user',
            ['audience'],
            ['id'],
            ondelete='SET NULL'
        )
