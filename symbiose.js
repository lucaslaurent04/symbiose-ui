"use strict";

(function($) {
    
    
})(jQuery);


$.get( "test.php" )
  .then( function() {
    alert( "$.get succeeded" );
  } )
  .catch( function() {
    alert( "$.get failed!" );
  } );
  
  

function Collection
  
/**
* singleton implementation for easyObject
*
*/
var Symbiose = {

    conf: {
      server_url: 'http://equal.local/'
    },      
    cache: {
      
    },
  
    Collection: function(entity) {
        
        this.entity = entity;
        this.objects = {};

        this.ids = function(ids) {
            if (ids !== undefined) {
                // init keys of 'objects' member (resulting in a map with no values)
                for (var i = 0, n = ids.length; i < n; i++) {
                    this.objects[ids[i]] = {};
                }
                return this;
            }
            else {
                return Object.keys(this.objects);
            }
        }

        this.search = function(domain, params, lang) {
            $.get({
                url: Symbiose.conf.server_url+'index.php?get=model_collection',
                dataType: 'json',
                data: {
                    fields: conf.fields,
                    entity: this.entity,
                    ids: conf.ids,
                    lang: conf.lang
                },
                contentType: 'application/json; charset=utf-8'
            })
            .done(function(json_data) {
                console.log(json_data);
            })
            .fail(function() {
            });            
        }
    },
  
  
  
};