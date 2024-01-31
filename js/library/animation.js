// ani
$(window).on("scroll", function () {
    $(".ani_load, .ani_visible").each(function () {
        var otop = $(this).offset().top;
        var wtop = $(window).scrollTop() + ($(window).height() * 0.8);
        if($('body').hasClass('mo_ver')){
            wtop = $(window).scrollTop() + ($(window).height() * 0.9)
        }

        if (wtop > otop) {
            $(this).addClass("ani_view");
        } else {
            $(this).removeClass("ani_view");
        }
    });
});

