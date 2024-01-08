var buttons = document.querySelectorAll(".drum")

function playSound(instrument) {
    var instrument = new Audio('./sounds/' + instrument + '.mp3')
    instrument.play();
}

for (var i = 0; i < buttons.length; i++) {

    buttons[i].addEventListener("click", function () {
        var buttonInnerHTML = this.innerHTML;
        music(buttonInnerHTML);
        flash(buttonInnerHTML);
    });
}


document.addEventListener("keypress", function(event) {
    music(event.key);
    flash(event.key);
});

function music(key) {

        

        switch (key) {
            case "w":
                playSound("crash");
                break;
            
            case "a":
                playSound("kick_bass");
                break;

            case "s":
                playSound("snare");
                break;
            
            case "d":
                playSound("tom_1");
                break;

            case "j":
                playSound("tom_2");
                break;

            case "k":
                playSound("tom_3");
                break;

            case "l":
                playSound("tom_4");
                break;
        
            default:
                console.log(key);
                break;
        }

    }

var lastNum = 0;

function flash(key) {
    var brightButton = document.querySelector("." + key);

    var num = Math.floor(Math.random()*4);
    console.log(num);
    while (num === lastNum) {
        var num = Math.floor(Math.random()*4);
        console.log(num);
    }

    lastNum = num;

        //clearTimeout(test); 
    if (brightButton) {
        brightButton.style.animation = "flashAnimation" + num + " 2.5s";
        test = setTimeout(function() {
            brightButton.style.animation = "none";
        }, 300);
    }
}
    