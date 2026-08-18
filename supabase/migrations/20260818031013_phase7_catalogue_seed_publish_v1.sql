-- Publishes and activates the seeded v1 catalogue now that all 12 project
-- types have been inserted. See 20260818031000's header for why
-- published_at had to stay null until this point — publishing earlier
-- would have locked out the seed_NN_*.sql files that follow it.
update public.catalogue_versions
set is_active = true, published_at = now()
where id = '400fb65c-a931-463f-a627-d1b0f04d8698';
