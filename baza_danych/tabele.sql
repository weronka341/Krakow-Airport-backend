CREATE TABLE lotnisko.Lotniska (

                id_lotniska INTEGER NOT NULL DEFAULT nextval('lotnisko.lotnisko_id_seq'),
                nazwa VARCHAR NOT NULL UNIQUE,
                miasto VARCHAR NOT NULL,
                kraj VARCHAR NOT NULL,
                IATA lotnisko.IATA_lotnisko,
                ICAO lotnisko.ICAO_lotnisko,
                szer_geograficzna DECIMAL(9,6) NOT NULL,
                dl_geograficzna DECIMAL(9,6) NOT NULL,
                strefa_czasowa VARCHAR NOT NULL,
                PRIMARY KEY (id_lotniska)
);

CREATE TABLE lotnisko.Managerowie (
                id_managera int,
                haslo varchar(120),
                PRIMARY KEY (id_managera)
);


CREATE TABLE lotnisko.Linie_lotnicze (

                id_linii INTEGER NOT NULL DEFAULT nextval('lotnisko.linia_id_seq'),
                nazwa VARCHAR NOT NULL UNIQUE,
                IATA lotnisko.IATA_linia,
                ICAO lotnisko.ICAO_linia,
                znak_wywolawczy VARCHAR,
                kraj VARCHAR NOT NULL,
                PRIMARY KEY (id_linii)
);

CREATE TABLE lotnisko.Samoloty (

                id_samolotu INTEGER NOT NULL DEFAULT nextval('lotnisko.samolot_id_seq'),
                id_linii INTEGER NOT NULL,
                model VARCHAR NOT NULL,
                nazwa VARCHAR NOT NULL,
                nr_rejestracyjny lotnisko.rejestracja UNIQUE,
                liczba_miejsc INTEGER NOT NULL,
                masa_startowa INTEGER NOT NULL,
                PRIMARY KEY (id_samolotu),
                FOREIGN KEY (id_linii) REFERENCES lotnisko.Linie_lotnicze (id_linii) ON DELETE CASCADE
);

CREATE TABLE lotnisko.Pasy_startowe (
                id_pasu_startowego INTEGER NOT NULL DEFAULT nextval('lotnisko.pas_id_seq'), 
                dlugosc INTEGER NOT NULL,
                szerokosc INTEGER NOT NULL,
                kategoria VARCHAR NOT NULL,
                PRIMARY KEY (id_pasu_startowego)
);

CREATE TABLE lotnisko.Loty (

                id_lotu BIGINT NOT NULL DEFAULT nextval('lotnisko.lot_id_seq'),
                id_samolotu INTEGER NOT NULL,
                nr_lotu VARCHAR NOT NULL,
                czas_wylotu TIMESTAMP NOT NULL,
                czas_przylotu TIMESTAMP NOT NULL,
                id_pasu_startowego INTEGER,
                skad INTEGER NOT NULL,
                dokad INTEGER NOT NULL,

                PRIMARY KEY (id_lotu),
                FOREIGN KEY (id_pasu_startowego) REFERENCES lotnisko.Pasy_startowe (id_pasu_startowego) ON DELETE CASCADE,
                FOREIGN KEY (skad) REFERENCES lotnisko.Lotniska (id_lotniska) ON DELETE CASCADE,
                FOREIGN KEY (dokad) REFERENCES lotnisko.Lotniska (id_lotniska) ON DELETE CASCADE
);


