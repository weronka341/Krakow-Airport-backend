-- Oplaty

CREATE VIEW lotnisko.Samoloty_na_lotnisku AS 
    SELECT
    linia.id_linii,
    linia.nazwa AS nazwa_linii,
    samolot.id_samolotu,
    samolot.liczba_miejsc,
    samolot.model,
    samolot.masa_startowa,
    lot.czas_przylotu AS przylot,
    (SELECT MIN(czas_wylotu) FROM lotnisko.Loty WHERE id_samolotu = samolot.id_samolotu AND czas_wylotu > lot.czas_przylotu) as wylot
    FROM lotnisko.Loty lot
    JOIN lotnisko.Samoloty samolot USING (id_samolotu)
    JOIN lotnisko.Linie_lotnicze linia USING (id_linii)
    WHERE dokad = 0;


CREATE VIEW lotnisko.Oplaty AS 
    SELECT 
    extract(year from snl.przylot) AS rok,
    extract(month from snl.przylot) AS miesiac,
    snl.nazwa_linii,
    snl.id_linii,
    COUNT(snl.id_samolotu) AS liczba_samolotow,
    SUM(snl.masa_startowa) AS laczna_masa_startowa_kg, -- laczna masa startowa w kg wszytkich samolotow danej linii ladujacych i startujacych z lotniska
    SUM(snl.liczba_miejsc) * 2 AS liczba_pasazerow,
    COUNT(snl.przylot) + COUNT(snl.wylot ) AS liczba_lotow,
    SUM(snl.wylot - snl.przylot) AS czas_na_lotnisku,
    ((extract(hour from SUM(snl.wylot - snl.przylot)) * 60) + extract(minute from SUM(snl.wylot - snl.przylot))) AS minuty_na_lotnisku,
    ((35 *  SUM(snl.liczba_miejsc) * 2) + (32 * SUM(snl.masa_startowa)/1000 * (COUNT(snl.przylot) + COUNT(snl.wylot))) + (0.5 * ((extract(hour from SUM(snl.wylot - snl.przylot)) * 60) + extract(minute from SUM(snl.wylot - snl.przylot))))) AS saldo
    FROM lotnisko.Samoloty_na_lotnisku snl
    GROUP BY (extract(month from snl.przylot), extract(year from snl.przylot), snl.nazwa_linii, snl.id_linii)
    ORDER BY rok, miesiac;


