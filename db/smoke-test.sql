-- Smoke test for db/schema.sql. Run right after the schema in the same transaction; it always ends
-- by raising an exception, so nothing it (or the schema) wrote is kept. "SMOKE OK" means it passed.
DO $$
DECLARE
  r uuid; r2 uuid; a uuid; b uuid; o1 uuid; o2 uuid; h1 uuid; h2 uuid; cat uuid; condo uuid;
  n int; tot numeric; hist text;
BEGIN
  SELECT service_category_id INTO cat FROM aide_service_categories WHERE name = 'Plumbing';
  SELECT condo_building_id INTO condo FROM usr_condominiums;
  SELECT aide_id INTO h1 FROM aide_aides WHERE first_name = 'Hal';
  SELECT aide_id INTO h2 FROM aide_aides WHERE first_name = 'Arthur';
  SELECT count(*) INTO n FROM aide_service_prices;
  IF n <> 18 THEN RAISE EXCEPTION 'prices %', n; END IF;
  SELECT count(*) INTO n FROM aide_aides_categories;
  IF n <> 13 THEN RAISE EXCEPTION 'aide categories %', n; END IF;
  SELECT count(*) INTO n FROM aide_condominium_accreditations WHERE accreditation_status = 'Accredited';
  IF n <> 12 THEN RAISE EXCEPTION 'accreditations %', n; END IF;

  INSERT INTO usr_residents (username, email, mobile_number, password_hash, full_name)
    VALUES ('+639170000009', 't@example.com', '+639170000009', 'x', 'T') RETURNING resident_id INTO r;
  INSERT INTO usr_residents (username, email, mobile_number, password_hash, full_name)
    VALUES ('+639170000008', 'u@example.com', '+639170000008', 'x', 'U') RETURNING resident_id INTO r2;
  INSERT INTO usr_resident_addresses (resident_id, condo_building_id, unit_number, is_default)
    VALUES (r, condo, '12B', true) RETURNING resident_address_id INTO a;

  PERFORM set_config('app.actor_role', 'resident', true);
  PERFORM set_config('app.actor_id', r::text, true);
  INSERT INTO usr_bookings (resident_id, resident_address_id, service_category_id, service_type, booking_type, status, base_price, price_offer)
    VALUES (r, a, cat, 'STANDARD', 'on-demand', 'Requested', 450, 500) RETURNING booking_id INTO b;
  INSERT INTO usr_booking_offers (booking_id, aide_id, price, kind) VALUES (b, h1, 500, 'accept') RETURNING booking_offer_id INTO o1;
  INSERT INTO usr_booking_offers (booking_id, aide_id, price, kind) VALUES (b, h2, 600, 'counter') RETURNING booking_offer_id INTO o2;
  UPDATE usr_booking_offers SET status = CASE WHEN booking_offer_id = o1 THEN 'accepted' ELSE 'expired' END WHERE booking_id = b;
  UPDATE usr_bookings SET aide_id = h1, agreed_price = 500, status = 'Accepted' WHERE booking_id = b;

  PERFORM set_config('app.actor_role', 'aide', true);
  PERFORM set_config('app.actor_id', h1::text, true);
  UPDATE usr_bookings SET status = 'On the way', eta_minutes = 10 WHERE booking_id = b;
  UPDATE usr_bookings SET status = 'Arrived' WHERE booking_id = b;
  UPDATE usr_bookings SET status = 'In Progress' WHERE booking_id = b;
  INSERT INTO usr_booking_charges (booking_id, aide_id, label, amount, status)
    VALUES (b, h1, 'Pipe', 120.50, 'approved'), (b, h1, 'Tape', 30, 'pending');
  UPDATE usr_bookings SET status = 'Completed' WHERE booking_id = b;
  INSERT INTO usr_booking_reviews (booking_id, rating, tip) VALUES (b, 5, 50);

  SELECT total_amount INTO tot FROM usr_bookings_v WHERE booking_id = b;
  IF tot IS DISTINCT FROM 620.50 THEN RAISE EXCEPTION 'total %', tot; END IF;
  SELECT count(*) INTO n FROM aide_reviews WHERE aide_id = h1 AND rating = 5;
  IF n <> 1 THEN RAISE EXCEPTION 'aide_reviews %', n; END IF;
  SELECT string_agg(coalesce(from_status, '-') || '>' || to_status || '(' || changed_by_role || ')', ' ' ORDER BY changed_at)
    INTO hist FROM usr_booking_status_history WHERE booking_id = b;

  -- Each of these must be refused by the database.
  BEGIN
    UPDATE usr_bookings SET aide_id = NULL, agreed_price = NULL, status = 'Accepted' WHERE booking_id = b;
    RAISE EXCEPTION 'FAIL: assigned booking without a Manong was allowed';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    INSERT INTO usr_bookings (resident_id, resident_address_id, service_category_id, service_type, booking_type, status)
      VALUES (r2, a, cat, 'STANDARD', 'on-demand', 'Requested');
    RAISE EXCEPTION 'FAIL: booking on another resident''s address was allowed';
  EXCEPTION WHEN foreign_key_violation THEN NULL; END;
  BEGIN
    UPDATE usr_booking_offers SET status = 'accepted' WHERE booking_offer_id = o2;
    RAISE EXCEPTION 'FAIL: second accepted offer was allowed';
  EXCEPTION WHEN unique_violation THEN NULL; END;
  BEGIN
    INSERT INTO usr_bookings (resident_id, resident_address_id, service_category_id, service_type, booking_type, status, cancel_reason)
      VALUES (r, a, cat, 'STANDARD', 'on-demand', 'Requested', 'changed my mind');
    RAISE EXCEPTION 'FAIL: cancel reason on an open booking was allowed';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    INSERT INTO usr_booking_offers (booking_id, aide_id, price, kind) VALUES (b, gen_random_uuid(), 500, 'accept');
    RAISE EXCEPTION 'FAIL: offer from an unknown Manong was allowed';
  EXCEPTION WHEN foreign_key_violation THEN NULL; END;
  BEGIN
    INSERT INTO usr_resident_addresses (resident_id, condo_building_id, unit_number, is_default)
      VALUES (r, condo, '14C', true);
    RAISE EXCEPTION 'FAIL: second default address was allowed';
  EXCEPTION WHEN unique_violation THEN NULL; END;

  RAISE EXCEPTION 'SMOKE OK | %', hist;
END $$;
