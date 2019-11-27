$(document).ready(function() {
	'use strict';

	var ENTER_KEY = 13;
	
	// Weather
	
    var Weather = Backbone.Model.extend({
		setUrl: function(city) {
			city = city || 'bogota';
			this.url = 'https://api.openweathermap.org/data/2.5/weather?units=metric&q='+city+'&APPID=e31fd8d3740d5ec07ab42317860ae208';
			
		}
    });

    var WeatherView = Backbone.View.extend({
        el: '#weather',
        template: _.template($('#weatherTemplate').html()),

		events: {
      		'keypress #new-city': 'findCity'
      	},

		initialize: function() {
			this.weather = new Weather();
			//console.log(this.$input);
			//this.picture = new Background500px();
			this.listenEvents();
		},

        render: function() {
            var weatherTemplate = this.template(this.weather.attributes);
			var roundedTemp = Math.round(this.weather.attributes.main.temp);
			this.$el.html(weatherTemplate);
        },

		listenEvents: function() {
			this.listenTo(this.weather, 'sync', _.bind(this.render, this));
		},

		searchCity: function(city) {
			this.weather.setUrl(city);
			this.weather.fetch();
		},

		findCity: function(e) {
			var searchInput = this.$('#new-city');
			if (e.keyCode != ENTER_KEY) return;
        	this.query = searchInput.val();
        	if (!this.query) return;
        	routerCity.navigate('city/' + this.query, true);
			console.log(searchInput);
    	}
    });


    var Router = Backbone.Router.extend({
        routes: {
            '/': 'WeatherView',
            '*city/:cityname': 'WeatherView',
			'*any': 'WeatherView'
        },

		initialize: function() {
			Backbone.history.start();
		},

        WeatherView: function (page,param) {
        	view.searchCity(param);
			bkgView.changeBackground(param);
        },

        SearchCity: function (city) {
        	this.navigate('*city/' + cityname, {trigger: true});
        }
    });
	
	// Background
	
    var BkgCollection = Backbone.Collection.extend({
        
		setBkgUrl: function(city) {
			city = city || 'bogota';
			this.url = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=afb58266815fa1fe013560594df4c254&tags=nature%2Ccity&2Clandmark%2Clandscape%2Csky&sort=relevance&extras=url_c&content_type=1&format=json&nojsoncallback=1&text='+city;
		},
		
		parse: function(response) {
            return response.photos.photo;
        }
    });

    var BkgView = Backbone.View.extend({
        el: $('body'),
		
		changeBackground: function(param){
			backgroundView.setBkgUrl(param);
            backgroundView.fetch({
                success: function(response, xhr) {
                    bkgView.render();
                }
            });
		},
        render: function() {
			var bkgPic,
				phIndex;

			while (bkgPic == undefined) {
	           	phIndex = Math.floor((Math.random() * 99)+1);
				console.log(phIndex);
				bkgPic = backgroundView.models[phIndex].get('url_c');
			}
			
			$(this.el).css('background-image', 'url("' + bkgPic + '")');
        }
    });

    var backgroundView = new BkgCollection();
    var bkgView = new BkgView();
	
	var view = new WeatherView();
	var routerCity = new Router();


});

