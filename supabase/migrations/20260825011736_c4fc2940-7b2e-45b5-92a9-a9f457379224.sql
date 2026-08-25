CREATE TABLE public.messages (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  number text NOT NULL REFERENCES public.contacts(number) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin manages messages" ON public.messages
  FOR ALL
  USING (public.is_jejum_admin())
  WITH CHECK (public.is_jejum_admin());

CREATE INDEX messages_number_created_at_idx ON public.messages (number, created_at DESC);