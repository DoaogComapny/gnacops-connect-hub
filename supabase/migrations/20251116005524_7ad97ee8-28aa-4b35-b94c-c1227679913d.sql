-- Add appointments permission
INSERT INTO permissions (code, name, description, module)
VALUES ('appointments.manage', 'Manage Appointments', 'Can review and approve/reject appointment requests', 'office_management')
ON CONFLICT (code) DO NOTHING;

-- Assign appointments permission to secretary role
INSERT INTO role_permissions (role, permission_id)
SELECT 'secretary'::app_role, id
FROM permissions
WHERE code = 'appointments.manage'
ON CONFLICT DO NOTHING;