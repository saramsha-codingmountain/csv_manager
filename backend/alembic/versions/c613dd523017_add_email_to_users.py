"""add_email_to_users

Revision ID: c613dd523017
Revises: 001_initial
Create Date: 2026-01-02 14:10:03.560273

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c613dd523017'
down_revision = '001_initial'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add email column - first as nullable to allow migration of existing data
    op.add_column('users', sa.Column('email', sa.String(), nullable=True))
    
    # For existing users, set email based on username
    op.execute("UPDATE users SET email = username || '@example.com' WHERE email IS NULL")
    
    # Now make email non-nullable and unique
    op.alter_column('users', 'email', nullable=False)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_column('users', 'email')

