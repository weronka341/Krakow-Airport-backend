-- Procedury zapewniajace poprawnosc dodawania przylotu i odlotu.

-- 1. Numer lotu musi zawierać kod IATA linii lotniczej.

CREATE FUNCTION lotnisko.numerLotuZgodnyZLinia() RETURNS TRIGGER AS $$
    DECLARE
        IATA_linii VARCHAR;
        regex VARCHAR;
    BEGIN
        SELECT INTO IATA_linii l.IATA FROM lotnisko.Linie_lotnicze l JOIN lotnisko.Samoloty s USING(id_linii) WHERE s.id_samolotu = NEW.id_samolotu;
        regex := IATA_linii || '%';        
        IF NOT (NEW.nr_lotu LIKE regex) THEN
            RAISE EXCEPTION 'Podano niepoprawny numer lotu. %', regex USING
            DETAIL = 'Podano niepoprawny numer lotu.',
            HINT = 'Numer lotu musi zawierać kod IATA linii lotniczej.';
            RETURN NULL;
        ELSE
            RETURN NEW;
        END IF;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER _01_numerLotuZgodnyZLinia 
    AFTER INSERT ON lotnisko.Loty 
    FOR EACH ROW EXECUTE PROCEDURE lotnisko.numerLotuZgodnyZLinia();

-- 2. Podane czasy przylotów i odlotów nie mogą być przeszłe - najbliższy lot można dodać na następny dzień.

CREATE FUNCTION lotnisko.nowyLotNieMozeBycPrzeszly() RETURNS TRIGGER AS $$
    DECLARE
        najbliższy_termin timestamp := NOW()::timestamp +  INTERVAL '1 day';
    BEGIN
        IF (NEW.czas_wylotu < najbliższy_termin OR NEW.czas_przylotu < najbliższy_termin) THEN
            RAISE EXCEPTION '' USING
            DETAIL = 'Zbyt mało czasu do zamawianego lotu.',
            HINT = 'Loty należy zamawiać z co najmniej 24-ro godzinnym wyprzedzeniem.';
            RETURN NULL;
        ELSE
            RETURN NEW;
        END IF;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER _02_nowyLotNieMozeBycPrzeszly 
    BEFORE INSERT ON lotnisko.Loty 
    FOR EACH ROW EXECUTE PROCEDURE lotnisko.nowyLotNieMozeBycPrzeszly();


-- 3. Należy sprawdzić czy w podanych czasach przylotu i odlotu będzię dostępny pas startowy (loty na pasie co 15 minut, dwa pasy nr 1 i nr 2).

CREATE FUNCTION lotnisko.czyWolnyPasStartowy() RETURNS TRIGGER AS $$
    DECLARE
        zablokowany_od timestamp;
        zablokowany_do timestamp;
        pas lotnisko.Pasy_startowe%ROWTYPE;
    BEGIN
        IF (NEW.dokad = 0) THEN -- przylot
            zablokowany_od := NEW.czas_przylotu - INTERVAL '14 min';
            zablokowany_do := NEW.czas_przylotu + INTERVAL '14 min';
            FOR pas IN SELECT * FROM lotnisko.Pasy_startowe LOOP
                IF (
                    NOT EXISTS(
                        SELECT * FROM lotnisko.Loty WHERE dokad = 0 AND id_pasu_startowego = pas.id_pasu_startowego AND czas_przylotu BETWEEN zablokowany_od AND zablokowany_do
                        ) 
                    AND 
                    NOT EXISTS(
                        SELECT * FROM lotnisko.Loty WHERE skad = 0 AND id_pasu_startowego = pas.id_pasu_startowego AND czas_wylotu BETWEEN zablokowany_od AND zablokowany_do
                        )
                ) THEN
                    NEW.id_pasu_startowego := pas.id_pasu_startowego;
                    EXIT;
                END IF;
            END LOOP;

            IF (NEW.id_pasu_startowego IS NULL) THEN
                RAISE EXCEPTION 'Wszystkie pasy w proponowanym momencie przylotu są zajęte.' USING 
                DETAIL = 'Wszystkie pasy w proponowanym momencie przylotu są zajęte.',
                HINT = 'Należy zmienić termin przylotu.';
                RETURN NULL;
            ELSE
                RETURN NEW;
            END IF;

        ELSE -- odlot
            zablokowany_od := NEW.czas_wylotu - INTERVAL '14 min';
            zablokowany_do := NEW.czas_wylotu + INTERVAL '14 min';
            FOR pas IN SELECT * FROM lotnisko.Pasy_startowe LOOP
                IF (NOT EXISTS(SELECT * FROM lotnisko.Loty WHERE skad = 0 AND id_pasu_startowego = pas.id_pasu_startowego AND czas_wylotu BETWEEN zablokowany_od AND zablokowany_do) AND NOT EXISTS(SELECT * FROM lotnisko.Loty WHERE dokad = 0 AND id_pasu_startowego = pas.id_pasu_startowego AND czas_przylotu BETWEEN zablokowany_od AND zablokowany_do)) THEN
                    NEW.id_pasu_startowego := pas.id_pasu_startowego;
                    EXIT;
                END IF;
            END LOOP;

            IF (NEW.id_pasu_startowego IS NULL) THEN
                RAISE EXCEPTION 'Wszystkie pasy w proponowanym momencie odlotu są zajęte.' USING 
                DETAIL = 'Wszystkie pasy w proponowanym momencie odlotu są zajęte.',
                HINT = 'Należy zmienić termin odlotu.';
                RETURN NULL;
            ELSE
                RETURN NEW;
            END IF;
            
        END IF;

        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER _03_czyWolnyPasStartowy 
    BEFORE INSERT ON lotnisko.Loty 
    FOR EACH ROW EXECUTE PROCEDURE lotnisko.czyWolnyPasStartowy();

-- 4. Należy podać zarówno przylot samolotu jak i jego odlot z lotniska.

CREATE FUNCTION lotnisko.samolotMusiOdleciec() RETURNS TRIGGER AS $$
    DECLARE
    BEGIN
        IF (NEW.dokad = 0) THEN
            IF NOT EXISTS(SELECT * FROM lotnisko.Loty WHERE id_samolotu = NEW.id_samolotu AND skad = 0 AND id_lotu = (NEW.id_lotu + 1)) THEN
                RAISE EXCEPTION 'Dla wybranego samolotu nie podano przylotu lub odlotu.' USING
                DETAIL = 'Dla wybranego samolotu nie podano przylotu lub odlotu.',
                HINT = 'Należy podać zarówno przylot jak i odlot tego samego samolotu.';
                RETURN NULL;
            END IF;
        END IF;
        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER _04_samolotMusiOdleciec 
    AFTER INSERT ON lotnisko.Loty 
    INITIALLY DEFERRED
    FOR EACH ROW EXECUTE PROCEDURE lotnisko.samolotMusiOdleciec();


-- 5. Należy sprawdzić czy podany samolot nie jest w tym czasie "zajęty", czyli nie odbywają się nim żadne loty z naszego/na nasze            lotisko.
--    Inaczej: nie chcemy, żeby samolot dwa razy pod rzad wylądował lub wystartował.

     DECLARE
         czas_przylotu_samolotu timestamp;
         czas_wylotu_samolotu timestamp;
     BEGIN
         IF (NEW.dokad = 0) THEN

             czas_przylotu_samolotu := NEW.czas_przylotu;
	            SELECT INTO czas_wylotu_samolotu czas_wylotu FROM lotnisko.Loty WHERE id_lotu = (NEW.id_lotu + 1);

             IF (EXISTS(SELECT * FROM lotnisko.Loty WHERE id_samolotu = NEW.id_samolotu AND czas_przylotu <= czas_przylotu_samolotu AND czas_wylotu >= czas_przylotu_samolotu)) THEN
                 RAISE EXCEPTION 'I - samolot dwa razy pod rzad przylatuje.' USING
                 DETAIL = 'Wybrany samolot, w podanym czasie odbywa inny lot.',
                 HINT = 'Należy wybrać inny samolot lub zmienić termin lotów.';
                 RETURN NULL;
             ELSIF (EXISTS(SELECT * FROM lotnisko.Loty WHERE id_samolotu = NEW.id_samolotu AND czas_przylotu >= czas_przylotu_samolotu AND czas_wylotu >= czas_wylotu_samolotu)) THEN
                 RAISE EXCEPTION 'II - dwa razy pod rzad odlatuje' USING
                 DETAIL = 'Wybrany samolot, w podanym czasie odbywa inny lot.',
                 HINT = 'Należy wybrać inny samolot lub zmienić termin lotów.';
                 RETURN NULL;
             END IF;
         END IF;
         RETURN NEW;-     END;
 $$ LANGUAGE plpgsql;

 CREATE CONSTRAINT TRIGGER _05_samolotOdbywaTylkoJedenLotNaraz 
     AFTER INSERT ON lotnisko.Loty 
     INITIALLY DEFERRED
     FOR EACH ROW EXECUTE PROCEDURE lotnisko.samolotOdbywaTylkoJedenLotNaraz();

--6. Należy sprawdzić czy w podanym przeciągu czasu samolot będzie miał miejsce postojowe na lotnisku (dostępne 22 miejsca). 

CREATE FUNCTION lotnisko.czyJestMiejsceNaLotnisku() RETURNS TRIGGER AS $$
    DECLARE
        czas_przylotu_samolotu timestamp;
        czas_wylotu_samolotu timestamp;
        samoloty_ktore_wyladowaly_przed_nami int;
        samoloty_ktore_wyladowaly_po_nas int;
    BEGIN
        IF (NEW.dokad = 0) THEN

            czas_przylotu_samolotu := NEW.czas_przylotu;
            SELECT INTO czas_wylotu_samolotu czas_wylotu FROM lotnisko.Loty WHERE id_lotu = (NEW.id_lotu + 1);
            
            SELECT INTO samoloty_ktore_wyladowaly_przed_nami COUNT(*) FROM lotnisko.Loty WHERE (czas_przylotu < czas_przylotu_samolotu AND czas_wylotu > czas_przylotu_samolotu);

            SELECT INTO samoloty_ktore_wyladowaly_po_nas COUNT(*) FROM lotnisko.Loty WHERE (czas_przylotu BETWEEN czas_przylotu_samolotu AND czas_wylotu_samolotu);

            IF (samoloty_ktore_wyladowaly_przed_nami + samoloty_ktore_wyladowaly_po_nas > 22) THEN
                RAISE EXCEPTION '' USING
                DETAIL = 'W podanym terminie na lotnisku nie ma wolnych miejsc.',
                HINT = 'Należy zmienić termin lotów.';
                RETURN NULL;
            END IF;
        END IF;
        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER _06_czyJestMiejsceNaLotnisku 
    AFTER INSERT ON lotnisko.Loty 
    INITIALLY DEFERRED
    FOR EACH ROW EXECUTE PROCEDURE lotnisko.czyJestMiejsceNaLotnisku();

	
CREATE TYPE lotnisko.Lot AS (
    id_lotu BIGINT, 
    nr_lotu VARCHAR,
    data_przylotu DATE,
    godzina_przylotu TIME,
    data_wylotu DATE,
    godzina_wylotu TIME,
    id_pasu_startowego INT,
    id_samolotu INT,
    model VARCHAR,
    nazwa_samolotu VARCHAR,
    nr_rejestracyjny VARCHAR,
    liczba_miejsc INT,
    id_linii INT,
    nazwa_linii VARCHAR ,
    kierunek VARCHAR ,
    id_lotniska INT,
    nazwa_lotniska VARCHAR
); 

CREATE OR REPLACE FUNCTION lotnisko.zwrocPrzylotLubOdlot(id BIGINT) RETURNS lotnisko.Lot AS $$
    DECLARE
        PrzylotLubOdlot lotnisko.Lot;
    BEGIN
        IF(EXISTS(SELECT * FROM lotnisko.Przyloty_Manager p WHERE p.id_lotu = id)) THEN
            SELECT INTO PrzylotLubOdlot * FROM lotnisko.Przyloty_Manager p WHERE p.id_lotu = id;
        ELSE
            SELECT INTO PrzylotLubOdlot * FROM lotnisko.Odloty_Manager o WHERE o.id_lotu = id;
        END IF;
        RETURN PrzylotLubOdlot;
    END;
$$ LANGUAGE plpgsql; 
