var gamePattern = ["basic"]
var userClickedPattern = []
var buttonColours = ["red", "blue", "green", "yellow"]
const colors = [green, red, blue, yellow];
var gameStart = false;
var level = 1;
var originalHeaderText = $("h1").text();

function resetGame() {
    gamePattern = ["basic"];
    userClickedPattern = ["basic"];
    gameStart = false;
    level = 1;
    $("h1").text("Game Over! " + originalHeaderText);
    intro();
}

function gameSound(chosenColour) {
    var audio = new Audio("./sounds/" + chosenColour + ".mp3")
    audio.play();
}

function animationPhysics(item) {
    item
    .animate({opacity: 0, borderWidth: "12px", height: 215, width: 185}, 110)
    .animate({opacity: 1, borderWidth: "10px", height: 200, width: 200}, 110)
    .animate({opacity: 0, borderWidth: "13px", height: 185, width: 215}, 110)
    .animate({opacity: 1, borderWidth: "10px", height: 200, width: 200}, 110);
}

function animatePress(colour) { 
    var self= $("." + colour)
    
    self.addClass("pressed");
    self.removeClass("unpressed");



    setTimeout(function(){
        self.addClass("unpressed");
        self.removeClass("pressed");
    }, 150);

    animationPhysics(self);
}

function nextSequence() {

    userClickedPattern = ["basic"]
    $("h1").text("level " + level);
 
    var randomNumber = Math.floor(Math.random() * 4);
    var randomChosenColour = buttonColours[randomNumber];
    gamePattern.push(randomChosenColour);

    setTimeout(function() {


        for (let i = 1; i < gamePattern.length; i++) {
            (function (index) {
                setTimeout(function () {
                    animationPhysics($("#" + gamePattern[index]));
                    gameSound(gamePattern[index]);
                }, 600 * index);
            })(i);
        }

    },500);
    console.log(randomChosenColour);
    console.log("game " + gamePattern);
};

function userClick() {
    $(".btn").off("click").click(function () {
        var userChosenColour = this.id;
        

        gameSound(userChosenColour);
        animatePress(userChosenColour);
        

        if (gameStart) {
            userClickedPattern.push(userChosenColour);
            console.log("user " + userClickedPattern);


            if (userClickedPattern.length >= gamePattern.length) {
                if (JSON.stringify(userClickedPattern) === JSON.stringify(gamePattern)) {
                    console.log("level up");
                    level++;
                    nextSequence();
                    $("body").removeClass("after-victory");
                    $("body").addClass("victory");

                        // Remove the "victory" class after 500 milliseconds (0.5 seconds)
                    setTimeout(function () {
                        $("body").addClass("after-victory");
                        $("body").removeClass("victory");
                    }, 500);

                        if (level===5) {
                            console.log("yooo Good Job!!!!!!!!!!")
                        }
                }
                else {
                    console.log("Game Over");
                    $("body").removeClass("after-victory");
                    $("body").addClass("game-over");
                    gameSound("wrong");

                    readyToStartGame();
                    setTimeout(function () {
                        $("body").addClass("after-victory");
                        $("body").removeClass("game-over");
                        
                        resetGame();
                        
                        //end of game
                    }, 500);
                    
                }
            }

            
        }
    });
}

// Starting of the Game
var green = $("#green");
var red = $("#red");
var blue = $("#blue");
var yellow = $("#yellow");

function intro() {

    if (gameStart===true) {
        return
    }

    function oneSequence() {
        if (gameStart) {
            clearInterval(timer);
            return;
        }
        green.addClass("leftAnimation");
        green.css("left", "271px");
        
        red.addClass("topAnimation");
        red.css("top", "271px");

        blue.addClass("rightAnimationBlue");
        blue.css("right", "271px");

        yellow.addClass("bottomAnimationYellow2");
        yellow.css("top", "-271px");
    
        setTimeout(function() {
            if (gameStart) {
                clearInterval(timer);
                return;
            }
            green.addClass("topAnimation");
            green.css("top", "271px")

            red.addClass("rightAnimationBlue");
            red.css("right", "271px")

            blue.addClass("bottomAnimationYellow");
            blue.css("bottom", "271px");

            yellow.addClass("leftAnimationYellow");
            yellow.css("left", "271px")
        },1000);

        setTimeout(function() {
            if (gameStart) {
                clearInterval(timer);
                return;
            }
            green.addClass("rightAnimation");
            green.css("left", "0px")

            red.addClass("bottomAnimation");
            red.css("top", "0px")

            blue.removeClass("rightAnimationBlue")

            blue.addClass("leftAnimation");
            blue.css("right", "0px")

            yellow.addClass("bottomAnimation3");
            yellow.css("top", "0px")
        },2000);

        setTimeout(function() {
            if (gameStart) {
                clearInterval(timer);
                return;
            }
            green.addClass("bottomAnimation");
            green.css("top", "0px")

            red.addClass("leftAnimationRed");
            red.css("right", "0px")

            blue.addClass("bottomAnimationBlue");
            blue.css("bottom", "0px")

            yellow.addClass("leftAnimationRed");
            yellow.css("left", "0px")
        },3000);

        setTimeout(function() {
            if (gameStart) {
                clearInterval(timer);
                return;
            }

            green.removeClass("leftAnimation");
            green.removeClass("topAnimation");
            green.removeClass("rightAnimation");
            green.removeClass("bottomAnimation");

            red.removeClass("topAnimation");
            red.removeClass("rightAnimationBlue");
            red.removeClass("bottomAnimation");
            red.removeClass("leftAnimationRed");

            blue.removeClass("rightAnimationBlue");
            blue.removeClass("bottomAnimationYellow");
            blue.removeClass("bottomAnimationBlue");

            yellow.removeClass("bottomAnimationYellow");
            yellow.removeClass("leftAnimationYellow");
            yellow.removeClass("bottomAnimation3");
            yellow.removeClass("leftAnimationRed");
        }, 3950)
    }

    oneSequence();

    timer = setInterval(oneSequence, 4000);

}

function readyToStartGame() {
    $(document).off("keypress").keypress(function () {
        clearInterval(timer);
        gameStart = true;
        console.log("ayeh!");
        $(document).off("keypress");

        nextSequence();
        userClick();
        intro();
    });
}



userClick();
intro();
readyToStartGame();