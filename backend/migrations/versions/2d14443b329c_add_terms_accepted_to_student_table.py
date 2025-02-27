"""Add terms_accepted to Student table

Revision ID: 2d14443b329c
Revises: 405cd69037ed
Create Date: 2024-12-09 11:31:04.504913

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2d14443b329c'
down_revision = '405cd69037ed'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('student', schema=None) as batch_op:
        batch_op.add_column(sa.Column('terms_accepted', sa.Boolean(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('student', schema=None) as batch_op:
        batch_op.drop_column('terms_accepted')

    # ### end Alembic commands ###
