-- add to quantity when owner places an order
CREATE OR REPLACE FUNCTION increaseBookStock() 
RETURNS TRIGGER
AS $$
BEGIN

  UPDATE Book
  SET stock = stock + New.quantity
  WHERE ISBN = NEW.ISBN;
  
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER updateStockOrderedBooks
  AFTER INSERT
  ON orderedBooks
  FOR EACH ROW
  EXECUTE PROCEDURE increaseBookStock();


-- catch all trigger for triggers

  CREATE OR REPLACE FUNCTION modifyBookStock()
  RETURNS TRIGGER
  AS $$
  BEGIN
    IF (TG_OP = 'INSERT') THEN
      UPDATE Book
      SET stock = stock - New.quantity
      WHERE ISBN = NEW.ISBN;
      return NEW;
    ELSIF (TG_OP = 'DELETE') THEN
      UPDATE Book
      SET stock = stock + OLD.quantity
      WHERE ISBN = OLD.ISBN;
      return OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
      UPDATE Book
      SET stock = stock + (OLD.quantity - New.quantity)
      WHERE ISBN = NEW.ISBN;
      return NEW;
    END IF;
    RETURN NULL; -- result is ignored since this is an AFTER trigger
  END
  $$ LANGUAGE plpgsql;

CREATE TRIGGER StockSoldBooks
    AFTER UPDATE or DELETE or INSERT
    ON SoldBooks
    FOR EACH ROW
    EXECUTE PROCEDURE modifyBookStock();

-- order more books if book stock falls below 10
CREATE OR REPLACE FUNCTION createStoreOrder() 
RETURNS TRIGGER
AS $$
declare o_id int;
BEGIN
  IF (NEW.stock <= 9) THEN
  INSERT into StoreOrder(ownerID) VALUES(null) RETURNING orderid into o_id;
  INSERT INTO orderedBooks(quantity, orderID, ISBN) VALUES(10, o_id, NEW.ISBN);
  RETURN NEW;
  END IF;
  Return NEW;
END
$$ LANGUAGE plpgsql;


CREATE TRIGGER orderBooksBelowThreshold
  AFTER update
  ON Book
  FOR EACH ROW
  EXECUTE PROCEDURE createStoreOrder();