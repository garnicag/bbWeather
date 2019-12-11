$(document).ready(function () {
	'use strict';

	var ENTER_KEY = 13,
			weatherAPIKey = '&APPID=e31fd8d3740d5ec07ab42317860ae208',
			weatherAPIUrl = 'https://api.openweathermap.org/data/2.5/weather?units=metric&q=',
			forecastAPIUrl = 'https://api.openweathermap.org/data/2.5/forecast/daily?units=metric&q=',
			flickerAPIKey = 'afb58266815fa1fe013560594df4c254',
			flickerAPIUrl = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' + flickerAPIKey + '&tags=nature%2Ccity&2Clandmark%2Clandscape%2Csky&sort=relevance&extras=url_c&content_type=1&format=json&nojsoncallback=1&text=';

	// Weather Module
	var Weather = Backbone.Model.extend({
		setUrl: function (city) {
			city = city || 'bogota';
			this.url = weatherAPIUrl + city + weatherAPIKey;
		}
	});

	var Forecast = Backbone.Model.extend({
		setUrl: function (city) {
			city = city || 'bogota';
			this.url = forecastAPIUrl + city + weatherAPIKey;
		}
	});

	var WeatherView = Backbone.View.extend({
		el: '#weather',
		template: _.template($('#weatherTemplate').html()),

		events: {
			'keypress #new-city': 'findCity'
		},

		initialize: function () {
			this.weather = new Weather();
			this.forecast = new Forecast();
			//console.log(this.$input);
			//this.picture = new Background500px();
			this.listenEvents();
		},

		render: function () {
			var roundedTemp = Math.round(this.weather.attributes.main.temp),
					concatData = {roundedTemp: roundedTemp, ...this.weather.attributes, ...this.forecast};

			var weatherTemplate = this.template(concatData);
			this.$el.html(weatherTemplate);
			console.log(concatData);
			console.log(this.weather.attributes);
		},

		listenEvents: function () {
			this.listenTo(this.weather, 'sync', _.bind(this.render, this));
		},

		searchCity: function (city) {
			this.weather.setUrl(city);
			this.forecast.setUrl(city);
			this.weather.fetch();
			this.forecast.fetch();
		},

		findCity: function (e) {
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

		initialize: function () {
			Backbone.history.start();
		},

		WeatherView: function (page, param) {
			view.searchCity(param);
			bkgView.changeBackground(param);
		},

		SearchCity: function (city) {
			this.navigate('*city/' + cityname, { trigger: true });
		}
	});

	// Background Module
	var BkgCollection = Backbone.Collection.extend({
		setBkgUrl: function (city) {
			city = city || 'bogota';
			this.url = flickerAPIUrl + city;
		},

		parse: function (response) {
			return response.photos.photo;
		}
	});

	var BkgView = Backbone.View.extend({
		el: $('body'),

		changeBackground: function (param) {
			backgroundView.setBkgUrl(param);
			backgroundView.fetch({
				success: function (response, xhr) {
					bkgView.render();
				}
			});
		},
		render: function () {
			var bkgPic,
				phIndex;

			while (bkgPic == undefined) {
				phIndex = Math.floor((Math.random() * 99) + 1);
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

	var margin = { top: 10, right: 40, bottom: 30, left: 30 },
		width = 450 - margin.left - margin.right,
		height = 400 - margin.top - margin.bottom;

	var svG = d3.select("#graph")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform",
			"translate(" + margin.left + "," + margin.top + ")");

	var graphData = [{ x: 10, y: 20 }, { x: 40, y: 90 }, { x: 80, y: 50 }]

	svG.append("path")
		.data(graphData)
		.attr("fill", "none")
		.attr("stroke", "white")
		.attr("stroke-width", 1.5)
		.attr("d", d3.line()
			.x(function(data) { return x(data.x) })
			.y(function(data) { return y(data.y) })
		)
});
