
var myApp = angular.module('Productportfolio', ['ngRoute', 'gm']);

myApp
    .controller('registerCtrl', ['$scope', '$rootScope', '$http', '$location', function ($scope, $rootScope, $http, $location) {

        $scope.submitForm = function () {
            $http({
                method: 'GET',
                url: 'http://localhost:8080/register',
                headers: {
                    'username': $scope.username,
                    'password': $scope.password
                }
            })
                .then(function successCallback(response) {
                    // this callback will be called asynchronously
                    // when the response is available
                    console.log(response);
                    alert('Successfully registered');
                    $location.path('login');

                }, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    console.log(response);
                    alert('registration failed try with different username');
                    $scope.username = '';
                    $scope.password = '';
                });
        }
    }])
    .controller('loginCtrl', ['$scope', '$http', '$rootScope', '$location', function ($scope, $http, $rootScope, $location) {

        $scope.submitForm = function () {
            $http({
                method: 'POST',
                url: 'http://localhost:8080/api/authenticate',
                data: 'username=' + $scope.username + '&password=' + $scope.password,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            })
                .then(function successCallback(response) {
                    // this callback will be called asynchronously
                    // when the response is available
                    console.log(response);
                    if (response.data.success == true) {
                        alert('Successfully loggedIn');
                        localStorage.setItem('token', response.data.token);
                        localStorage.setItem('username', $scope.username);
                        localStorage.setItem('password', $scope.password);
                        $rootScope.loggedIn = true;
                        $location.path('profile');
                    }
                    else {
                        alert('login failed try again');
                        $scope.username = '';
                        $scope.password = '';
                    }


                }, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    console.log(response);
                    alert('login failed try again');
                    $scope.username = '';
                    $scope.password = '';
                });
        }
    }])
    .controller('logoutCtrl', ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {
        localStorage.setItem('token', '');
        localStorage.setItem('username', '');
        localStorage.setItem('password', '');
        $rootScope.loggedIn = false;
        $location.path('login');

    }])
    .controller('profileCtrl', ['$scope', '$http', function ($scope, $http) {

        $scope.lat = undefined;
        $scope.lng = undefined;
        $scope.name = undefined;
        $scope.showlocation = false;
        $scope.minimize = function(){
            $scope.showlocation = false;
        }
        $scope.getLocationData = function () {
            $http({
                method: 'GET',
                url: 'http://localhost:8080/api/getlocation',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "x-access-token": localStorage.getItem('token')
                }
            })
                .then(function successCallback(response) {
                    // this callback will be called asynchronously
                    // when the response is available
                    if (response.data.success == true) {
                        $scope.allLocationData = response.data.data;
                        $scope.showlocation = true;
                    }
                    else {
                        alert('failed to retrive location data');
                    }
                }, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    alert('failed to retrive location data');
                });
        }

        $scope.$on('gmPlacesAutocomplete::placeChanged', function () {
            var location = $scope.autocomplete.getPlace().geometry.location;
            console.log(location);
            console.log($scope.autocomplete);
            $scope.lat = location.lat();
            $scope.lng = location.lng();
            $scope.name = $scope.autocomplete.gm_accessors_.place.zc.formattedPrediction;
            console.log($scope.name);

            $http({
                method: 'POST',
                url: 'http://localhost:8080/api/location',
                data: 'longtitude=' + $scope.lng + '&lattitude=' + $scope.lat + '&place=' + $scope.name,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "x-access-token": localStorage.getItem('token')
                }
            })
                .then(function successCallback(response) {
                    // this callback will be called asynchronously
                    // when the response is available
                    console.log(response);
                    if (response.data.success == true) {
                        alert('Successfully added location information');
                        console.log(response);
                        $scope.autocomplete = '';
                        $scope.lat = undefined;
                        $scope.lng = undefined;
                        $scope.name = undefined;
                    }
                    else {
                        alert('location update failed try again');
                    }


                }, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    console.log(response);
                    alert('login failed try again');
                });

            $scope.$apply();
        });

    }]);

myApp.config(['$routeProvider', function ($routeProvider) {

    $routeProvider
        .when('/register', {
            templateUrl: 'register.html',
            controller: 'registerCtrl'
        })

        .when('/login', {
            templateUrl: 'login.html',
            controller: 'loginCtrl'
        })

        .when('/profile', {
            templateUrl: 'profile.html',
            controller: 'profileCtrl'
        })

        .when('/logout', {
            templateUrl: 'logout.html',
            controller: 'logoutCtrl'
        })

        .otherwise({
            redirectTo: '/login',
            controller: 'loginCtrl'
        });
}])
.run(function($rootScope,$window){
$rootScope.loggedIn = window.localStorage.getItem('token')?true:false;
});




