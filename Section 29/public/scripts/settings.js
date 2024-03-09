window.addEventListener('DOMContentLoaded', (event) => {
var waitForJQuery = setInterval(function () {
if (typeof $ != 'undefined') {


// Slider 
var isDragging = false;
var startY, startTop;

$('.slider').on('mousedown', function(e) {
    isDragging = true;
    startY = e.clientY;
    startTop = parseInt($('.settings').css('top'));
});

$(document).on('mouseup', function() {
    if (isDragging) {
        isDragging = false;
        // Sprawdzenie, czy .settings jest bliżej górnego (0px) czy dolnego (-273px) ograniczenia
        var currentTop = parseInt($('.settings').css('top'));
        var newTop;
        if (currentTop >= -1 && currentTop <= 0) {
            newTop = -273;
        } else if (currentTop >= -273 && currentTop <= -272) {
            newTop = 0;
        } else if (currentTop <= -274) {
            newTop = -273;
        } else if (currentTop >= 1) {
            newTop = 0;
        }
        
        else {
            newTop = currentTop > -137 ? 0 : -273;
        }
        $('.settings').animate({ top: newTop + 'px' }, 'fast');

        if ($('.settings').css('position') === 'relative') {
            $('.input').animate({ top: newTop + 'px' }, 'fast');
            $('.input').animate({ marginBottom: newTop/1.3 + 40 + 'px' }, 'fast');
            $('#movable').animate({ marginBottom: newTop/1.3 + 40 + 'px' }, 'fast');
            $('#movable').animate({ top: newTop + 'px' }, 'fast');
        }
    }
});

$(document).on('mousemove', function(e) {
    if (isDragging) {
        var deltaY = e.clientY - startY;
        var newTop = startTop + deltaY;
        // Ograniczenie przesunięcia .settings między 0px a -273px
        newTop = Math.min(1, Math.max(-274, newTop));
        $('.settings').css('top', newTop + 'px');

        if ($('.settings').css('position') === 'relative') {
            $('.input').css('top', newTop + 'px');
            $('.input').css('marginBottom', newTop/1.3 + 40 + 'px');
            $('#movable').css('top', newTop + 'px');
            $('#movable').css('marginBottom', newTop/1.3 + 40 + 'px');
        }
    }
});

$(window).on('resize', function() {
    if ($(window).width() > 1100) {
        $('.input').css('marginBottom', 50 + 'px');
        $('.input').css('top', 0 + 'px');
        $('#movable').css('marginBottom', 50 + 'px');
        $('#movable').css('top', 0 + 'px');
    }
});

updateEnteredH3();
// checkTwitterLogin();

// If keys already provided then automatically login
setTimeout(function() {
    
// Find all elements with class .enteredH3 inside .settingsAPIs h3 and create an array from them
var enteredH3Array = $('.settingsAPIs h3.enteredH3').map(function() {
    return $(this).text(); // Return the text content of each found element
}).get();

console.log(enteredH3Array); // Display the array in the console

// Check if required APIs are present for Twitter
var requiredTwitterAPIs = ['API_KEY', 'API_SECRET', 'ACCESS_TOKEN', 'ACCESS_SECRET'];
var foundTwitterAPIs = enteredH3Array.filter(api => requiredTwitterAPIs.includes(api));

// If all required APIs are found for Twitter, check the ".twitterProfile .profileUser a" element
if (foundTwitterAPIs.length === requiredTwitterAPIs.length) {
    // If the text inside ".twitterProfile .profileUser a" is 'No Profile Found', execute checkTwitterLogin()
    if ($('.twitterProfile .profileUser a').text().trim() === 'No Profile Found') {
        checkTwitterLogin();
    }
}

// Check if required APIs are present for GitHub
var requiredGithubAPIs = ['PERSONAL_TOKEN', 'REPOSITORY', 'DIRECTORY'];
var foundGithubAPIs = enteredH3Array.filter(api => requiredGithubAPIs.includes(api));

// If all required APIs are found for GitHub, check the ".githubProfile .profileUsername a" element
if (foundGithubAPIs.length === requiredGithubAPIs.length) {
    // If the text inside ".githubProfile .profileUsername a" is 'No Profile Found', execute checkGithubLogin()
    if ($('.githubProfile .profileUsername a').text().trim() === 'No Profile Found') {
        checkGithubLogin();
    }
}

}, 100);

//* functionality of radio buttons
$(".settingsAPIs h3").on("click", function() {

    // unselect h3 elements
    $(".settingsAPIs h3").removeClass("selectedH3"); 
    // select current h3
    $(this).addClass("selectedH3");

    // get name (API_KEY, API_SECRET, ACCESS_TOKEN, ACCESS_SECRET)
    let key_name = $(this).text();
    console.log(key_name)


    // enable submit button
    $(".key-input-submit-check").removeClass("checkDisabled");

    // focus on input
    $(".key-input-text input").focus();

    // show input
    $(".key-input-text input").slideUp(300, function() {
        // get key_entry if exists
        $.get("/key/" + key_name, function(data) {
            $(".key-input-text input").val(data);
        })
    }); 
    $(".key-input-text input").slideDown(400); 


    //* functionality of submit button 🖲️
    $(".key-input-submit-check").off("click").on("click", function() {
        submit(key_name)
    })

    // when user is on input and clicked enter
    $(".key-input-text input").off("keyup").keyup(function(e) {
        if (e.which === 13) {
            submit(key_name)
        }
    })

})

$(".twitterKeys .settingsTitle").on("click", function() {
    checkTwitterLogin();
})

$(".githubKeys .settingsTitle").on("click", function() {
    checkGithubLogin();
})


$(".upload").on("click", function() {
    $("#fileInput").click();
})
$("#fileInput").on("change", function() {
    // Create a FormData object to send the file
    const formData = new FormData();
    // Append the file to FormData object
    formData.append('file', $('#fileInput')[0].files[0]);

    // Send a POST request to the server
    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(data => {
        console.log(data); // Log the server response
        updateEnteredH3()
    })
    .catch(error => {
        console.error('Error uploading file:', error); // Log any errors
    });
})

$(".download").on("click", function() {
    console.log("DOWNLOAD")
    window.location.href = "/download";
})





clearInterval(waitForJQuery);
}
}, 10);
});

function updateEnteredH3() {
    // Usuń klasę enteredH3 ze wszystkich elementów h3
    $('.settingsAPIs h3').removeClass('enteredH3');

    // Wykonaj zapytanie GET do /entered-keys endpoint, aby pobrać aktualną listę kluczy
    $.get("/entered-keys", function(data) {
        // Przejdź przez otrzymane klucze
        data.forEach(function(key) {
            // Dodaj klasę enteredH3 do odpowiedniego elementu h3
            $('.settingsAPIs h3:contains("' + key + '")').addClass('enteredH3');
        });
    });
}

function submit(key_name) {       
    // save input entry
    let key_entry = $(".key-input-text input").val();

    // post request
    $.post("/key", {key_name: key_name, key_entry: key_entry}, function(data) {
        console.log(data)
    })


    // unselect h3 elements
    $(".settingsAPIs h3").removeClass("selectedH3");
    // hide input
    $(".key-input-text input").slideUp(300);
    // disable submit button
    $(".key-input-submit-check").addClass("checkClicked");
    setTimeout(() => {
        $(".key-input-text input").val("");
        $(".key-input-submit-check").removeClass("checkClicked");
        $(".key-input-submit-check").addClass("checkDisabled");
        updateEnteredH3()
    }, 300);
}

function updateTwitterProfile(profileName, profilePicture) {
    $(".twitterProfile .profileUser a").fadeOut(200, function() {
        $(this).text(profileName).fadeIn(200);
    });
    $(".twitterProfile .profileUser a").attr("href", "https://twitter.com/" + profileName);

    $(".twitterProfile .profileImage a").fadeOut(200, function() {
        $(this).attr("href", "https://twitter.com/" + profileName).fadeIn(200);
    });

    $(".twitterProfile .profileImage img").fadeOut(200, function() {
        $(this).attr("src", profilePicture).addClass("profileImageActive").fadeIn(200);
    });
}

function restoreDefaultTwitterProfile() {
    $(".twitterProfile .profileUser a").fadeOut(200, function() {
        $(this).text("No Profile Found").fadeIn(200);
    });
    $(".twitterProfile .profileUser a").attr("href", "https://twitter.com/");

    $(".twitterProfile .profileImage a").fadeOut(200, function() {
        $(this).attr("href", "https://twitter.com/").fadeIn(200);
    });

    $(".twitterProfile .profileImage img").fadeOut(200, function() {
        $(this).attr("src", "./images/x-logo.png").removeClass("profileImageActive").fadeIn(200);
    });
}

function checkTwitterLogin() {
    $.get("/login-twitter", function(data) {
        let profileName = data.profileName;
        let profilePicture = data.profilePicture;

        updateTwitterProfile(profileName, profilePicture);

        $(".twitterKeys .settingsTitle").addClass("settingsTitleSuccess");
        setTimeout(function() {
            $(".twitterKeys .settingsTitle").addClass("settingsTitleWhite");
            $(".twitterKeys .settingsTitle").removeClass("settingsTitleSuccess");
            $(".twitterKeys .settingsTitle").removeClass("settingsTitleWhite");
        }, 350)

    }).fail(function() {
        console.log("Błąd podczas pobierania danych z /login-twitter");
        restoreDefaultTwitterProfile();

        $(".twitterKeys .settingsTitle").addClass("settingsTitleError");
        setTimeout(function() {
            $(".twitterKeys .settingsTitle").addClass("settingsTitleWhite");
            $(".twitterKeys .settingsTitle").removeClass("settingsTitleError");
            $(".twitterKeys .settingsTitle").removeClass("settingsTitleWhite");
        }, 350)
    });
}


function updateGithubProfile(profileName, profilePicture, githubRepo) {
    $(".githubProfile .profileUsername a").fadeOut(200, function() {
        $(this).text(profileName).fadeIn(200);
    });
    $(".githubProfile .profileUsername a").attr("href", "https://github.com/" + profileName);

    $(".githubProfile .githubRepo a").fadeOut(200, function() {
        $(this).text(githubRepo).fadeIn(200);
    });
    $(".githubProfile .githubRepo a").attr("href", "https://github.com/" + profileName + "/" + githubRepo);


    $(".githubProfile .profileImage a").fadeOut(200, function() {
        $(this).attr("href", "https://github.com/" + profileName).fadeIn(200);
    });

    $(".githubProfile .profileImage img").fadeOut(200, function() {
        $(this).attr("src", profilePicture).addClass("profileImageActive").fadeIn(200);
    });
}

function restoreDefaultGithubProfile() {
    $(".githubProfile .profileUsername a").fadeOut(200, function() {
        $(this).text("No Profile Found").fadeIn(200);
    });
    $(".githubProfile .profileUsername a").attr("href", "https://github.com/");

    $(".githubProfile .githubRepo a").fadeOut(200, function() {
        $(this).text("No Repository").fadeIn(200);
    });
    $(".githubProfile .githubRepo a").attr("href", "https://github.com/");

    $(".githubProfile .profileImage a").fadeOut(200, function() {
        $(this).attr("href", "https://github.com/").fadeIn(200);
    });

    $(".githubProfile .profileImage img").fadeOut(200, function() {
        $(this).attr("src", "./images/github-logo.png").removeClass("profileImageActive").fadeIn(200);
    });
}

function checkGithubLogin() {
    $.get("/login-github", function(data) {
        let profileName = data.profileName;
        let profilePicture = data.profilePicture;

        if (data.repository) {
            githubRepo = data.repository;
        } else {
            githubRepo = "No Repository";
        }

        updateGithubProfile(profileName, profilePicture, githubRepo);


        $(".githubKeys .settingsTitle").addClass("settingsTitleSuccess");
        setTimeout(function() {
            $(".githubKeys .settingsTitle").addClass("settingsTitleWhite");
            $(".githubKeys .settingsTitle").removeClass("settingsTitleSuccess");
            $(".githubKeys .settingsTitle").removeClass("settingsTitleWhite");
        }, 350)

    }).fail(function() {
        console.log("Błąd podczas pobierania danych z /login-github");
        restoreDefaultGithubProfile();

        $(".githubKeys .settingsTitle").addClass("settingsTitleError");
        setTimeout(function() {
            $(".githubKeys .settingsTitle").addClass("settingsTitleWhite");
            $(".githubKeys .settingsTitle").removeClass("settingsTitleError");
            $(".githubKeys .settingsTitle").removeClass("settingsTitleWhite");
        }, 350)
    });
}
