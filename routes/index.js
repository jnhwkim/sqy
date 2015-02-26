var utils    = require( '../utils' );
var cmd      = require( '../cmd' );
var mongoose = require( 'mongoose' );
var HJX = mongoose.model( 'HJX' );
var Settings = mongoose.model( 'Settings' );
var Allocation = mongoose.model( 'Allocation' );

var cur = utils.formatDate();
var ran1 = ('10' + cur + '0000') - 0;
var ran2 = ('20' + cur + '0000') - 0;

exports.index = function ( req, res, next ){
  Settings.findOne()
          .sort( '-updated_at' )
          .exec(function (err, settings) {
    if (err) return handleError(err);
    else if (settings) {
      res.render( 'index', {
        type: 1,
        numParticipants: settings.numParticipants,
        numStimuli: settings.numStimuli,
        duration: settings.duration,
        timeset: settings.timeset
      });
    } else {
      res.writeHead(302, {
          'Location': '/settings'
      });
      res.end();
    }
  });
};

exports.thanks = function ( req, res, next ){
  res.render( 'thanks',  {pid: req.params.pid});
};

exports.list1 = function ( req, res, next ){
  HJX.find({type:'1'}).sort( '-updated_at' ).exec( function ( err, list ){
    if( err ) return next( err );
    res.render( 'list', {
      title : 'Test Result',
      list : list
    });
  });
};

exports.list2 = function ( req, res, next ){
  HJX.find({type:'2'}).sort( '-user_id' ).exec( function ( err, list ){
    if( err ) return next( err );
    res.render( 'list', {
      title : 'Test Result',
      list : list
    });
  });
};

exports.test = function (req, res, next) {
  // Disable caching for content files
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);

  Allocation.where({pid: parseInt(req.query.pid)})
    .findOne(function (err, allocation) {
      if (allocation) {
        Settings.findOne()
                .sort( '-updated_at' )
                .exec(function (err, settings) {
          if (err) return handleError(err);
          else if (settings) {
            res.render( 'test', {
              testset: allocation.testset,
              pid: req.query.pid,
              type: allocation.type,
              step: req.query.step?parseInt(req.query.step):1,
              numParticipants: settings.numParticipants,
              numStimuli: settings.numStimuli,
              duration: settings.duration,
              timeset: settings.timeset
            });
          } else {
            res.writeHead(302, {
                'Location': '/settings'
            });
            res.end();
          }
        });
      } else {
        res.send('{success: false}');
      }
    });
};

exports.test2 = function (req, res, next) {
  ran2 += 2;
  res.render( 'test2', {
    user_id: ran2,
    type: '2'
  });
};

exports.next = function (req, res, next) {
  var pid = req.params.pid;
  var step = req.params.step;
  switch(step) {
    case '1':
      redirect = '/test?pid='+pid+'&step=2';
      break;
    case '2':
      redirect = '/thanks/'+pid;
      break;
    default:
      res.send('{success: false}');
      return;
  }
  res.writeHead(302, {
    'Location': redirect
  });
  res.end();
};

exports.settings = function (req, res, next) {
  Settings.findOne()
          .sort( '-updated_at' )
          .exec(function (err, settings) {
    if (err) return handleError(err);
    else if (settings) {
      res.render( 'settings', {
        numParticipants: settings.numParticipants,
        numStimuli: settings.numStimuli,
        duration: settings.duration,
        timeset: settings.timeset,
        timeshift: settings.timeshift
      });
    } else {
      res.render( 'settings', {
        numParticipants: 0,
        numStimuli: 4,
        duration: 0,
        timeset: 0,
        timeshift: 0,
      });
    }
  });
};

exports.update = function (req, res, next) {
  switch (req.body.cmd) {
    case 'update_settings':
      cmd.update_settings(req, res, next);
      break;
    default: 
      res.send('{success: false}');
  }
};

exports.save = function (req, res, next) {
  sqy = new HJX({
    pid: req.body.pid,
    type: req.body.type,
    step: req.body.step,
    question: req.body.question,
    stimulus: req.body.stimulus,
    answer1: req.body.guilty,
    answer2: req.body.not_guilty,
    updated_at : Date.now()
  });
  sqy.save( function ( err ){
    if(!err){
      res.send('{success: true}');
    }else{
      res.send('{success: false}');
    }
  });
};

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
      se = '0' + se;
    }
    return '0:' + se;
  }
};

exports.save2 = function (req, res, next) {
  HJX.find({user_id: req.body.user_id, question: req.body.question, type: req.body.type}, function (err, sqy) {

    var contTime = (req.body.contTime || '').split(',');
    var contTable = [];
    var editTimes = contTime.length;

    contTime.forEach(function (time) {
      contTable.push('open@'+toMi(time));
    });

    if (sqy.length > 0) { // update
      sqy = sqy[0];
      sqy.content = req.body.content;
      sqy.contTime = contTime;
      sqy.contTable = contTable.join(',');
      sqy.editTimes = editTimes;
    } else {
      sqy = new HJX({
        user_id: req.body.user_id,
        type: req.body.type,
        question: req.body.question,
        content: req.body.content,
        contTime: contTime,
        contTable: contTable.join(','),
        editTimes: editTimes,
        updated_at : Date.now()
      });
    }
    sqy.save( function ( err ){
      if(!err){
        res.send('{success:true}');
      }else{
        res.send('{success:false}');
      }
    });
  });
};