import Array "mo:base/Array";
import Text "mo:base/Text";
import Float "mo:base/Float";
import Time "mo:base/Time";

actor {
  type Deposit = {
    address: Text;
    amount: Float;
    timestamp: Int;
  };

  var deposits : [Deposit] = [];

  public func registerKCALDeposit(address : Text, amount : Float) : async Bool {
    let newDeposit : Deposit = {
      address = address;
      amount = amount;
      timestamp = Time.now();
    };
    deposits := Array.append(deposits, [newDeposit]);
    return true;
  };

  public query func getDeposits() : async [Deposit] {
    return deposits;
  };

  public query func greet(name : Text) : async Text {
    return "Hello, " # name # "!";
  };
};