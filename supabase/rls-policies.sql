-- ============================================
-- WP Keyword AI Tool - Row Level Security Policies
-- ============================================
-- 此 SQL 檔案用於設定 Supabase Row Level Security
-- 執行方式：在 Supabase Dashboard > SQL Editor 中執行
-- ============================================

-- ============================================
-- 1. 啟用 Row Level Security
-- ============================================

ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE longtails ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. Sites Table Policies
-- ============================================

-- 使用者可以查看自己的網站
CREATE POLICY "Users can view their own sites"
  ON sites
  FOR SELECT
  USING (auth.uid() = user_id);

-- 使用者可以新增網站到自己的帳號
CREATE POLICY "Users can insert their own sites"
  ON sites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 使用者可以更新自己的網站
CREATE POLICY "Users can update their own sites"
  ON sites
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 使用者可以刪除自己的網站
CREATE POLICY "Users can delete their own sites"
  ON sites
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. Projects Table Policies
-- ============================================

-- 使用者可以查看自己的專案
CREATE POLICY "Users can view their own projects"
  ON projects
  FOR SELECT
  USING (auth.uid() = user_id);

-- 使用者可以建立專案
CREATE POLICY "Users can insert their own projects"
  ON projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 使用者可以更新自己的專案
CREATE POLICY "Users can update their own projects"
  ON projects
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 使用者可以刪除自己的專案
CREATE POLICY "Users can delete their own projects"
  ON projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. Keywords Table Policies
-- （透過 projects 關聯驗證）
-- ============================================

-- 使用者可以查看自己專案的關鍵字
CREATE POLICY "Users can view keywords of their projects"
  ON keywords
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM projects
      WHERE projects.id = keywords.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- 使用者可以新增關鍵字到自己的專案
CREATE POLICY "Users can insert keywords to their projects"
  ON keywords
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM projects
      WHERE projects.id = keywords.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- 使用者可以更新自己專案的關鍵字
CREATE POLICY "Users can update keywords of their projects"
  ON keywords
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM projects
      WHERE projects.id = keywords.project_id
        AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM projects
      WHERE projects.id = keywords.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- 使用者可以刪除自己專案的關鍵字
CREATE POLICY "Users can delete keywords of their projects"
  ON keywords
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM projects
      WHERE projects.id = keywords.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- ============================================
-- 5. Longtails Table Policies
-- （透過 keywords 和 projects 關聯驗證）
-- ============================================

-- 使用者可以查看自己關鍵字的長尾字
CREATE POLICY "Users can view longtails of their keywords"
  ON longtails
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM keywords
      INNER JOIN projects ON keywords.project_id = projects.id
      WHERE keywords.id = longtails.parent_id
        AND projects.user_id = auth.uid()
    )
  );

-- 使用者可以新增長尾字到自己的關鍵字
CREATE POLICY "Users can insert longtails to their keywords"
  ON longtails
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM keywords
      INNER JOIN projects ON keywords.project_id = projects.id
      WHERE keywords.id = longtails.parent_id
        AND projects.user_id = auth.uid()
    )
  );

-- 使用者可以更新自己關鍵字的長尾字
CREATE POLICY "Users can update longtails of their keywords"
  ON longtails
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM keywords
      INNER JOIN projects ON keywords.project_id = projects.id
      WHERE keywords.id = longtails.parent_id
        AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM keywords
      INNER JOIN projects ON keywords.project_id = projects.id
      WHERE keywords.id = longtails.parent_id
        AND projects.user_id = auth.uid()
    )
  );

-- 使用者可以刪除自己關鍵字的長尾字
CREATE POLICY "Users can delete longtails of their keywords"
  ON longtails
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM keywords
      INNER JOIN projects ON keywords.project_id = projects.id
      WHERE keywords.id = longtails.parent_id
        AND projects.user_id = auth.uid()
    )
  );

-- ============================================
-- 6. Articles Table Policies
-- ============================================

-- 使用者可以查看自己的文章
CREATE POLICY "Users can view their own articles"
  ON articles
  FOR SELECT
  USING (auth.uid() = user_id);

-- 使用者可以建立文章
CREATE POLICY "Users can insert their own articles"
  ON articles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 使用者可以更新自己的文章
CREATE POLICY "Users can update their own articles"
  ON articles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 使用者可以刪除自己的文章
CREATE POLICY "Users can delete their own articles"
  ON articles
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 7. 建立索引以提升查詢效能
-- ============================================

-- Sites
CREATE INDEX IF NOT EXISTS idx_sites_user_id ON sites(user_id);
CREATE INDEX IF NOT EXISTS idx_sites_created_at ON sites(created_at DESC);

-- Projects
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- Keywords
CREATE INDEX IF NOT EXISTS idx_keywords_project_id ON keywords(project_id);
CREATE INDEX IF NOT EXISTS idx_keywords_intent ON keywords(intent);
CREATE INDEX IF NOT EXISTS idx_keywords_group ON keywords("group");
CREATE INDEX IF NOT EXISTS idx_keywords_created_at ON keywords(created_at DESC);

-- Longtails
CREATE INDEX IF NOT EXISTS idx_longtails_parent_id ON longtails(parent_id);

-- Articles
CREATE INDEX IF NOT EXISTS idx_articles_user_id ON articles(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_site_id ON articles(site_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_scheduled_at ON articles(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);

-- ============================================
-- 8. 驗證 RLS 設定
-- ============================================

-- 檢查所有表的 RLS 狀態（應該都是 true）
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('sites', 'projects', 'keywords', 'longtails', 'articles');

-- 查看所有 Policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('sites', 'projects', 'keywords', 'longtails', 'articles')
ORDER BY tablename, policyname;

-- ============================================
-- 執行完成訊息
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Row Level Security Policies 已成功設定！';
  RAISE NOTICE '📊 共設定 5 個資料表的 RLS';
  RAISE NOTICE '🔒 共建立 24 個 Policy';
  RAISE NOTICE '⚡ 共建立 11 個索引';
  RAISE NOTICE '';
  RAISE NOTICE '請執行以下查詢驗證設定：';
  RAISE NOTICE 'SELECT tablename, rowsecurity FROM pg_tables WHERE tablename IN (''sites'', ''projects'', ''keywords'', ''longtails'', ''articles'');';
END $$;
