CREATE DOMAIN lotnisko.rejestracja AS varchar(6) NOT NULL CHECK (VALUE ~ '^[A-Z0-9]{1,2}-[A-Z0-9]{3,4}$');

CREATE DOMAIN lotnisko.IATA_lotnisko AS varchar(3) NOT NULL CHECK (VALUE ~ '^[A-Z0-9]{3}$');

CREATE DOMAIN lotnisko.ICAO_lotnisko AS varchar(4) NOT NULL CHECK (VALUE ~ '^[A-Z0-9]{4}$');

CREATE DOMAIN lotnisko.IATA_linia AS varchar(2) NOT NULL CHECK (VALUE ~ '^[A-Z0-9]{2}$');

CREATE DOMAIN lotnisko.ICAO_linia AS varchar(3) NOT NULL CHECK (VALUE ~ '^[A-Z0-9]{3}$');