"""Initial migration - Create all tables

Revision ID: 001_initial
Revises: 
Create Date: 2026-01-23

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    
    # Create hubs table
    op.create_table(
        'hubs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('slug', sa.String(50), nullable=False),
        sa.Column('theme', postgresql.JSON(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, default=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_hubs_slug', 'hubs', ['slug'], unique=True)
    
    # Create links table
    op.create_table(
        'links',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('hub_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(100), nullable=False),
        sa.Column('url', sa.String(2048), nullable=False),
        sa.Column('icon', sa.String(50), nullable=True),
        sa.Column('position', sa.Integer(), nullable=True, default=0),
        sa.Column('is_enabled', sa.Boolean(), nullable=True, default=True),
        sa.Column('click_count', sa.Integer(), nullable=True, default=0),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['hub_id'], ['hubs.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create rules table
    op.create_table(
        'rules',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('hub_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('rule_type', sa.String(50), nullable=False),
        sa.Column('condition', postgresql.JSON(), nullable=False),
        sa.Column('action', postgresql.JSON(), nullable=False),
        sa.Column('priority', sa.Integer(), nullable=True, default=0),
        sa.Column('is_active', sa.Boolean(), nullable=True, default=True),
        sa.Column('target_link_ids', postgresql.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['hub_id'], ['hubs.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create hub_visits table
    op.create_table(
        'hub_visits',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('hub_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('visitor_ip', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.String(500), nullable=True),
        sa.Column('device_type', sa.String(20), nullable=True),
        sa.Column('country', sa.String(2), nullable=True),
        sa.Column('visited_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['hub_id'], ['hubs.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_hub_visits_visited_at', 'hub_visits', ['visited_at'])
    
    # Create link_clicks table
    op.create_table(
        'link_clicks',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('link_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('hub_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('visitor_ip', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.String(500), nullable=True),
        sa.Column('device_type', sa.String(20), nullable=True),
        sa.Column('country', sa.String(2), nullable=True),
        sa.Column('clicked_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['hub_id'], ['hubs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['link_id'], ['links.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_link_clicks_clicked_at', 'link_clicks', ['clicked_at'])


def downgrade() -> None:
    op.drop_table('link_clicks')
    op.drop_table('hub_visits')
    op.drop_table('rules')
    op.drop_table('links')
    op.drop_table('hubs')
    op.drop_table('users')
