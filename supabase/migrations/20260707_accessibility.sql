-- Accessibility migration: add elevator and step-free columns
ALTER TABLE public.zones ADD COLUMN IF NOT EXISTS
  has_elevator boolean DEFAULT false;

ALTER TABLE public.zone_edges ADD COLUMN IF NOT EXISTS
  is_step_free boolean DEFAULT true;

-- Mark gates and concourses as having elevators
UPDATE public.zones SET has_elevator = true
WHERE name ILIKE '%gate%' OR name ILIKE '%concourse%';
