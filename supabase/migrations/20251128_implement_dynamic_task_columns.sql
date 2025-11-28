-- Fix RLS policy for tasks - Add DELETE permission for task creators
CREATE POLICY "Users can delete their own tasks" ON tasks FOR DELETE USING (auth.uid() = creator_id);
CREATE POLICY "Admins can delete any tasks" ON tasks FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Create task_columns table for dynamic board columns
CREATE TABLE task_columns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3b82f6',
    position INTEGER NOT NULL DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(name, created_by)
);

-- Enable RLS on task_columns
ALTER TABLE task_columns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for task_columns
CREATE POLICY "Users can view their own columns" ON task_columns FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Admins can view all columns" ON task_columns FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create columns" ON task_columns FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own columns" ON task_columns FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own columns" ON task_columns FOR DELETE USING (auth.uid() = created_by);

-- Add column_id to tasks table
ALTER TABLE tasks ADD COLUMN column_id UUID REFERENCES task_columns(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_task_columns_created_by ON task_columns(created_by);
CREATE INDEX idx_tasks_column_id ON tasks(column_id);

-- Trigger for updated_at on task_columns
CREATE TRIGGER update_task_columns_updated_at BEFORE UPDATE ON task_columns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
