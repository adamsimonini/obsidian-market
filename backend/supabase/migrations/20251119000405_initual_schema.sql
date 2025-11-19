
  create table "public"."admins" (
    "wallet_address" text not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."admins" enable row level security;


  create table "public"."markets" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "title" text not null,
    "description" text,
    "resolution_rules" text not null,
    "resolution_source" text not null,
    "resolution_deadline" timestamp with time zone not null,
    "status" text not null,
    "yes_odds" numeric(10,2) not null,
    "no_odds" numeric(10,2) not null,
    "creator_address" text not null,
    "market_id_onchain" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."markets" enable row level security;

CREATE UNIQUE INDEX admins_pkey ON public.admins USING btree (wallet_address);

CREATE INDEX idx_markets_created_at ON public.markets USING btree (created_at DESC);

CREATE INDEX idx_markets_market_id_onchain ON public.markets USING btree (market_id_onchain);

CREATE INDEX idx_markets_status ON public.markets USING btree (status);

CREATE UNIQUE INDEX markets_market_id_onchain_key ON public.markets USING btree (market_id_onchain);

CREATE UNIQUE INDEX markets_pkey ON public.markets USING btree (id);

alter table "public"."admins" add constraint "admins_pkey" PRIMARY KEY using index "admins_pkey";

alter table "public"."markets" add constraint "markets_pkey" PRIMARY KEY using index "markets_pkey";

alter table "public"."markets" add constraint "markets_market_id_onchain_key" UNIQUE using index "markets_market_id_onchain_key";

alter table "public"."markets" add constraint "markets_no_odds_check" CHECK ((no_odds > (0)::numeric)) not valid;

alter table "public"."markets" validate constraint "markets_no_odds_check";

alter table "public"."markets" add constraint "markets_status_check" CHECK ((status = ANY (ARRAY['open'::text, 'closed'::text, 'resolved'::text, 'cancelled'::text]))) not valid;

alter table "public"."markets" validate constraint "markets_status_check";

alter table "public"."markets" add constraint "markets_yes_odds_check" CHECK ((yes_odds > (0)::numeric)) not valid;

alter table "public"."markets" validate constraint "markets_yes_odds_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$
;

grant delete on table "public"."admins" to "anon";

grant insert on table "public"."admins" to "anon";

grant references on table "public"."admins" to "anon";

grant select on table "public"."admins" to "anon";

grant trigger on table "public"."admins" to "anon";

grant truncate on table "public"."admins" to "anon";

grant update on table "public"."admins" to "anon";

grant delete on table "public"."admins" to "authenticated";

grant insert on table "public"."admins" to "authenticated";

grant references on table "public"."admins" to "authenticated";

grant select on table "public"."admins" to "authenticated";

grant trigger on table "public"."admins" to "authenticated";

grant truncate on table "public"."admins" to "authenticated";

grant update on table "public"."admins" to "authenticated";

grant delete on table "public"."admins" to "postgres";

grant insert on table "public"."admins" to "postgres";

grant references on table "public"."admins" to "postgres";

grant select on table "public"."admins" to "postgres";

grant trigger on table "public"."admins" to "postgres";

grant truncate on table "public"."admins" to "postgres";

grant update on table "public"."admins" to "postgres";

grant delete on table "public"."admins" to "service_role";

grant insert on table "public"."admins" to "service_role";

grant references on table "public"."admins" to "service_role";

grant select on table "public"."admins" to "service_role";

grant trigger on table "public"."admins" to "service_role";

grant truncate on table "public"."admins" to "service_role";

grant update on table "public"."admins" to "service_role";

grant delete on table "public"."markets" to "anon";

grant insert on table "public"."markets" to "anon";

grant references on table "public"."markets" to "anon";

grant select on table "public"."markets" to "anon";

grant trigger on table "public"."markets" to "anon";

grant truncate on table "public"."markets" to "anon";

grant update on table "public"."markets" to "anon";

grant delete on table "public"."markets" to "authenticated";

grant insert on table "public"."markets" to "authenticated";

grant references on table "public"."markets" to "authenticated";

grant select on table "public"."markets" to "authenticated";

grant trigger on table "public"."markets" to "authenticated";

grant truncate on table "public"."markets" to "authenticated";

grant update on table "public"."markets" to "authenticated";

grant delete on table "public"."markets" to "postgres";

grant insert on table "public"."markets" to "postgres";

grant references on table "public"."markets" to "postgres";

grant select on table "public"."markets" to "postgres";

grant trigger on table "public"."markets" to "postgres";

grant truncate on table "public"."markets" to "postgres";

grant update on table "public"."markets" to "postgres";

grant delete on table "public"."markets" to "service_role";

grant insert on table "public"."markets" to "service_role";

grant references on table "public"."markets" to "service_role";

grant select on table "public"."markets" to "service_role";

grant trigger on table "public"."markets" to "service_role";

grant truncate on table "public"."markets" to "service_role";

grant update on table "public"."markets" to "service_role";


  create policy "Admins list is viewable by everyone"
  on "public"."admins"
  as permissive
  for select
  to public
using (true);



  create policy "Anyone can add admins"
  on "public"."admins"
  as permissive
  for insert
  to public
with check (true);



  create policy "Anyone can create markets"
  on "public"."markets"
  as permissive
  for insert
  to public
with check (true);



  create policy "Anyone can update markets"
  on "public"."markets"
  as permissive
  for update
  to public
using (true);



  create policy "Markets are viewable by everyone"
  on "public"."markets"
  as permissive
  for select
  to public
using (true);


CREATE TRIGGER update_markets_updated_at BEFORE UPDATE ON public.markets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


