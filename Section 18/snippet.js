// function HouseKeeper(cleaningSkills, attractiveness, trustable, age) {
//     this.cleaningSkills = cleaningSkills,
//     this.attractiveness = attractiveness,
//     this.trustable = trustable,
//     this.age = age,
//     this.clean = function () {
//         alert("Cleaning...");
//     }
// }


// function BellBoy(name, age, hasWorkPermit, languages) {
//   this.name = name;
//   this.age = age;
//   this.hasWorkPermit = hasWorkPermit;
//   this.languages = languages;
// }

function anotherAddEventListener(typeOfEvent, callback) {
    //Detect Event Code
    var eventThatHappened = {
        eventType: "keypress",
        key: "p",
        durationOfKeypress: 2
    }

    if (eventThatHappened.eventType === typeOfEvent) {
        callback(eventThatHappened);
    }
}
