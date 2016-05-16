var app = angular.module("app", ["getBookModule"])

.controller("MainCtrl", function($scope, $http, books){
    
    $scope.$watch('title', function(){
        fetch();
    });
    
    $scope.title = "Tuck Everlasting";
    
    //format book data for title, author, and cover
    function formatBookData(data){
        
        var bookinfo = {};
        
        var title = data[0].title;
        var author = data[0].authors[0];
        var cover = data[0].imageLinks.thumbnail;
        
        bookinfo.title = title;
        bookinfo.author = author;
        bookinfo.cover = cover;
        
        return bookinfo;
    }
    
     function fetch(){
        $http.get("/search/" + $scope.title)
         .then(function(res){
             $scope.info = formatBookData(res.data);
             //console.log(formatBookData(res.data));
         }, function(res){
             if(res.status === 400){
                 $scope.error = "No Book Found";
             } else {
                 $scope.error = "Error: " + res.statusText;
             }
         });
    }
    
    $scope.add = function(){
        books.add({
            title: $scope.info.title,
            author: $scope.info.author,
            cover: $scope.info.cover
        });
    };
    
    $scope.update = function(){
        books.update({
            full_name: $scope.full_name, 
            city: $scope.city,
            state: $scope.state
        });
    };
    
    
});