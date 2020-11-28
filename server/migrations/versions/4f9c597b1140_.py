"""empty message

Revision ID: 4f9c597b1140
Revises: 2b801cddb642
Create Date: 2020-11-27 23:41:37.808897

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4f9c597b1140'
down_revision = '2b801cddb642'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'user_relationship',
        sa.Column('user_a', sa.Integer(), nullable=False),
        sa.Column('user_b', sa.Integer(), nullable=False),
        sa.Column(
            'relation',
            sa.Enum(
                'friend_request_pending',
                'friend',
                name='user_relation'
            ),
            nullable=False
        ),
        sa.Column(
            'since',
            sa.DateTime(),
            server_default=sa.text('now()'),
            nullable=False
        ),
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
        sa.PrimaryKeyConstraint('user_a', 'user_b', name='pk_user_relation'),
        sa.CheckConstraint('user_a < user_b', name='cc_user_relation_pk')
    )

    with op.batch_alter_table('user_profile', schema=None) as batch_op:
        batch_op.drop_constraint('cc_email')
        batch_op.create_check_constraint(
            constraint_name='cc_user_profile_email',
            condition="email ~ '[^@]+@[^@]+\\.[^@]+'"
        )
        batch_op.drop_constraint('cc_name')
        batch_op.create_check_constraint(
            constraint_name='cc_user_profile_name',
            condition='char_length(trim(name)) > 0'
        )


def downgrade():
    op.drop_table('user_relationship')
    sa.Enum(name='user_relation').drop(op.get_bind())

    with op.batch_alter_table('user_profile', schema=None) as batch_op:
        batch_op.drop_constraint('cc_user_profile_email')
        batch_op.create_check_constraint(
            constraint_name='cc_email',
            condition="email ~ '[^@]+@[^@]+\\.[^@]+'"
        )
        batch_op.drop_constraint('cc_user_profile_name')
        batch_op.create_check_constraint(
            constraint_name='cc_name',
            condition='char_length(trim(name)) > 0'
        )
