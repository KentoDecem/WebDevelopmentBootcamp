// get status of switchButton from storage
let githubButton = JSON.parse(localStorage.getItem('githubButton'));

// get info: if user was on this page or not
var visitedDashboardGithub = localStorage.getItem('visitedDashboardGithub');
var visitedDashboardTwitter = localStorage.getItem('visitedDashboardTwitter');
let visitedGithubTemporary = false
let visitedTwitterTemporary = false

// value for typeWriter effect
var txt_twitter_title = ``;
var txt_twitter_title = '';
var txt_twitter_description = '';
var txt_twitter_description = ``;

// value for get content
let areaTitleGithub = ""
let areaDescriptionGithub = ""
let areaTitleTwitter = ""
let areaDescriptionTwitter = ""


// value for twitter length
let sumLength = 0
let charLimit = 280
let remainingChars = charLimit - sumLength

window.addEventListener('DOMContentLoaded', (event) => {
var waitForJQuery = setInterval(function () {
if (typeof $ != 'undefined') {

// if no status, set to true
if (githubButton == null) {
    githubButton = true
    updateButtonState()
} else {
    // if status, set to that
    updateButtonState()
}


// // script

// clearButton animation
$('.clearButton').click(function() {
    var entryContainer = $(this).parent();
    var entryTitle = entryContainer.find('.entryTitle');
    var entryDescription = entryContainer.find('.entryDescription');
    
    entryTitle.addClass('entryTitle-hidden').delay(500).queue(function() {
        $(this).text('').removeClass('entryTitle-hidden').dequeue();
    });
    entryDescription.addClass('entryDescription-hidden').delay(500).queue(function() {
        $(this).text('').removeClass('entryDescription-hidden').dequeue();
        getContent() // for updating twitter length to zero
    });
});


// Aktualizacja URL
var currentURL = window.location.href;
var newURL = currentURL.replace('/submit-github', '/dashboard').replace('/submit-twitter', '/dashboard'); 

if (newURL !== currentURL) {
    history.pushState(null, '', newURL);
}
    
// prevent multiline Title
$(".entryTitle").on('keydown', (evt) => {
    if (evt.keyCode === 13) {
        evt.preventDefault();
    }
});

// prevent stylization for twitter
$(".entryTwitter div").on('keydown', function(evt) {
    // Check if Ctrl+B, Ctrl+I, or Ctrl+U is pressed
    if ((evt.ctrlKey || evt.metaKey) && (evt.keyCode === 66 || evt.keyCode === 73 || evt.keyCode === 85)) {
        evt.preventDefault();
    }
});

// prevent outside stylization from PASTE
$(".entries div div").on('paste', function(evt) {
    var clipboardData = evt.originalEvent.clipboardData || window.clipboardData;
    var pastedText = clipboardData.getData('text/plain');
    // Usuń formatowanie HTML ze skopiowanego tekstu
    var cleanedText = pastedText.replace(/<[^>]+>/g, '');
    // Wklej czysty tekst
    document.execCommand("insertText", false, cleanedText);
    // Zablokuj domyślne wklejanie
    evt.preventDefault();
});

// // /script


// functionality for switchButtons (Twitter and Github)
function updateButtonState() {
    // Github on
    if(githubButton) {
        // submit to app.post github
        $("#form").attr("action", "/submit-github");

        // switch buttons visually
        $(".githubEntryButton").addClass("entrySwitchActive")
        $(".twitterEntryButton").removeClass("entrySwitchActive")

        // switch content of whole entry
        $(".entryTwitter").stop().fadeOut(250, function() {
        $(".entryGithub").stop().fadeIn(250)
        // change css of title
        $(".entryTitle").removeClass("entryTitleTwitter")
        $("#hrBlue").removeClass("hrTwitter")
        

        // unlock preview button for visibility
        $(".previewButton").show()
        })

    } 
    
    // Twitter on
    else {
        // submit to app.post twitter
        $("#form").attr("action", "/submit-twitter");

        // switch buttons visually
        $(".githubEntryButton").removeClass("entrySwitchActive")
        $(".twitterEntryButton").addClass("entrySwitchActive")

        // switch content of whole entry
        $(".entryGithub").stop().fadeOut(250, function() {
        $(".entryTwitter").stop().fadeIn(250)
        // change css of title
        $(".entryTitle").addClass("entryTitleTwitter")
        $("#hrBlue").addClass("hrTwitter");
        })

        // hide preview button
        $(".previewButton").removeClass("previewButtonVisible")
        $(".previewButton").hide();
    }

    // save the new status of switchButtons
    localStorage.setItem('githubButton', githubButton);
}

// on Twitter click
$(".twitterEntryButton").click(function(){
    githubButton = false;
    updateButtonState();
    twitterCharCounter(sumLength, charLimit)
    welcomer()
});


// on Github click
$(".githubEntryButton").click(function(){
    githubButton = true;
    updateButtonState();
    getContent()
    twitterCharCounter(sumLength, charLimit)
    welcomer()
});



// get content when typing
// document.addEventListener("keyup", function() {
//         getContent();
// });
$(".entryTitle, .entryDescription").on("input", function() {
    getContent();
});

// default forwarding to textarea
getContent();

// pass content to more elastic textarea    
function getContent() {
    console.log("getting content")

    // save innerHTML of Divs
    // make it fit github and twitter style
    areaTitleGithub = githubTitleConverter($(".entryGithub .entryTitle").html());
    areaDescriptionGithub = githubDescriptionConverter($(".entryGithub .entryDescription").html());
    areaTitleTwitter = twitterTitleConverter($(".entryTwitter .entryTitle").html());
    areaDescriptionTwitter = twitterDescriptionConverter($(".entryTwitter .entryDescription").html());

    // pass content to textarea
    document.getElementById("textareaTitleGithub").value = areaTitleGithub
    document.getElementById("textareaDescriptionGithub").value = areaDescriptionGithub
    document.getElementById("textareaTitleTwitter").value = areaTitleTwitter
    document.getElementById("textareaDescriptionTwitter").value = areaDescriptionTwitter

    // Twitter char counter
    sumLength = areaTitleTwitter.length + areaDescriptionTwitter.length
    twitterCharCounter(sumLength, charLimit)

    checkIfGithubEmpty(areaTitleGithub, areaDescriptionGithub)
    entryEmpty(areaTitleGithub, areaDescriptionGithub, areaTitleTwitter, areaDescriptionTwitter)

    // disable submit button if two entries are empty, entryEmpty() are for borders
    if (githubButton && areaTitleGithub == "" && areaDescriptionGithub == "") {
        $(".submitEntryButton").addClass("submitDisabled")
        console.log("disabled")
    } else if (!githubButton && areaTitleTwitter == "" && areaDescriptionTwitter == "") {
        $(".submitEntryButton").addClass("submitDisabled")
        console.log("disabled")
    } else {
        $(".submitEntryButton").removeClass("submitDisabled")
        console.log("enabled")
    }

    //? Testing purpose
    console.log(areaTitleGithub)
    console.log(areaDescriptionGithub)
    console.log(areaTitleTwitter)
    console.log(areaDescriptionTwitter)
    console.log("sumLength: " + sumLength)
}

function updateContent() {
    // update contenteditable divs
    document.querySelector(".entryGithub .entryTitle").innerHTML = areaTitleGithub;
    document.querySelector(".entryGithub .entryDescription").innerHTML = areaDescriptionGithub;
    document.querySelector(".entryTwitter .entryTitle").innerHTML = areaTitleTwitter;
    document.querySelector(".entryTwitter .entryDescription").innerHTML = areaDescriptionTwitter;
}


// add function for preview button
$(".previewButton").click(function() {
    $(this).addClass("previewButtonClicked")
    $(".entryTitle").addClass("entryPreview")
    $(".entryDescription").addClass("entryPreview")
    updateContent();

    setTimeout(function() {
        $(".previewButton").removeClass("previewButtonClicked");
    }, 100);

    setTimeout(function() {
        $(".entryTitle").removeClass("entryPreview")
        $(".entryDescription").removeClass("entryPreview")
    }, 500);
});







// Typing effect when user enter dashboard for first time
function welcomeUserGithub() {

    var i = 0;
    var speed = 15; // Adjust speed as needed

    // Array of available titles
    var titles = [
        'Craft a click-worthy title.',
        'Craft a Github title.'
    ];

    // Array of available descriptions
    var descriptions = [
        `Channel your inner Yoda🐸 and write a description that's both wise and slightly self-deprecating about your learning journey ("Failed I have, but learned much").`,
        'Write a description so good that even your grandma👵🏻 would share it.'
    ];

    // Randomly choose a title
    var randomIndexTitle = Math.floor(Math.random() * titles.length);
    var txt_github_title = titles[randomIndexTitle];

    // Randomly choose a description
    var randomIndexDescription = Math.floor(Math.random() * descriptions.length);
    var txt_github_description = descriptions[randomIndexDescription];

    function appendTitle() {
        if (i < txt_github_title.length) {
            $(".entryGithub .entryTitle").append(txt_github_title.charAt(i));
            i++;
            setTimeout(appendTitle, speed);
        } else {
            // After finishing title, start appending description
            i = 0; // Reset i for description
            appendDescription();
        }
    }

    function appendDescription() {
        if (i < txt_github_description.length) {
            $(".entryGithub .entryDescription").append(txt_github_description.charAt(i));
            i++;
            setTimeout(appendDescription, speed);
        } else {
            console.log("Welcome Githubers");
            setTimeout(() => {
                // Tutaj umieść kod operacji, która ma zostać wykonana po 2 sekundach
                getContent()
            }, 200);
        }
    }

    appendTitle();
    console.log("Welcome Githubers");
    // getContent() Just don't do it my friend!
}

function welcomeUserTwitter() {

    var i = 0;
    var speed = 15; // Adjust speed as needed

    // Array of available titles
    var titles = [
        'Write a title that stops thumbs mid-scroll.',
        'A catchy title for Twitter!'
    ];

    // Array of available descriptions
    var descriptions = [
        `Draft a tweet-length description that captures the essence of your message with a sprinkle of humor ("10/10 would LOL again")😊.`,
        `Come up with a tweetable description that'll make your followers hit that retweet button faster🏎️ than you can say "viral."`
    ];

    // Randomly choose a title
    var randomIndexTitle = Math.floor(Math.random() * titles.length);
    var txt_twitter_title = titles[randomIndexTitle];

    // Randomly choose a description
    var randomIndexDescription = Math.floor(Math.random() * descriptions.length);
    var txt_twitter_description = descriptions[randomIndexDescription];

    function appendTitle() {
        if (i < txt_twitter_title.length) {
            $(".entryTwitter .entryTitle").append(txt_twitter_title.charAt(i));
            i++;
            setTimeout(appendTitle, speed);
        } else {
            // After finishing title, start appending description
            i = 0; // Reset i for description
            appendDescription();
        }
    }

    function appendDescription() {
        if (i < txt_twitter_description.length) {
            $(".entryTwitter .entryDescription").append(txt_twitter_description.charAt(i));
            i++;
            setTimeout(appendDescription, speed);
        } else {
            console.log("Welcome Twitterers");
            setTimeout(() => {
                // Tutaj umieść kod operacji, która ma zostać wykonana po 2 sekundach
                getContent()
            }, 200);
        }
    }

    appendTitle();
    console.log("Welcome Githubers");
}

welcomer()

function welcomer() {
// if user not visited dashboard before, display typing effect content for github
if (!visitedDashboardGithub && githubButton && !visitedGithubTemporary) {
        // Wywołaj funkcję powitalną
        welcomeUserGithub();

        // Ustaw flagę odwiedzenia strony dashboard w localStorage
        localStorage.setItem('visitedDashboardGithub', true);
        visitedGithubTemporary = true
}

// if user not visited dashboard before, display typing effect content for github
if (!visitedDashboardTwitter && !githubButton && !visitedTwitterTemporary) {
    // Wywołaj funkcję powitalną
    welcomeUserTwitter();

    // Ustaw flagę odwiedzenia strony dashboard w localStorage
    localStorage.setItem('visitedDashboardTwitter', true);
    visitedTwitterTemporary = true
}
}


clearInterval(waitForJQuery);
}
}, 10);
});



//* Functions:
// Twitter char counter
function twitterCharCounter(length, limit) {
    if (!githubButton) {
        remainingChars = limit - length
        console.log("remainingChars: " + remainingChars)

        // show counter
        if (length >= 260 && length <= 379) {
            
            $("#charCount").addClass("charCountVisible")
            $("#charCount").fadeIn(1000).text(remainingChars)
        } else {
            $("#charCount").hide()
            $("#charCount").removeClass("charCountVisible")
            // dodaj moze vbox shadow inner do inputa?
        }

        // colors of submit button

        
        if (remainingChars < 0 && remainingChars >= -99) {
            $(".submitEntryButton").addClass("submitRed")
            $("#form").addClass("translateX33")
        } else {
            $(".submitEntryButton").removeClass("submitRed")
            $("#form").removeClass("translateX33")
        }

        if (remainingChars < -9 && remainingChars >= -99) {
            $(".submitEntryButton").addClass("submitRedLonger")
            $("#charCount").addClass("charCountLonger")
            $("#form").addClass("translateX50")
        } else {
            $(".submitEntryButton").removeClass("submitRedLonger")
            $("#charCount").removeClass("charCountLonger")
            $("#form").removeClass("translateX50")
        }

        if (remainingChars < -99) {
            $(".submitEntryButton").addClass("submitRed100")
        } else {
            $(".submitEntryButton").removeClass("submitRed100")
        }

            if (remainingChars >= 0 && remainingChars <= 20) {
            $(".submitEntryButton").addClass("submitYellow")
            $("#form").addClass("translateX33")
        } else {
            $(".submitEntryButton").removeClass("submitYellow")
        }
    } else {
        $("#charCount").removeClass("charCountLonger").hide()
        $(".submitEntryButton").removeClass("submitRed")
        $(".submitEntryButton").removeClass("submitRedLonger")
        $(".submitEntryButton").removeClass("submitRed100")
        $(".submitEntryButton").removeClass("submitYellow")
        $("#form").removeClass("translateX33")
        $("#form").removeClass("translateX50")
    }

}


// If content of github is empty show preview button
function checkIfGithubEmpty(TGithub, DGithub) {
    if(TGithub.length == 0 && DGithub.length == 0) {
        $(".previewButton").removeClass("previewButtonVisible")
    } else {
        $(".previewButton").addClass("previewButtonVisible")
    }
}




// If content is empty show contenteditable border
function entryEmpty(titleGithub, descriptionGithub, titleTwitter, descriptionTwitter) {
    if (isWhitespace(titleGithub)) {
        $(".entryGithub .entryTitle").addClass("entryEmpty");
    } else {
        $(".entryGithub .entryTitle").removeClass("entryEmpty");
    }

    if (isWhitespace(descriptionGithub)) {
        $(".entryGithub .entryDescription").addClass("entryEmpty");
    } else {
        $(".entryGithub .entryDescription").removeClass("entryEmpty");
    }

    if (isWhitespace(titleTwitter)) {
        $(".entryTwitter .entryTitle").addClass("entryEmpty");
    } else {
        $(".entryTwitter .entryTitle").removeClass("entryEmpty");
    }

    if (isWhitespace(descriptionTwitter)) {
        $(".entryTwitter .entryDescription").addClass("entryEmpty");
    } else {
        $(".entryTwitter .entryDescription").removeClass("entryEmpty");
    }
}

function isWhitespace(element) {
    // Usuwamy białe znaki z początku i końca tekstu
    var text = element.trim();
    // Sprawdzamy, czy po usunięciu białych znaków długość tekstu wynosi zero
    return /^(\s|<[^>]*>)*$/.test(text);
}




// Functions for text styling
function githubTitleConverter(areaTitleGithub) {
    // divs to new lines
    areaTitleGithub = areaTitleGithub.replace(/<div>/g, '<br>\n').replace(/<\/div>/g, '');

    // if br than replace to <br>\n
    areaTitleGithub = areaTitleGithub.replace(/<br>(<b[^>]*>)?(<i[^>]*>)?(<u[^>]*>)?- /g, '\n$1$2$3- ');

    // replace - to li
    areaTitleGithub = areaTitleGithub.replace(/^(<b[^>]*>)?(<i[^>]*>)?(<u[^>]*>)?- (.+?)($|<br>)/gm, '<li>$1$2$3$4</li>');

    // check if br is in the first line and delete it if li is in the second one
    areaTitleGithub = areaTitleGithub.replace(/<br>\n<li>/, '\n<li>');

    // replace nbsp with space
    areaTitleGithub = areaTitleGithub.replace(/&nbsp;/g, " ");

    // Add functionality to wrap multiple li elements in ul tags
    areaTitleGithub = addUlTags(areaTitleGithub);


    return areaTitleGithub
}
function githubDescriptionConverter(areaDescriptionGithub) {
    // divs to new lines
    areaDescriptionGithub = areaDescriptionGithub.replace(/<div>/g, '<br>\n').replace(/<\/div>/g, '');

    // if br than replace to <br>\n
    areaDescriptionGithub = areaDescriptionGithub.replace(/<br>(<b[^>]*>)?(<i[^>]*>)?(<u[^>]*>)?- /g, '\n$1$2$3- ');

    // replace - to li
    areaDescriptionGithub = areaDescriptionGithub.replace(/^(<b[^>]*>)?(<i[^>]*>)?(<u[^>]*>)?- (.+?)($|<br>)/gm, '<li>$1$2$3$4</li>');

    // check if br is in the first line and delete it if li is in the second one
    areaDescriptionGithub = areaDescriptionGithub.replace(/<br>\n<li>/, '\n<li>');

    // replace nbsp with space
    areaDescriptionGithub = areaDescriptionGithub.replace(/&nbsp;/g, " ");

    // Add functionality to wrap multiple li elements in ul tags
    areaDescriptionGithub = addUlTags(areaDescriptionGithub);


    return areaDescriptionGithub
}
function addUlTags(htmlString) {
    // Regular expression to match multiple li elements
    const liPattern = /(<li>.*?<\/li>\s*)+/g;

    // Check if the htmlString contains multiple li elements
    if (htmlString.match(liPattern)) {
        // Check if ul already exists in the string
        if (!htmlString.includes('<ul>')) {
            // Wrap the matched li elements with ul tags
            htmlString = htmlString.replace(liPattern, '<ul>$&</ul>');
        }
    }
    return htmlString;
} 

function twitterTitleConverter(areaTitleTwitter) {
    // Replace HTML tags and &nbsp; with spaces for titleTwitter
    areaTitleTwitter = areaTitleTwitter.replace(/<.*?>/g, "");
    areaTitleTwitter = areaTitleTwitter.replace(/&nbsp;/g, " ");
    areaTitleTwitter = areaTitleTwitter.replace(/&amp;/g, "&");

    return areaTitleTwitter
}
function twitterDescriptionConverter(areaDescriptionTwitter) {
    // Replace HTML tags, <div>, and <br> with new lines, and &nbsp; with spaces for descriptionTwitter
    areaDescriptionTwitter = areaDescriptionTwitter.replace(/<div>/g, "\n");
    areaDescriptionTwitter = areaDescriptionTwitter.replace(/<br>/g, "\n");
    areaDescriptionTwitter = areaDescriptionTwitter.replace(/<.*?>/g, "");
    areaDescriptionTwitter = areaDescriptionTwitter.replace(/&nbsp;/g, " ");
    areaDescriptionTwitter = areaDescriptionTwitter.replace(/&amp;/g, "&");
    return areaDescriptionTwitter
}
