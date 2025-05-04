-- migracja: dodaje kolumnę status do tabeli generations
-- opis: dodaje kolumnę status typu varchar(50) z wartością domyślną 'pending' oraz check constraint sprawdzający, czy wartość jest 'pending' lub 'completed'
-- data: 2023-10-30 12:30:45 utc

alter table generations add column status varchar(50) not null default 'pending' check (status in ('pending', 'completed')); 