-- Public NCreate metrics are entered by staff only when measured values are available.
alter table public.ncreate_site_settings
  add column average_online integer,
  add column uptime_percent numeric(5, 2),
  add constraint ncreate_site_settings_average_online_check
    check (average_online is null or average_online >= 0),
  add constraint ncreate_site_settings_uptime_percent_check
    check (uptime_percent is null or uptime_percent between 0 and 100);
