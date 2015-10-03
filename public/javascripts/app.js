'use strict';

var app = angular.module('courseconnect', 
    [
    'ui.bootstrap',
    'ngFacebook',
    'courseconnect.controllers',
    // 'courseconnect.filters',
    'courseconnect.directives',
    'courseconnect.services'
    ])
    .config( function( $facebookProvider ) {
        $facebookProvider.setAppId('1624541797795153');
        $facebookProvider.setVersion('v2.4');
        $facebookProvider.setPermissions("public_profile,email,user_friends");
    })
    .run( function( $rootScope ) {
        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    });