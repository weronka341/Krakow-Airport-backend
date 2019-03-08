-- widoki 

-- Przyloty
CREATE VIEW lotnisko.Przyloty_Manager AS 
    SELECT 
    lot.id_lotu, 
    lot.nr_lotu,
    DATE(lot.czas_przylotu) AS data_przylotu,
    CAST(lot.czas_przylotu AS TIME) AS godzina_przylotu,
    DATE(lot.czas_wylotu) AS data_wylotu,
    CAST(lot.czas_wylotu AS TIME) AS godzina_wylotu,
    lot.id_pasu_startowego,
    samolot.id_samolotu,
    samolot.model,
    samolot.nazwa AS nazwa_samolotu,
    samolot.nr_rejestracyjny,
    samolot.liczba_miejsc,
    linia.id_linii,
    linia.nazwa AS nazwa_linii,
    kierunek.miasto AS kierunek,
    kierunek.id_lotniska AS id_lotniska,
    kierunek.nazwa AS nazwa_lotniska
    FROM lotnisko.Loty lot
    JOIN lotnisko.Samoloty samolot USING (id_samolotu)
    JOIN lotnisko.Linie_lotnicze linia USING (id_linii)
    JOIN lotnisko.Lotniska kierunek ON lot.skad = kierunek.id_lotniska
    WHERE lot.dokad = 0;


CREATE VIEW lotnisko.Przyloty_Uzytkownicy AS
    SELECT 
    lot.id_lotu, 
    lot.nr_lotu,
    CAST(lot.czas_przylotu AS DATE) AS data_przylotu,
    CAST(lot.czas_przylotu AS TIME) AS godzina_przylotu,
    CAST(lot.czas_wylotu AS DATE) AS data_wylotu,
    CAST(lot.czas_wylotu AS TIME) AS godzina_wylotu,
    lot.skad,
    samolot.id_samolotu,
    samolot.model,
    samolot.nazwa AS nazwa_samolotu,
    linia.id_linii,
    linia.nazwa AS nazwa_linii
    FROM lotnisko.Loty lot
    JOIN lotnisko.Samoloty samolot USING (id_samolotu)
    JOIN lotnisko.Linie_lotnicze linia USING (id_linii)
    WHERE lot.dokad = 0;


-- Odloty
CREATE VIEW lotnisko.Odloty_Manager AS 
    SELECT 
    lot.id_lotu, 
    lot.nr_lotu,
    CAST(lot.czas_przylotu AS DATE) AS data_przylotu,
    CAST(lot.czas_przylotu AS TIME) AS godzina_przylotu,
    CAST(lot.czas_wylotu AS DATE) AS data_wylotu,
    CAST(lot.czas_wylotu AS TIME) AS godzina_wylotu,
    lot.id_pasu_startowego,
    samolot.id_samolotu,
    samolot.model,
    samolot.nazwa AS nazwa_samolotu,
    samolot.nr_rejestracyjny,
    samolot.liczba_miejsc,
    linia.id_linii,
    linia.nazwa AS nazwa_linii,
    kierunek.miasto AS kierunek,
    kierunek.id_lotniska AS id_lotniska,
    kierunek.nazwa AS nazwa_lotniska
    FROM lotnisko.Loty lot
    JOIN lotnisko.Samoloty samolot USING (id_samolotu)
    JOIN lotnisko.Linie_lotnicze linia USING (id_linii)
    JOIN lotnisko.Lotniska kierunek ON lot.dokad = kierunek.id_lotniska
    WHERE lot.skad = 0;


CREATE VIEW lotnisko.Odloty_Uzytkownicy AS 
    SELECT 
    lot.id_lotu, 
    lot.nr_lotu,
    CAST(lot.czas_przylotu AS DATE) AS data_przylotu,
    CAST(lot.czas_przylotu AS TIME) AS godzina_przylotu,
    CAST(lot.czas_wylotu AS DATE) AS data_wylotu,
    CAST(lot.czas_wylotu AS TIME) AS godzina_wylotu,
    lot.dokad,
    samolot.id_samolotu,
    samolot.model,
    samolot.nazwa AS nazwa_samolotu,
    linia.id_linii,
    linia.nazwa AS nazwa_linii
    FROM lotnisko.Loty lot
    JOIN lotnisko.Samoloty samolot USING (id_samolotu)
    JOIN lotnisko.Linie_lotnicze linia USING (id_linii)
    WHERE lot.skad = 0 AND lot.czas_wylotu >= NOW()::timestamp;
