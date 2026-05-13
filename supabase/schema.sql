-- Create roles table
CREATE TABLE roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL CHECK (nombre IN ('superadmin', 'profesor', 'estudiante')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert base roles
INSERT INTO roles (nombre) VALUES ('superadmin'), ('profesor'), ('estudiante');

-- Create usuarios table
CREATE TABLE usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  matricula CHAR(9) UNIQUE,
  rol_id UUID REFERENCES roles(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_email_or_matricula CHECK (
    (email IS NOT NULL AND matricula IS NULL) OR 
    (email IS NULL AND matricula IS NOT NULL) OR
    (email IS NOT NULL AND matricula IS NOT NULL) -- Need email for auth even if matricula exists
  )
);

-- Create materias table
CREATE TABLE materias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  profesor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create estudiante_materia table
CREATE TABLE estudiante_materia (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  estudiante_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  materia_id UUID REFERENCES materias(id) ON DELETE CASCADE,
  calificacion NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(estudiante_id, materia_id)
);

-- RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE materias ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudiante_materia ENABLE ROW LEVEL SECURITY;

-- Helper Function for Role
CREATE OR REPLACE FUNCTION get_auth_rol() RETURNS VARCHAR AS $$
  SELECT r.nombre FROM roles r
  JOIN usuarios u ON r.id = u.rol_id
  WHERE u.id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Policies for roles
CREATE POLICY "Roles read all" ON roles FOR SELECT TO authenticated USING (true);

-- Policies for usuarios
CREATE POLICY "Usuarios read" ON usuarios FOR SELECT TO authenticated
USING (
  id = auth.uid() OR
  get_auth_rol() = 'superadmin' OR
  get_auth_rol() = 'profesor'
);

CREATE POLICY "Usuarios update" ON usuarios FOR UPDATE TO authenticated
USING (
  id = auth.uid() OR
  get_auth_rol() = 'superadmin' OR
  (get_auth_rol() = 'profesor' AND (SELECT nombre FROM roles WHERE id = rol_id) = 'estudiante')
);

CREATE POLICY "Usuarios insert" ON usuarios FOR INSERT TO authenticated
WITH CHECK (
  get_auth_rol() = 'superadmin' OR
  (get_auth_rol() = 'profesor' AND (SELECT nombre FROM roles WHERE id = rol_id) = 'estudiante')
);

CREATE POLICY "Usuarios delete" ON usuarios FOR DELETE TO authenticated
USING (
  get_auth_rol() = 'superadmin'
);

-- Policies for materias
CREATE POLICY "Materias read" ON materias FOR SELECT TO authenticated
USING (
  get_auth_rol() = 'superadmin' OR
  profesor_id = auth.uid() OR
  id IN (SELECT materia_id FROM estudiante_materia WHERE estudiante_id = auth.uid())
);

CREATE POLICY "Materias insert" ON materias FOR INSERT TO authenticated
WITH CHECK (
  get_auth_rol() = 'superadmin' OR
  (get_auth_rol() = 'profesor' AND profesor_id = auth.uid())
);

CREATE POLICY "Materias update" ON materias FOR UPDATE TO authenticated
USING (
  get_auth_rol() = 'superadmin' OR
  (get_auth_rol() = 'profesor' AND profesor_id = auth.uid())
);

CREATE POLICY "Materias delete" ON materias FOR DELETE TO authenticated
USING (
  get_auth_rol() = 'superadmin' OR
  (get_auth_rol() = 'profesor' AND profesor_id = auth.uid())
);

-- Policies for estudiante_materia
CREATE POLICY "EM read" ON estudiante_materia FOR SELECT TO authenticated
USING (
  get_auth_rol() = 'superadmin' OR
  estudiante_id = auth.uid() OR
  materia_id IN (SELECT id FROM materias WHERE profesor_id = auth.uid())
);

CREATE POLICY "EM insert" ON estudiante_materia FOR INSERT TO authenticated
WITH CHECK (
  get_auth_rol() = 'superadmin' OR
  (get_auth_rol() = 'profesor' AND materia_id IN (SELECT id FROM materias WHERE profesor_id = auth.uid()))
);

CREATE POLICY "EM update" ON estudiante_materia FOR UPDATE TO authenticated
USING (
  get_auth_rol() = 'superadmin' OR
  (get_auth_rol() = 'profesor' AND materia_id IN (SELECT id FROM materias WHERE profesor_id = auth.uid()))
);

CREATE POLICY "EM delete" ON estudiante_materia FOR DELETE TO authenticated
USING (
  get_auth_rol() = 'superadmin' OR
  (get_auth_rol() = 'profesor' AND materia_id IN (SELECT id FROM materias WHERE profesor_id = auth.uid()))
);
