// Ionic Starter App

var db = null;

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova'])

.controller('CourseCtrl', function($scope, $ionicModal, $ionicPopup, $ionicPlatform, $cordovaSQLite){

  $ionicPlatform.ready(function(){
    db = $cordovaSQLite.openDB("data.db");
    $cordovaSQLite.execute(db, "create table if not exists courses (id integer primary key autoincrement, course text, grade integer, cNum integer, units integer);");
    $scope.load();
  });

  $ionicModal.fromTemplateUrl('options-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal
  })

  $scope.openModal = function() {
    $scope.modal.show()
  }

  $scope.closeModal = function() {
    $scope.calcGpa();
    $scope.modal.hide();
  };

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  $ionicModal.fromTemplateUrl('help-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.helpModal = modal
  })

  $scope.openHelpModal = function() {
    $scope.helpModal.show()
  }

  $scope.closeHelpModal = function() {
    $scope.calcGpa();
    $scope.helpModal.hide();
  };

  $scope.$on('$destroy', function() {
    $scope.helpModal.remove();
  });

  $scope.programsList = [
    {text: "Bachelor of Engineering - Honours", value: "be"},
    {text: "Other", value: "na"}
  ];

  $scope.data = {
    program: 'na',

    // For the temp input fields
    course: null,
    grade: null,
    units: null
  };

  $scope.courses = [
    //{name: "CSSE2010", grade: 6, cNum: 2, units: 2}
  ];


$scope.calcGpa = function(){
  var prog = $scope.data.program;
  if (prog == "be"){
    $scope.calcGpaBe();
  } else if (prog == "na"){
    $scope.calcGpaNa();
  }
}


  $scope.calcGpaBe = function(){
    // Do the GPA calculation
    var numerator = 0;
    var denominator = 0;
    for (var i = 0; i < $scope.courses.length; i++){
      var course = $scope.courses[i];
      numerator += course.grade * course.units * course.cNum;
      denominator += course.units * course.cNum;
    }
    if (denominator != 0){
      $scope.gpa = numerator / denominator;
    } else {
      $scope.gpa = 0;
    }
  }

$scope.calcGpaNa = function(){
    // Do the GPA calculation
    var numerator = 0;
    var denominator = 0;
    for (var i = 0; i < $scope.courses.length; i++){
      var course = $scope.courses[i];
      numerator += course.grade * course.units;
      denominator += parseInt(course.units);
    }
    if (denominator != 0){
      $scope.gpa = numerator / denominator;
    } else {
      $scope.gpa = 0;
    }
  }

  $scope.gpa = 0;

  $scope.showPopup = function(message){
     var alertPopup = $ionicPopup.alert({
       title: 'Alert',
       template: message
     });
  }

  /*
    Removes the course via swiping
  */
  $scope.remove = function(name){
    $scope.delete(name);
    for (var i = 0; i < $scope.courses.length; i++){
      var course = $scope.courses[i];
      if (course.name == name){
        $scope.courses.splice(i, 1);
      }
    }

    $scope.calcGpa();
  }

  $scope.checkIfExists = function(course){
    for (var i = 0; i < $scope.courses.length; i++){
      c = $scope.courses[i];
      if (c.name == course.toUpperCase()){
        return true;
      }
    }
    return false;
  }

  $scope.createCourse = function(course, grade, units){

    if (course != "" && course != null &&
        $scope.courses.indexOf(course) == -1 &&
        course.length == 8){

          if (grade >= 0 && grade <= 7 && units > 0 && units <= 2){
            var reg = new RegExp("^....(.)...$");
            var num = reg.exec(course)[1];
            if (num > 0 && num <= 9){

              var c = {
                name: course.toUpperCase(),
                grade: grade,
                cNum: num,
                units: units
              };
              if (! $scope.checkIfExists(course)){
                $scope.courses.push(c);

                // Save in SQLite
                $scope.save(course, grade, num, units);

                // Clear input
                $scope.data.course = "";
                $scope.data.grade = "";
              }
              $scope.calcGpa();
            }
          }
    }
  }

  $scope.save = function(course, grade, cNum, units){
    $cordovaSQLite.execute(db, "insert into courses (course, grade, cNum, units) values (?, ?, ?, ?);",
      [course.toUpperCase(), grade, cNum, units])
    .then(function(result){
        console.log("Saved successfully");
    }, function(error){
        console.log(error.message);
    })
  }


  $scope.delete = function(course){
    $cordovaSQLite.execute(db, "delete from courses where course=?;", [course]).then(function(result){
      console.log("Removed successfully: " + result.message);
    }, function(error){
      console.log("An error occured: " + error.message);
    })
  }

  $scope.load = function(){
    $cordovaSQLite.execute(db, "select course, grade, cNum, units from courses;")
    .then(function(result){
      if (result.rows.length > 0){
        for (var i = 0; i < result.rows.length; i++){
          var item = result.rows.item(i);
          var c = {
            name: item.course,
            grade: item.grade,
            cNum: item.cNum,
            units: item.units
          };
          $scope.courses.push(c);
        }
      }
      $scope.calcGpa();
    });
  }
})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      if (ionic.Platform.isAndroid()){
        StatusBar.backgroundColorByHexString("#4527A0");
      } else {
        StatusBar.styleLightContent();
      }
      //StatusBar.styleDefault();
    }
  });
})
