"""add project_id to artifacts

Revision ID: a94d45715a98
Revises: bcb5449c9bd4
Create Date: 2026-07-08 21:48:27.289981

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a94d45715a98'
down_revision: Union[str, Sequence[str], None] = 'bcb5449c9bd4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # SQLite can't ALTER a table to add a constraint in place — batch mode
    # does the copy-and-move recreation Alembic's SQLite dialect needs.
    with op.batch_alter_table('artifacts', schema=None) as batch_op:
        batch_op.add_column(sa.Column('project_id', sa.String(), nullable=False))
        batch_op.create_index(batch_op.f('ix_artifacts_project_id'), ['project_id'], unique=False)
        batch_op.create_foreign_key('fk_artifacts_project_id_projects', 'projects', ['project_id'], ['id'])


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('artifacts', schema=None) as batch_op:
        batch_op.drop_constraint('fk_artifacts_project_id_projects', type_='foreignkey')
        batch_op.drop_index(batch_op.f('ix_artifacts_project_id'))
        batch_op.drop_column('project_id')
