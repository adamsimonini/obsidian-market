# Database Upgrades for Advanced Filtering and Search

## Overview

This document outlines the database schema changes and implementation plan needed to support Polymarket-style advanced filtering, searching, and categorization capabilities.

## Features to Implement

Based on Polymarket's interface, we need to support:

1. **Categories** - Hierarchical category system (Politics, Sports, Finance, Crypto, Geopolitics, etc.)
2. **Tags** - Flexible tagging system for topics, people, events (Trump, Epstein, Fed, Token Sales, etc.)
3. **Full-Text Search** - Search across titles, descriptions, tags, and categories
4. **Advanced Sorting** - Trending, Liquidity, Volume, Newest, Ending Soon, Competitive
5. **Status Filtering** - Active, Resolved, All
6. **Category Hiding** - User preferences to hide specific categories
7. **Volume & Liquidity Tracking** - Real-time or cached trading metrics
8. **Frequency Filtering** - Market update frequency or activity level

---

## Database Schema Changes

### 1. Categories Table

Create a hierarchical category system with parent-child relationships.

```sql
-- Categories table for organizing markets
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE, -- e.g., "Politics", "Sports", "Finance"
    slug TEXT NOT NULL UNIQUE, -- URL-friendly version: "politics", "sports"
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL, -- For subcategories
    description TEXT,
    icon TEXT, -- Icon identifier or emoji
    display_order INTEGER DEFAULT 0, -- For custom ordering in UI
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for categories
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active) WHERE is_active = true;

-- Example categories:
-- Politics (parent)
--   └─ Trump (subcategory)
--   └─ Elections (subcategory)
-- Sports (parent)
-- Finance (parent)
--   └─ Fed (subcategory)
-- Crypto (parent)
--   └─ Token Sales (subcategory)
```

### 2. Tags Table

Flexible tagging system for topics, people, events, and keywords.

```sql
-- Tags table for flexible market tagging
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE, -- e.g., "Trump", "Epstein", "Fed", "Ukraine"
    slug TEXT NOT NULL UNIQUE, -- URL-friendly: "trump", "epstein"
    description TEXT,
    tag_type TEXT DEFAULT 'topic', -- 'topic', 'person', 'event', 'location', 'organization'
    usage_count INTEGER DEFAULT 0, -- Track how many markets use this tag
    is_trending BOOLEAN DEFAULT false, -- For highlighting trending tags
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for tags
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_type ON tags(tag_type);
CREATE INDEX idx_tags_trending ON tags(is_trending) WHERE is_trending = true;
CREATE INDEX idx_tags_usage_count ON tags(usage_count DESC); -- For popular tags

-- Full-text search index for tags
CREATE INDEX idx_tags_name_trgm ON tags USING gin(name gin_trgm_ops);
```

### 3. Market Categories Junction Table

Many-to-many relationship between markets and categories.

```sql
-- Junction table for market categories
CREATE TABLE market_categories (
    market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false, -- One primary category per market
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (market_id, category_id)
);

-- Indexes
CREATE INDEX idx_market_categories_market_id ON market_categories(market_id);
CREATE INDEX idx_market_categories_category_id ON market_categories(category_id);
CREATE INDEX idx_market_categories_primary ON market_categories(category_id) WHERE is_primary = true;

-- Constraint: Only one primary category per market
CREATE UNIQUE INDEX idx_market_categories_one_primary 
    ON market_categories(market_id) 
    WHERE is_primary = true;
```

### 4. Market Tags Junction Table

Many-to-many relationship between markets and tags.

```sql
-- Junction table for market tags
CREATE TABLE market_tags (
    market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (market_id, tag_id)
);

-- Indexes
CREATE INDEX idx_market_tags_market_id ON market_tags(market_id);
CREATE INDEX idx_market_tags_tag_id ON market_tags(tag_id);
```

### 5. Market Metrics Table

Track volume, liquidity, and other trading metrics. These can be updated from blockchain queries or cached.

```sql
-- Market metrics for sorting and filtering
CREATE TABLE market_metrics (
    market_id UUID PRIMARY KEY REFERENCES markets(id) ON DELETE CASCADE,
    
    -- Volume metrics (in microcredits, converted to ALEO)
    volume_24h NUMERIC(20,0) DEFAULT 0, -- 24-hour trading volume
    volume_7d NUMERIC(20,0) DEFAULT 0, -- 7-day trading volume
    volume_30d NUMERIC(20,0) DEFAULT 0, -- 30-day trading volume
    volume_all_time NUMERIC(20,0) DEFAULT 0, -- Total volume
    
    -- Liquidity metrics
    liquidity NUMERIC(20,0) DEFAULT 0, -- Current liquidity pool size
    
    -- Activity metrics
    bet_count_24h INTEGER DEFAULT 0, -- Number of bets in last 24h
    bet_count_total INTEGER DEFAULT 0, -- Total number of bets
    
    -- Trending score (calculated field)
    trending_score NUMERIC(10,4) DEFAULT 0, -- Calculated score for trending
    
    -- Competitive score (how close the odds are)
    competitive_score NUMERIC(10,4) DEFAULT 0, -- Closer to 50/50 = more competitive
    
    -- Timestamps
    last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for sorting
CREATE INDEX idx_market_metrics_volume_24h ON market_metrics(volume_24h DESC);
CREATE INDEX idx_market_metrics_liquidity ON market_metrics(liquidity DESC);
CREATE INDEX idx_market_metrics_trending_score ON market_metrics(trending_score DESC);
CREATE INDEX idx_market_metrics_competitive_score ON market_metrics(competitive_score DESC);
CREATE INDEX idx_market_metrics_bet_count_24h ON market_metrics(bet_count_24h DESC);
```

### 6. User Preferences Table

Store user preferences for hiding categories and other UI customizations.

```sql
-- User preferences for filtering
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_address TEXT NOT NULL, -- Wallet address (or user ID if auth is added)
    
    -- Hidden categories
    hidden_category_ids UUID[] DEFAULT '{}', -- Array of category IDs to hide
    
    -- Hidden tags
    hidden_tag_ids UUID[] DEFAULT '{}', -- Array of tag IDs to hide
    
    -- Default filters
    default_status_filter TEXT DEFAULT 'active', -- 'active', 'resolved', 'all'
    default_sort_by TEXT DEFAULT 'trending', -- 'trending', 'liquidity', 'volume', etc.
    
    -- Other preferences
    hide_sports BOOLEAN DEFAULT false,
    hide_crypto BOOLEAN DEFAULT false,
    hide_earnings BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(user_address)
);

-- Indexes
CREATE INDEX idx_user_preferences_user_address ON user_preferences(user_address);
```

### 7. Market Search Index

Full-text search capabilities using PostgreSQL's built-in search.

```sql
-- Add search vector column to markets table
ALTER TABLE markets ADD COLUMN search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION markets_search_vector_update() RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.resolution_rules, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update search vector
CREATE TRIGGER markets_search_vector_trigger
    BEFORE INSERT OR UPDATE ON markets
    FOR EACH ROW
    EXECUTE FUNCTION markets_search_vector_update();

-- Create GIN index for fast full-text search
CREATE INDEX idx_markets_search_vector ON markets USING gin(search_vector);

-- Update existing rows
UPDATE markets SET search_vector = 
    setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(resolution_rules, '')), 'C');
```

### 8. Enable Required Extensions

```sql
-- Enable pg_trgm for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable unaccent for accent-insensitive search (optional)
CREATE EXTENSION IF NOT EXISTS unaccent;
```

---

## Implementation Plan

### Phase 1: Core Schema (Week 1)

1. **Create migration file** for all new tables
2. **Add categories** - Seed initial categories (Politics, Sports, Finance, Crypto, etc.)
3. **Add tags table** - Create tags system
4. **Add junction tables** - Market-categories and market-tags relationships
5. **Update markets table** - Add search_vector column and triggers
6. **Test basic queries** - Verify relationships work correctly

### Phase 2: Metrics & Search (Week 2)

1. **Create market_metrics table** - Set up metrics tracking
2. **Implement metrics update job** - Background job to update metrics from blockchain
3. **Add full-text search** - Implement search_vector triggers and indexes
4. **Create search functions** - Helper functions for complex search queries
5. **Test search performance** - Ensure queries are fast with indexes

### Phase 3: User Preferences (Week 3)

1. **Create user_preferences table** - Store user filter preferences
2. **Implement preference API** - CRUD operations for preferences
3. **Add preference hooks** - React hooks to manage preferences
4. **Test preference persistence** - Verify preferences save and load correctly

### Phase 4: Frontend Integration (Week 4)

1. **Category filtering UI** - Build category navigation component
2. **Tag filtering UI** - Build tag selection/filtering component
3. **Search bar** - Implement full-text search input
4. **Sort dropdowns** - Build sorting UI (Trending, Volume, etc.)
5. **Filter sidebar** - Build comprehensive filter panel
6. **Results display** - Update market list to show filtered results

---

## Query Examples

### 1. Search Markets by Text

```sql
-- Full-text search across title, description, and resolution rules
SELECT m.*, 
       ts_rank(m.search_vector, query) AS rank
FROM markets m,
     to_tsquery('english', 'trump & election') query
WHERE m.search_vector @@ query
  AND m.status = 'open'
ORDER BY rank DESC, m.created_at DESC
LIMIT 20;
```

### 2. Filter by Category

```sql
-- Get markets in Politics category (including subcategories)
WITH RECURSIVE category_tree AS (
    SELECT id FROM categories WHERE slug = 'politics'
    UNION ALL
    SELECT c.id FROM categories c
    INNER JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT DISTINCT m.*
FROM markets m
INNER JOIN market_categories mc ON m.id = mc.market_id
WHERE mc.category_id IN (SELECT id FROM category_tree)
  AND m.status = 'active'
ORDER BY m.created_at DESC;
```

### 3. Filter by Tags

```sql
-- Get markets tagged with "Trump" or "Epstein"
SELECT DISTINCT m.*
FROM markets m
INNER JOIN market_tags mt ON m.id = mt.market_id
INNER JOIN tags t ON mt.tag_id = t.id
WHERE t.slug IN ('trump', 'epstein')
  AND m.status = 'active'
ORDER BY m.created_at DESC;
```

### 4. Sort by Trending

```sql
-- Sort by trending score (combines volume, recency, activity)
SELECT m.*, mm.trending_score
FROM markets m
LEFT JOIN market_metrics mm ON m.id = mm.market_id
WHERE m.status = 'active'
ORDER BY 
    COALESCE(mm.trending_score, 0) DESC,
    mm.volume_24h DESC NULLS LAST,
    m.created_at DESC
LIMIT 50;
```

### 5. Sort by Volume

```sql
-- Sort by 24-hour volume
SELECT m.*, mm.volume_24h
FROM markets m
LEFT JOIN market_metrics mm ON m.id = mm.market_id
WHERE m.status = 'active'
ORDER BY mm.volume_24h DESC NULLS LAST
LIMIT 50;
```

### 6. Sort by Ending Soon

```sql
-- Sort by resolution deadline (ending soonest first)
SELECT m.*
FROM markets m
WHERE m.status = 'active'
  AND m.resolution_deadline > now()
ORDER BY m.resolution_deadline ASC
LIMIT 50;
```

### 7. Complex Filter: Category + Tags + Search

```sql
-- Search for "election" in Politics category, tagged with "Trump"
SELECT DISTINCT m.*,
       ts_rank(m.search_vector, query) AS rank
FROM markets m,
     to_tsquery('english', 'election') query
INNER JOIN market_categories mc ON m.id = mc.market_id
INNER JOIN categories c ON mc.category_id = c.id
INNER JOIN market_tags mt ON m.id = mt.market_id
INNER JOIN tags t ON mt.tag_id = t.id
WHERE m.search_vector @@ query
  AND c.slug = 'politics'
  AND t.slug = 'trump'
  AND m.status = 'active'
ORDER BY rank DESC, m.created_at DESC;
```

### 8. Apply User Preferences (Hide Categories)

```sql
-- Get markets excluding user's hidden categories
SELECT DISTINCT m.*
FROM markets m
LEFT JOIN market_categories mc ON m.id = mc.market_id
LEFT JOIN user_preferences up ON up.user_address = $1
WHERE m.status = 'active'
  AND (mc.category_id IS NULL OR mc.category_id != ALL(up.hidden_category_ids))
ORDER BY m.created_at DESC;
```

---

## Metrics Calculation

### Trending Score Formula

```sql
-- Update trending score (combines multiple factors)
UPDATE market_metrics
SET trending_score = (
    -- Volume weight (40%)
    (LOG(COALESCE(volume_24h, 0) + 1) / LOG(1000000)) * 0.4 +
    -- Recent activity weight (30%)
    (LOG(COALESCE(bet_count_24h, 0) + 1) / LOG(100)) * 0.3 +
    -- Recency weight (20%) - newer markets get boost
    (EXTRACT(EPOCH FROM (now() - (SELECT created_at FROM markets WHERE id = market_id))) / 86400) * 0.2 +
    -- Competitive weight (10%) - close odds = more interesting
    competitive_score * 0.1
)
WHERE last_updated < now() - INTERVAL '1 hour';
```

### Competitive Score Formula

```sql
-- Calculate competitive score (closer to 50/50 = more competitive)
UPDATE market_metrics mm
SET competitive_score = 1 - ABS(
    (SELECT yes_odds FROM markets WHERE id = mm.market_id) - 
    (SELECT no_odds FROM markets WHERE id = mm.market_id)
) / GREATEST(
    (SELECT yes_odds + no_odds FROM markets WHERE id = mm.market_id),
    1
)
FROM markets m
WHERE mm.market_id = m.id;
```

---

## API/Query Functions

### Recommended Supabase Functions

Create PostgreSQL functions for common queries:

```sql
-- Function: Search markets with filters
CREATE OR REPLACE FUNCTION search_markets(
    search_query TEXT DEFAULT NULL,
    category_slug TEXT DEFAULT NULL,
    tag_slugs TEXT[] DEFAULT NULL,
    status_filter TEXT DEFAULT 'active',
    sort_by TEXT DEFAULT 'trending',
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0,
    user_address TEXT DEFAULT NULL
)
RETURNS TABLE (
    market_id UUID,
    title TEXT,
    description TEXT,
    status TEXT,
    volume_24h NUMERIC,
    liquidity NUMERIC,
    trending_score NUMERIC,
    created_at TIMESTAMPTZ,
    rank REAL
) AS $$
BEGIN
    -- Implementation combines all filters and sorting logic
    -- Returns paginated results
END;
$$ LANGUAGE plpgsql;
```

---

## Migration Strategy

### Step-by-Step Migration

1. **Create new tables** (categories, tags, junction tables, metrics, preferences)
2. **Add search_vector column** to markets table
3. **Create indexes** for performance
4. **Seed initial data** (categories, popular tags)
5. **Migrate existing markets** (assign categories/tags manually or via script)
6. **Update application code** to use new schema
7. **Set up metrics update job** (cron job or background worker)
8. **Test thoroughly** before deploying

### Rollback Plan

Keep the old query methods working alongside new ones during migration. Gradually migrate features to use new schema.

---

## Performance Considerations

### Indexing Strategy

- **GIN indexes** for full-text search (search_vector)
- **B-tree indexes** for foreign keys and common filters
- **Composite indexes** for common query patterns
- **Partial indexes** for filtered queries (e.g., active markets only)

### Caching Strategy

- **Cache popular queries** (Redis or in-memory cache)
- **Cache category/tag lists** (rarely change)
- **Cache user preferences** (per-user cache)
- **Cache trending markets** (update every 5-10 minutes)

### Query Optimization

- **Use EXPLAIN ANALYZE** to optimize slow queries
- **Limit result sets** with pagination
- **Use materialized views** for complex aggregations if needed
- **Consider read replicas** for heavy read workloads

---

## Future Enhancements

1. **Auto-tagging** - Use AI/ML to automatically tag markets based on content
2. **Category suggestions** - Suggest categories when creating markets
3. **Tag recommendations** - Suggest relevant tags based on title/description
4. **Search analytics** - Track popular searches and improve search relevance
5. **Saved searches** - Allow users to save search queries
6. **Market collections** - Curated lists of markets (like "Best of 2025")
7. **Related markets** - Show related markets based on tags/categories
8. **Search autocomplete** - Suggest search terms as user types

---

## Testing Checklist

- [ ] Categories can be created and assigned to markets
- [ ] Tags can be created and assigned to markets
- [ ] Full-text search returns relevant results
- [ ] Sorting by volume/liquidity/trending works correctly
- [ ] Filtering by category works (including subcategories)
- [ ] Filtering by tags works (including multiple tags)
- [ ] User preferences persist correctly
- [ ] Hidden categories are excluded from results
- [ ] Complex queries perform well (< 100ms)
- [ ] Metrics update correctly from blockchain data
- [ ] Search handles special characters and edge cases
- [ ] Pagination works correctly with all filters

---

## Notes

- **Blockchain Integration**: Market metrics (volume, liquidity) should ideally be queried from the Aleo blockchain. Consider caching these values and updating them periodically (every 5-15 minutes) rather than querying on every request.

- **Search Quality**: Full-text search quality depends on good content in title and description fields. Consider adding search result highlighting and relevance scoring.

- **Scalability**: As the number of markets grows, consider partitioning the markets table by date or using read replicas for search queries.

- **User Experience**: Consider adding search result counts, "Did you mean?" suggestions, and search history.

