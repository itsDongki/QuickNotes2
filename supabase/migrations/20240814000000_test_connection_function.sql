-- Create a simple function to test database connection
create or replace function public.test_connection()
returns json
language plpgsql
as $$
begin
  return json_build_object(
    'status', 'ok',
    'timestamp', now()
  );
exception when others then
  raise exception 'Database connection test failed';
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.test_connection() to authenticated;
