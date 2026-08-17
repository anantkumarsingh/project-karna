"""make paper_id nullable on research_questions, artifacts, reports

Revision ID: 5968f28cc480
Revises: 4f959e04dd2d
Create Date: 2026-08-17 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5968f28cc480'
down_revision: Union[str, Sequence[str], None] = '4f959e04dd2d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table('research_questions', schema=None) as batch_op:
        batch_op.alter_column('paper_id', existing_type=sa.String(), nullable=True)

    with op.batch_alter_table('artifacts', schema=None) as batch_op:
        batch_op.alter_column('paper_id', existing_type=sa.String(), nullable=True)

    with op.batch_alter_table('reports', schema=None) as batch_op:
        batch_op.alter_column('paper_id', existing_type=sa.String(), nullable=True)


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('reports', schema=None) as batch_op:
        batch_op.alter_column('paper_id', existing_type=sa.String(), nullable=False)

    with op.batch_alter_table('artifacts', schema=None) as batch_op:
        batch_op.alter_column('paper_id', existing_type=sa.String(), nullable=False)

    with op.batch_alter_table('research_questions', schema=None) as batch_op:
        batch_op.alter_column('paper_id', existing_type=sa.String(), nullable=False)
