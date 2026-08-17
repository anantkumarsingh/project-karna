"""add content_hash to papers and datasets

Revision ID: 4f959e04dd2d
Revises: 6be15ca88aac
Create Date: 2026-08-17 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4f959e04dd2d'
down_revision: Union[str, Sequence[str], None] = '6be15ca88aac'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table('papers', schema=None) as batch_op:
        batch_op.add_column(sa.Column('content_hash', sa.String(), nullable=True))
        batch_op.create_index(batch_op.f('ix_papers_content_hash'), ['content_hash'], unique=False)

    with op.batch_alter_table('datasets', schema=None) as batch_op:
        batch_op.add_column(sa.Column('content_hash', sa.String(), nullable=True))
        batch_op.create_index(batch_op.f('ix_datasets_content_hash'), ['content_hash'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('datasets', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_datasets_content_hash'))
        batch_op.drop_column('content_hash')

    with op.batch_alter_table('papers', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_papers_content_hash'))
        batch_op.drop_column('content_hash')
