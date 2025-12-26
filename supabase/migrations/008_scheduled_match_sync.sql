-- Enable pg_cron and pg_net extensions for scheduled HTTP calls
-- This allows us to automatically sync match results from football-data.org

-- Enable the pg_net extension for making HTTP requests from the database
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Enable pg_cron for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;

-- Create a table to store sync job logs
CREATE TABLE IF NOT EXISTS match_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'running', -- 'running', 'success', 'error'
    matches_updated INTEGER DEFAULT 0,
    matches_skipped INTEGER DEFAULT 0,
    error_message TEXT,
    response_body JSONB
);

-- Create index for querying recent logs
CREATE INDEX idx_match_sync_logs_started_at ON match_sync_logs(started_at DESC);

-- Create a config table for edge function settings
CREATE TABLE IF NOT EXISTS app_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default local development values
INSERT INTO app_config (key, value) VALUES
    ('edge_function_base_url', 'http://127.0.0.1:54321'),
    ('service_role_key', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU')
ON CONFLICT (key) DO NOTHING;

-- Helper function to get config value
CREATE OR REPLACE FUNCTION get_app_config(config_key TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
    SELECT value FROM app_config WHERE key = config_key;
$$;

-- Helper function to set config value (admin only via RLS)
CREATE OR REPLACE FUNCTION set_app_config(config_key TEXT, config_value TEXT)
RETURNS void
LANGUAGE sql
AS $$
    INSERT INTO app_config (key, value, updated_at)
    VALUES (config_key, config_value, NOW())
    ON CONFLICT (key) DO UPDATE SET value = config_value, updated_at = NOW();
$$;

-- Function to call the Edge Function and log results
CREATE OR REPLACE FUNCTION sync_match_results()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    log_id UUID;
    base_url TEXT;
    edge_function_url TEXT;
    service_role_key TEXT;
BEGIN
    -- Create a log entry
    INSERT INTO match_sync_logs (status) VALUES ('running') RETURNING id INTO log_id;

    -- Get config from app_config table
    base_url := get_app_config('edge_function_base_url');
    service_role_key := get_app_config('service_role_key');

    -- Construct the full Edge Function URL
    edge_function_url := base_url || '/functions/v1/sync-match-results';

    -- Make the HTTP request using pg_net
    PERFORM net.http_post(
        url := edge_function_url,
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || service_role_key
        ),
        body := '{}'::jsonb
    );

    -- Note: pg_net is async, so we can't get the response directly
    -- The Edge Function will update the database, and we mark this as potentially successful
    UPDATE match_sync_logs
    SET
        completed_at = NOW(),
        status = 'success'
    WHERE id = log_id;

EXCEPTION WHEN OTHERS THEN
    UPDATE match_sync_logs
    SET
        completed_at = NOW(),
        status = 'error',
        error_message = SQLERRM
    WHERE id = log_id;
    RAISE;
END;
$$;

-- Create a helper function to enable/disable the sync schedule
CREATE OR REPLACE FUNCTION toggle_match_sync(enabled BOOLEAN, interval_minutes INTEGER DEFAULT 10)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- First, try to unschedule any existing job
    BEGIN
        PERFORM cron.unschedule('sync-match-results');
    EXCEPTION WHEN OTHERS THEN
        -- Job doesn't exist, that's fine
        NULL;
    END;

    IF enabled THEN
        -- Schedule the job
        PERFORM cron.schedule(
            'sync-match-results',
            '*/' || interval_minutes::TEXT || ' * * * *',
            'SELECT sync_match_results()'
        );
        RETURN 'Match sync scheduled every ' || interval_minutes || ' minutes';
    ELSE
        RETURN 'Match sync disabled';
    END IF;
END;
$$;

-- Add RLS policies
ALTER TABLE match_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view sync logs"
    ON match_sync_logs FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can view app config"
    ON app_config FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Service role can update config (used by GitHub Actions)
CREATE POLICY "Service role can manage app config"
    ON app_config FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON TABLE match_sync_logs IS 'Logs for automatic match result synchronization from football-data.org';
COMMENT ON TABLE app_config IS 'Application configuration for Edge Functions and cron jobs';
COMMENT ON FUNCTION sync_match_results() IS 'Calls the sync-match-results Edge Function to update match scores';
COMMENT ON FUNCTION toggle_match_sync(BOOLEAN, INTEGER) IS 'Enable or disable automatic match sync. Usage: SELECT toggle_match_sync(true, 10) for every 10 minutes';
