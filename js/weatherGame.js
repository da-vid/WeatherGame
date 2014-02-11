var quicklist = angular.module('weatherGame', ['ui.bootstrap']);

quicklist.controller('gameController', function($scope, $http){

    // Game configuration
    $scope.maxRounds = 5;    
    numOptions = 3;    
    $scope.cities = ["Ann Arbor", "Atlanta", "Boston", "Charlotte", "Chicago", "Cleveland", "Dallas", 
                    "Denver", "Houston", "Las Vegas", "Los Angeles", "Memphis", "Minneapolis", "Miami", "New Orleans",
                     "New York", "Phoenix", "Salt Lake City", "San Diego", "San Francisco", "Tampa", "Washington DC"];

    // Variables
    $scope.status = "";
    $scope.correctCityWeather = {};
    $scope.correctCityIdx =  0;
    $scope.gameState = "newGame";
    $scope.options = [];  
    $scope.guessIdx = 0;
    $scope.round = 0;
    $scope.score = 0;
    $scope.bestScore = 0;
    $scope.waitForAjax = true;       
    ajaxLoading = true;     
    guessTaken = false;
    nextCityIdx =  0; 
    nextCityWeather = {};
    nextOptions = [];
    shownCities = [];

    $scope.startGame = function() {
        $scope.round = 0;
        $scope.score = 0;
        shownCities.length = 0;
        $scope.beginRound();
    };

    $scope.beginRound = function() {        
        $scope.round++;    
        $scope.gameState = "question";      
        $scope.options.length = 0;          
        guessTaken = false;      
        if(ajaxLoading) {
            $scope.waitForAjax = true;
        }
        checkForAjax();
    };

    function beginRoundPart2() {
        $scope.correctCityWeather = nextCityWeather;
        $scope.correctCityIdx = nextCityIdx;
        $scope.options = nextOptions.slice(0);  
        $scope.loadNextQuestion();  
    }

    function checkForAjax() { //http:stackoverflow.com/questions/951021/what-do-i-do-if-i-want-a-javascript-version-of-sleep
        if ($scope.waitForAjax) {
            setTimeout(checkForAjax, 50); 
        }
        else {
            beginRoundPart2();
        }
    }

    $scope.guess = function (answerIdx) {
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

    $scope.loadNextQuestion = function () {
        nextOptions.length = 0;
        for (var i=0; i<numOptions; i++) {
            addAnswer(i);
        }
        nextCityIdx = Math.floor(Math.random() * numOptions);
        var nextCity = nextOptions[nextCityIdx].city;
        shownCities.push(nextCity);
        getTodaysWeather(nextCity);
    };  
    
    function addAnswer(idx) {
        var randomCityIdx;
        var randomCity;
        do {
            randomCityIdx = Math.floor(Math.random() * $scope.cities.length);
            randomCity = $scope.cities[randomCityIdx];
        }
        while (cityAlreadyInOptionsOrAnswerList(randomCity));
        
        nextOptions.push({"id":idx, "city":randomCity});
    }

    function cityAlreadyInOptionsOrAnswerList(city) {
        var retVal = false;
        for (var i=0; i<nextOptions.length; i++) {
            if (nextOptions[i].city == city) {
                retVal = true;
            }
        }
        for (i=0; i<shownCities.length; i++) {
            if (shownCities[i] == city) {
                retVal = true;
            }
        }
        return retVal;
    }

    function getTodaysWeather (city){
        ajaxLoading = true;
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
            ajaxLoading = false;
            $scope.waitForAjax = false;
        })
        .error(function(data, status, headers, config) {
            $scope.status=status;
            //TODO more intelligent error handling
        });
    }
});