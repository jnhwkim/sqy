var moment   = require('moment');
var utils    = require( '../utils' );
var cmd      = require( '../cmd' );
var mongoose = require( 'mongoose' );
var HJX = mongoose.model( 'HJX' );
var Settings = mongoose.model( 'Settings' );
var Allocation = mongoose.model( 'Allocation' );

exports.index = function ( req, res, next ){
  res.render( 'index' );
};

exports.intro = function ( req, res, next ){
  Settings.findOne()
          .sort( '-updated_at' )
          .exec(function (err, settings) {
    if (err) return handleError(err);
    else if (settings) {
      res.render( 'intro', {
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

exports.settings = function (req, res, next) {
  Settings.findOne()
          .sort( '-updated_at' )
          .exec(function (err, settings) {
    if (err) return handleError(err);
    else if (settings) {
      Allocation.find().sort('pid').exec(function(err, allocations){
        res.render( 'settings', {
          numParticipants: settings.numParticipants,
          numStimuli: settings.numStimuli,
          duration: settings.duration,
          timeset: settings.timeset,
          timeshift: settings.timeshift,
          allocations: allocations,
          moment: moment
        });
      });
    } else {
      res.render( 'settings', {
        numParticipants: 0,
        numStimuli: 4,
        duration: 0,
        timeset: 0,
        timeshift: 0,
        allocations: {},
        moment: moment
      });
    }
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

exports.answers = function (req, res, next) {
  cmd.export_answers_csv(req, res, next);
};

exports.switches = function (req, res, next) {
  cmd.export_switches_csv(req, res, next);
};

exports.reset = function (req, res, next) {
  cmd.reset(req, res, next);
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
