"""Add feedback_id to Lottoscheine table

Revision ID: 405cd69037ed
Revises: e22c2a7ee8e8
Create Date: 2024-12-09 11:06:45.328278

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '405cd69037ed'
down_revision = 'e22c2a7ee8e8'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('feedback',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('student_id', sa.Integer(), nullable=False),
    sa.Column('feedback_text', sa.Text(), nullable=False),
    sa.ForeignKeyConstraint(['student_id'], ['student.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('lottoscheine', schema=None) as batch_op:
        batch_op.add_column(sa.Column('feedback_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key(None, 'feedback', ['feedback_id'], ['id'])

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('lottoscheine', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_column('feedback_id')

    op.drop_table('feedback')
    # ### end Alembic commands ###
