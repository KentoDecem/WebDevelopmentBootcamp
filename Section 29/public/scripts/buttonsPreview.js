window.addEventListener('DOMContentLoaded', (event) => {
var waitForJQuery = setInterval(function () {
if (typeof $ != 'undefined') {

$(".gradientGithub").click(function() {
    $(".videoGithub").slideToggle();
})

$(".gradientTwitter").click(function() {
    $(".videoTwitter").slideToggle();
})




clearInterval(waitForJQuery);
}
}, 10);
});