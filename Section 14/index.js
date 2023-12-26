// var tweet = prompt("Type your tweet:");
// var left = 180 - tweet.length;
// console.log("You have written " + tweet.length + " characters, you have " + left + " characters left.");

// var tweet = prompt("Type your tweet: ");
// var cut = tweet.slice(0,140);
// alert(cut);

// var name = prompt("What is your name?");
// var firstChar = name.slice(0,1).toUpperCase();
// var theRestOfTheName = name.slice(1,name.length).toLowerCase();
// alert("Hello " + firstChar + theRestOfTheName + "!");

// dogAge = prompt("What is your dog's age?");
// humanAgeOfDog = ((dogAge - 2) * 4) + 21;
// alert("Your dog's age translated to human's ages is: " + humanAgeOfDog);

// var x = 3;
// var y = x++;
// y;
// y+=1;

// function getMilk() {
//     console.log("Leave house");
//     console.log("Walk to the store");
//     console.log("Arrive at the store");
//     console.log("Buy milk");
//     console.log("Leave the store with milk");
//     console.log("Walk back home");
//     console.log("Arrive back home");
//     console.log("Open the door");
//     console.log("Enter the house");
//     console.log("Close the door");
// }

// getMilk();

    function getMilk(money) {
      var bottles = Math.floor(money / 1.5);
      console.log("leaveHouse");
      console.log("moveRight");
      console.log("moveRight");
      console.log("moveUp");
      console.log("moveUp");
      console.log("moveUp");
      console.log("moveUp");
      console.log("moveRight");
      console.log("moveRight");
      console.log("moveLeft");
      console.log("moveLeft");
      console.log("moveDown");
      console.log("moveDown");
      console.log("moveDown");
      console.log("moveDown");
      console.log("moveLeft");
      console.log("moveLeft");
      console.log("enterHouse with " + bottles + " bottles of milk!");

      return money % 1.5;
    }

bottles = prompt("Give me benji, Master?", 5);
var change = getMilk(bottles);
console.log("This is what is left master: " + change + "$")


// function lifeInWeeks(age, dreamAge) {
//     var leftAge = dreamAge - age;
//     var days = leftAge * 365;
//     var weeks = leftAge * 52;
//     var months = leftAge * 12;
//     console.log("Sir, You have " + days + " days, " + weeks + " weeks, " + months + " months left.");
// }

// var age = prompt("How old are you master?");
// var dreamAge = prompt("At what age of your life do you want to die?");
// lifeInWeeks(age,dreamAge);
