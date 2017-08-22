$('.smooth-archor').click(function(){
    var href = $(this).attr('data-href');
    if(href.indexOf('#') === -1){
        window.location.reload();
    }else{
        var pos = $(href).offset().top;
        $('html,body').animate({scrollTop: pos},500);
    }
})