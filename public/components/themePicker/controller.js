'use strict';

angular.module('courseconnect.controllers')
.controller('themeController', ['$scope', 'colorFactory', function($scope, colorFactory){
    $scope.schemeList = colorFactory.getSchemeList();
    $scope.selectScheme = function(selection){
        colorFactory.changeScheme(selection);
        $scope.$broadcast("SchemeChanged");
    };
}]);
