"""Add CASCADE delete to foreign keys for hub deletion

Revision ID: 002_cascade_delete
Revises: 000625115f71
Create Date: 2026-01-27

This migration adds ON DELETE CASCADE to all foreign keys referencing
the hubs table, allowing hub deletion without foreign key constraint violations.
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002_cascade_delete'
down_revision = '000625115f71'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Drop and recreate foreign keys with CASCADE delete
    
    # links.hub_id -> hubs.id
    op.drop_constraint('links_hub_id_fkey', 'links', type_='foreignkey')
    op.create_foreign_key(
        'links_hub_id_fkey', 'links', 'hubs',
        ['hub_id'], ['id'], ondelete='CASCADE'
    )
    
    # rules.hub_id -> hubs.id
    op.drop_constraint('rules_hub_id_fkey', 'rules', type_='foreignkey')
    op.create_foreign_key(
        'rules_hub_id_fkey', 'rules', 'hubs',
        ['hub_id'], ['id'], ondelete='CASCADE'
    )
    
    # hub_visits.hub_id -> hubs.id
    op.drop_constraint('hub_visits_hub_id_fkey', 'hub_visits', type_='foreignkey')
    op.create_foreign_key(
        'hub_visits_hub_id_fkey', 'hub_visits', 'hubs',
        ['hub_id'], ['id'], ondelete='CASCADE'
    )
    
    # link_clicks.hub_id -> hubs.id
    op.drop_constraint('link_clicks_hub_id_fkey', 'link_clicks', type_='foreignkey')
    op.create_foreign_key(
        'link_clicks_hub_id_fkey', 'link_clicks', 'hubs',
        ['hub_id'], ['id'], ondelete='CASCADE'
    )
    
    # link_clicks.link_id -> links.id
    op.drop_constraint('link_clicks_link_id_fkey', 'link_clicks', type_='foreignkey')
    op.create_foreign_key(
        'link_clicks_link_id_fkey', 'link_clicks', 'links',
        ['link_id'], ['id'], ondelete='CASCADE'
    )
    
    # short_urls.hub_id -> hubs.id
    op.drop_constraint('short_urls_hub_id_fkey', 'short_urls', type_='foreignkey')
    op.create_foreign_key(
        'short_urls_hub_id_fkey', 'short_urls', 'hubs',
        ['hub_id'], ['id'], ondelete='CASCADE'
    )


def downgrade() -> None:
    # Revert to FK constraints without CASCADE
    
    # link_clicks.link_id -> links.id
    op.drop_constraint('link_clicks_link_id_fkey', 'link_clicks', type_='foreignkey')
    op.create_foreign_key(
        'link_clicks_link_id_fkey', 'link_clicks', 'links',
        ['link_id'], ['id']
    )
    
    # short_urls.hub_id -> hubs.id
    op.drop_constraint('short_urls_hub_id_fkey', 'short_urls', type_='foreignkey')
    op.create_foreign_key(
        'short_urls_hub_id_fkey', 'short_urls', 'hubs',
        ['hub_id'], ['id']
    )
    
    # link_clicks.hub_id -> hubs.id
    op.drop_constraint('link_clicks_hub_id_fkey', 'link_clicks', type_='foreignkey')
    op.create_foreign_key(
        'link_clicks_hub_id_fkey', 'link_clicks', 'hubs',
        ['hub_id'], ['id']
    )
    
    # hub_visits.hub_id -> hubs.id
    op.drop_constraint('hub_visits_hub_id_fkey', 'hub_visits', type_='foreignkey')
    op.create_foreign_key(
        'hub_visits_hub_id_fkey', 'hub_visits', 'hubs',
        ['hub_id'], ['id']
    )
    
    # rules.hub_id -> hubs.id
    op.drop_constraint('rules_hub_id_fkey', 'rules', type_='foreignkey')
    op.create_foreign_key(
        'rules_hub_id_fkey', 'rules', 'hubs',
        ['hub_id'], ['id']
    )
    
    # links.hub_id -> hubs.id
    op.drop_constraint('links_hub_id_fkey', 'links', type_='foreignkey')
    op.create_foreign_key(
        'links_hub_id_fkey', 'links', 'hubs',
        ['hub_id'], ['id']
    )
