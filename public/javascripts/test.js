$(function() {
  var type = $('#type').val();
  var duration = $('#duration').val();
  var timeset = $('#timeset').val();
  var TIMES = parseInt(duration) / 2;
  var TIMELEFT = parseInt(timeset) / 2;
  var alarm1, alarm2;
  var t1 = TIMES, t2 = TIMES;
  var ac1 = $('#alarmClock1');
  var ac2 = $('#alarmClock2');
  var acBak1 = $('#acBak1');
  var acBak2 = $('#acBak2');
  var acBtn1 = $('#acBtn1');
  var acBtn2 = $('#acBtn2');
  var btnSwitch = $('#btnSwitch');
  var btnNext = $('.navbar-nav-next ');
  var ask1 = false; var ask2 = false;
  var form1 = $('#form1');
  var form2 = $('#form2');

  btnSwitch.on('click', function (e) {
    var total1 = form1.find('input[name="total"]').val();
    var total2 = form2.find('input[name="total"]').val();
    if ($(e.target).hasClass('disabled'))
      return;
    switch (parseInt(btnSwitch.attr('status'))) {
      case 0:
        if (2 == type && t2 <= TIMELEFT) {
          if ('100' != total2) {
            alert_with_blind(TIMELEFT / 60 + ' 분을 초과하여 이 문제를 풀어야 전환할 수 있습니다.');
            return;
          }
          if (!confirm('문제 풀이를 완료 하시겠습니까?'))
            return;
        } 
        closeAC2();
        startAC1();
        btnSwitch.attr('status', 1);
        btnSwitch.html('문제 전환');
        break;
      case 1:
        if ((1 == type || 2 == type) && t1 <= TIMELEFT) {
          if ('100' != total1) {
            alert_with_blind(TIMELEFT / 60 + ' 분을 초과하여 이 문제를 풀어야 전환할 수 있습니다.');
            return;
          }
          if (!confirm('문제 풀이를 완료 하시겠습니까?'))
            return;
        }  
        closeAC1();
        startAC2();
        btnSwitch.attr('status', 0);
        break;
    } 
  });

  btnNext.on('click', function (e) {
    if (!confirm('문제 풀이를 완료 하시겠습니까?'))
      return false;
    else {
      switch (parseInt(btnSwitch.attr('status'))) {
      case 1:
        saveForm(form1);
        break;
      case 0:
        saveForm(form2);
        break;
      }
      return true;
    }
  });

  $('.form-percent input[name="guilty"], .form-percent input[name="not_guilty"]').change(function(e){
    var guilty = $(e.target).parent().parent().parent().find('input[name="guilty"]');
    var not_guilty = $(e.target).parent().parent().parent().find('input[name="not_guilty"]');
    var total = $(e.target).parent().parent().parent().find('input[name="total"]');
    total.val(parseInt(guilty.val()) + parseInt(not_guilty.val()));
    update_total_status(total);
  });

  function update_total_status(total){
    if (100 != total.val()) {
      total.removeClass('alert-success');
      total.addClass('alert-danger');
    } else {
      total.removeClass('alert-danger');
      total.addClass('alert-success');
    }
  }

  acBtn1.on('click', function () {
    startAC1();
  });

  acBtn2.on('click', function () {
    startAC2();
  });

  $('#saveTest').on('click', function () {
    completeEdit();
  });

  function completeEdit() {
    $.when($.post('/save1', form1.serializeArray()), $.post('/save1', form2.serializeArray()))
      .done(function () {
        location.replace('/thanks');
      });
  }

  function saveForm(form) {
    $.post('/save', form.serializeArray());
  }

  function toMi(se) {
    if (se >= 60) {
      var m = Math.floor(se / 60);
      var s = se % 60;
      if (s<10) {
        s = '0' + s;
      }
      return m + ':' + s;
    } else {
      if (se < 10) {
        s = ''
      }
      return '0:' + se;
    }
  }

  function closeAC1() {
    window.clearInterval(alarm1);
    //t1 = 0;
    //acBak1.slideDown();
    saveForm(form1);
    $('.question1').hide();
  }

  function startAC1() {
    if (2 != type)
      btnSwitch.addClass('disabled');
    $('.question1').show();
    //acBak1.slideUp();
    //acBtn1.remove();
    //acBak2.removeClass('pending');
    ac1.html('<span class="glyphicon glyphicon-time"></span> ' + toMi(t1));
    alarm1 = window.setInterval(function () {
      if (t1 > 0) {
        t1 -= 1;
        ac1.html('<span class="glyphicon glyphicon-time"></span> ' + toMi(t1));
        if (3 == type && 0 == t1 % TIMELEFT && 0 != t1) {
          closeAC1();
          startAC2();
        }
        if (t1 <= TIMELEFT) {
          ac1.removeClass('alert-warning');
          ac1.addClass('alert-danger');
          if (3 == type && 0 == t1 % TIMELEFT && 0 != t1) {
            return;
          }
          if (!ask1) {
            alert_with_blind(TIMELEFT / 60 + ' 분 남았습니다!');
            ask1 = true;
          }
          if ('100' == form1.find('input[name="total"]').val()) {
            btnSwitch.removeClass('disabled');
          } else if (2 != type) {
            btnSwitch.addClass('disabled');
          }
          if ('100' == form1.find('input[name="total"]').val() &&
              2 == type && ('100' == form2.find('input[name="total"]').val() || t2 < TIMELEFT)) {
            btnNext.removeClass('disabled');
          }
        }
        if (t2 < TIMELEFT) {
          btnSwitch.addClass('disabled');  
        }
      } else {
        closeAC1();
        if (t2 > 0)
          startAC2();
        btnSwitch.addClass('disabled');
        if (t1 <= 0 && t2 <= TIMELEFT) {
          btnNext.removeClass('disabled');
        }
      }
    }, 1000);
  }

  function closeAC2() {
    window.clearInterval(alarm2);
    //t2 = 0;
    //form2.find('textarea').attr('readonly', 'readonly');
    //acBak2.slideDown();
    // $.post('/save1', form2.serializeArray()).done(function () {
    //   location.replace('/thanks/' + num);
    // });
    saveForm(form2);
    $('.question2').hide();
  }

  function startAC2() {
    $("html, body").animate({ scrollTop: 0 });
    if (2 != type)
      btnSwitch.addClass('disabled');
    $('.question1').hide();
    $('.question2').show();
    acBak2.slideUp();
    ac2.html('<span class="glyphicon glyphicon-time"></span> ' + toMi(t2));
    alarm2 = window.setInterval(function () {
      if (t2 > 0) {
        t2 -= 1;
        ac2.html('<span class="glyphicon glyphicon-time"></span> ' + toMi(t2));
        if (3 == type && 0 == t2 % TIMELEFT && 0 != t2) {
          closeAC2();
          startAC1();
        }
        if (t2 <= TIMELEFT) {
          ac2.removeClass('alert-warning');
          ac2.addClass('alert-danger');
          if (3 == type && 0 == t2 % TIMELEFT && 0 != t2) {
            return;
          }
          if (!ask2) {
            alert_with_blind(TIMELEFT / 60 + ' 분 남았습니다!');
            ask2 = true;
          }
          if ('100' == form2.find('input[name="total"]').val() &&
              (2 != type || '100' == form1.find('input[name="total"]').val() || t1 < TIMELEFT)) {
            btnNext.removeClass('disabled');
          } else {
            btnNext.addClass('disabled');
          }
        }
        if (t1 < TIMELEFT) {
          btnSwitch.addClass('disabled');  
        }
      } else {
        closeAC2();
        if (2 == type && t1 > 0)
          startAC1();
        btnSwitch.addClass('disabled');
        if (t1 <= TIMELEFT && t2 <= 0) {
          btnNext.removeClass('disabled');
        }
      }
    }, 1000);
  }

  function alert_with_blind(message) {
    $('.blinder').show();
    window.setTimeout(function() {
      alert(message);
      $('.blinder').hide();
    }, 10);  
  }
  
});