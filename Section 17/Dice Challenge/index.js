var h1 = document.querySelector("h1");
var img1 = document.querySelector(".img1");
var img2 = document.querySelector(".img2");


function throwTheDice() {
    var randomNumber1 = Math.floor(Math.random() * 6) + 1;
    var randomNumber2 = Math.floor(Math.random() * 6) + 1;

    var dice_number = "./images/dice" + randomNumber1 + ".png";
    var dice_number2 = "./images/dice" + randomNumber2 + ".png";

    img1.setAttribute("src", dice_number);
    img2.setAttribute("src", dice_number2);

    img1.classList.add("animate");
    img2.classList.add("animate");



    if (randomNumber1 > randomNumber2) {
        h1.textContent = "Player 1 Wins!";
        img1.classList.add("green");
        img2.classList.remove("green");
        img1.classList.remove("blue");
        img2.classList.remove("blue");

    }
    else if (randomNumber1 < randomNumber2) {
        h1.textContent = "Player 2 Wins!";
        img2.classList.add("green");
        img1.classList.remove("green");
        img1.classList.remove("blue");
        img2.classList.remove("blue");
    }
    else {
        h1.textContent = "Draw!";
        img1.classList.add("blue");
        img2.classList.add("blue");
    }

    setTimeout(function() {
        img1.classList.remove("animate");
        img2.classList.remove("animate");
    }, 500);
}

