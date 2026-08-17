"""add storage_path/sensitivity_level to papers and datasets, column_dtypes to datasets

Revision ID: 6be15ca88aac
Revises: a94d45715a98
Create Date: 2026-08-16 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6be15ca88aac'
down_revision: Union[str, Sequence[str], None] = 'a94d45715a98'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # server_default (not just the ORM-level default=) so existing seeded rows
    # are backfilled to 'restricted' by the migration itself, not just future inserts.
    with op.batch_alter_table('papers', schema=None) as batch_op:
        batch_op.add_column(sa.Column('storage_path', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('sensitivity_level', sa.String(), nullable=False, server_default='restricted'))

    with op.batch_alter_table('datasets', schema=None) as batch_op:
        batch_op.add_column(sa.Column('storage_path', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('sensitivity_level', sa.String(), nullable=False, server_default='restricted'))
        batch_op.add_column(sa.Column('column_dtypes', sa.JSON(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('datasets', schema=None) as batch_op:
        batch_op.drop_column('column_dtypes')
        batch_op.drop_column('sensitivity_level')
        batch_op.drop_column('storage_path')

    with op.batch_alter_table('papers', schema=None) as batch_op:
        batch_op.drop_column('sensitivity_level')
        batch_op.drop_column('storage_path')
