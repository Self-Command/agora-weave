ALTER TABLE core.media_derivative ADD CONSTRAINT derivative_kind_registered
  CHECK (kind IN ('thumbnail','preview','segment'));
