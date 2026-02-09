-- Seed super_admin wallet
INSERT INTO public.admins (wallet_address, role)
VALUES ('aleo1awc7l4v56ahsjyj29g4fe3f8ps4w3akzy305vymlzm3exawgvypqk78elv', 'super_admin')
ON CONFLICT (wallet_address) DO UPDATE SET role = 'super_admin';
