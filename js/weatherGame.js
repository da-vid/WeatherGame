var quicklist = angular.module('weatherGame', ['ui.bootstrap']);

quicklist.controller('gameController', function($scope, $http){

    // Game configuration
    $scope.maxRounds = 5;    
    numOptions = 3;    
    $scope.cities = ["Ann Arbor", "Atlanta", "Boston", "Charlotte", "Chicago", "Cleveland", "Dallas", 
                    "Denver", "Houston", "Las Vegas", "Los Angeles", "Memphis", "Minneapolis", "Miami", "New Orleans",
                     "New York", "Phoenix", "Salt Lake City", "San Diego", "San Francisco", "Tampa", "Washington DC"];

    // Mostly unnecessary variable declaration
    $scope.status = "";
    $scope.correctCityWeather = {};
    $scope.correctCityIdx =  0;
    $scope.gameState = "newGame";
    $scope.options = [];  
    $scope.guessIdx = 0;
    $scope.round = 0;
    $scope.score = 0;
    $scope.bestScore = 0;
    $scope.ajaxLoading = true;
    $scope.waitForAjax = true;        
    guessTaken = false;
    nextCityIdx =  0; 
    nextCityWeather = {};
    nextOptions = [];
    shownCities = [];

    $scope.startGame = function startGame() {
        $scope.round = 0;
        $scope.score = 0;
        shownCities.length = 0;
        $scope.beginRound();
    };

    $scope.beginRound = function beginRound() {
        if($scope.ajaxLoading) {
            $scope.waitForAjax = true;
        }
        $scope.round++;    
        guessTaken = false;
        $scope.correctCityWeather = nextCityWeather;
        $scope.correctCityIdx = nextCityIdx;
        $scope.options.length = 0;
        $scope.options = nextOptions.slice(0);
        $scope.gameState = "question";        
        $scope.loadNextQuestion();         
    };

    $scope.guess = function guess(answerIdx) {
        if(!guessTaken) {
            guessTaken = true;
            $scope.guessIdx = answerIdx;
            if($scope.guessIdx === $scope.correctCityIdx) {
                $scope.score++;
            }

            if($scope.score > $scope.bestScore) {
                $scope.bestScore++;
            }

            if($scope.round < $scope.maxRounds) {
                $scope.gameState = "answer";
            }
            else {
                $scope.gameState = "gameOver";
            }
        }
    };


    getTodaysWeather = function getTodaysWeather(city){
        $scope.ajaxLoading = true;
        $http({method: 'GET', 
            url: "https://george-vustrey-weather.p.mashape.com/api.php?location=" + encodeURIComponent(city), 
            headers: {
                "X-Mashape-Authorization":"Olg4sdyWgN698QCZ7BPD5OEOkJ0XiluN"
            }
        })
            .success(function(data, status, headers, config) {
            nextCityWeather = data[0];
            nextCityWeather.high = Math.round(nextCityWeather.high);            
            nextCityWeather.low = Math.round(nextCityWeather.low);
            $scope.ajaxLoading = false;
            $scope.waitForAjax = false;
            })
            .error(function(data, status, headers, config) {
            $scope.status=status;
            });

    };

    // mockTodaysWeather = function mockTodaysWeather(city){
    //     nextCityWeather.high = 99;            
    //     nextCityWeather.low = 9;
    //     $scope.ajaxLoading = false;
    //     $scope.waitForAjax = false;
    // };

    cityNotAlreadyInOptionsOrAnswerList = function cityNotAlreadyInOptionsOrAnswerList(city) {
        var retVal = true;
        for (var i=0; i<nextOptions.length; i++) {
            if (nextOptions[i].city == city) {
                retVal=false;
            }
        }
        for (i=0; i<shownCities.length; i++) {
            if (shownCities[i] == city) {
                retVal=false;
            }
        }
        return retVal;
    };

    addAnswer = function addAnswer(idx) {
        var randomCityIdx = Math.floor(Math.random() * $scope.cities.length); 
        if(cityNotAlreadyInOptionsOrAnswerList($scope.cities[randomCityIdx])){
            nextOptions.push({"id":idx, "city":$scope.cities[randomCityIdx]});
        }
        else {
            addAnswer(idx);
        }
    };

    $scope.loadNextQuestion = function loadNextQuestion() {
        nextOptions.length = 0;
        for (var i=0; i<numOptions; i++) {
            addAnswer(i);
        }
        nextCityIdx = Math.floor(Math.random() * numOptions);
        getTodaysWeather(nextOptions[nextCityIdx].city);
        shownCities.push(nextOptions[nextCityIdx].city);
    };  
    
});