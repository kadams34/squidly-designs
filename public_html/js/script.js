$(document).ready(function () {

  /********************************************
   * Navbar Class Swap
   * @author rlewis37@cnm.edu
   *
   * These functions require the jQuery library.
   *
   * On document load, these functions check the
   * <body> tag for a class that indicates the
   * layout type: either home-layout or content-layout.
   *
   * Then, applies the appropriate Bootstrap navbar
   * style class is added depending on the layout.
   *
   * On the Home Page only, the navbar will change
   * colors on scroll.
   *
   ********************************************/

  /* check <body> tag for the home-layout class, and add navbar-INVERSE class */
  if($('body')) {

    $('.navbar').addClass('navbar-normal');

    /* on home page ONLY, swap out navabar classes if user scrolls down 50 px */
    $(window).on('scroll', function() {

      if($(window).scrollTop() > 50) {
        $('.navbar').addClass('bg-customWhite navbar-light').removeClass('navbar-dark bg-customGray');
      }

      /* when user scrolls back up, reset navbar*/
      if($(window).scrollTop() <= 50) {
        $('.navbar').addClass('navbar-dark bg-customGray').removeClass('bg-customWhite navbar-light');
      }

    });
  }

  /*
  Page Scroll on Click Animation
   */

  $('.nav-link').click(function(link) {
    link.preventDefault()
    const section = $(this).attr('href')
    $('html, body').animate({
      scrollTop: $(section).offset().top
    })
  })


  /**
   * jQuery Validate Function
   *
   * This function provides front-end validation for your form.
   * If all tests set up here pass, the form data is AJAX submitted
   * to the mailer.php file.
   *
   * Update this file as needed for your form.
   * All ids and name values must match up to your form here.
   *
   * @author Rochelle Lewis <rlewis37@cnm.edu>
   **/
  $("#contact").validate({
    debug: true,
    errorClass: "alert alert-danger",
    errorLabelContainer: "#output-area",
    errorElement: "div",
    // rules here define what is good or bad input
    //each rule starts with the form input element's NAME attribute
    rules: {
      name: {
        required:true
      },
      email: {
        email: true,
        required: true
      },
      message: {
        required: true,
        maxlength: 2000
      }
    },
    //error message to display to the end user when rules above dont pass

    messages: {
      name: {
        required: "Name is a required field"
      },
      email: {
        required: "Email is a required field",
        email: "Invalid Email"
      },
      message: {
        required: "message is required",
        maxlength: "Message is too long"
      }
    },

    submitHandler: function (form) {
      $("#contact").ajaxSubmit({
        type: "POST",
        url: $("#contact").attr("action"),
        success: function (ajaxOutput) {
          $("#output-area").css("display", "")
          $("#output-area").html(ajaxOutput)

          // reset the form if it was successful
          if($(".alert-success").length >= 1) {
            $("#contact")[0].reset();
          }


        }
      })

    }
  })

})

//Footer Copyright Year

function getCurrentYear() {
  let year = new Date().getFullYear()
  document.getElementById('copyright').innerHTML = `© Squidly Designs ${year}`
}

getCurrentYear()