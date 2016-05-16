var getBookModule = angular.module("getBookModule", [])

.factory("books", function($http){
    
    var o = {};
    
    //add book to favorites
    o.add = function(book){
        $http.post("/books", book)
         .then(function(res){
             o.favorites.push(res.data);
         });
    };
    
    o.update = function(user){
        $http.put("/profile", user)
         .then(function(res){
             console.log("Profile Updated");
         });
    };
    
    return o;
    
})