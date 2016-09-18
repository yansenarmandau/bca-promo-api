var express = require('express')
var axios = require('axios')
var cheerio = require('cheerio')
var bodyParser = require('body-parser')

var app = express()
var baseUrl = 'http://www.bca.co.id'

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json({ type: 'application/json' }))

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

app.get('/', function (req, res) {
	res.send('BCA Promo API v1.0.0')
})

app.get('/getListPromoByCategory', function (req, res) {

	var categoryNumber = req.query.catNumber ? req.query.catNumber : res.send('error')
	var page = req.query.page ? req.query.page : 1

	var url = baseUrl + '/api/sitecore/Promo/GS_PromoLainnya/?TempIDJenisPromo={'+ categoryNumber +'}&page='+ page +'&pageSize=10&isPagingClicked=true&promoType=KartuKredit'

	axios.get(url).then(function (response) {
		var $ = cheerio.load(response.data)
		var promos = []
		$('.card-item').each(function (i, elem) {
			var promosObject = $(elem).children()
			promosObject.each(function (i, elm) {
				var detailLink = $('a', this).attr('href')
				var image = $('a', this).children().attr('src')
				var product = $('h4.panel-heading', this).text()
				var expired = $('.panel-footer p', this).last().text()
				var productDetail = $('.panel-body', this).children().html()
				productDetail = productDetail ? productDetail.replace(/\n/g, '') : $('.panel-body', this).text()
				var productLogo = $('.icon-bca-shape a', this).children().attr('src')
				promos.push({
					product: product,
					detail: productDetail,
					logo: productLogo,
					expired: expired,
					detailLink: detailLink,
					image: image
				})
			})
		})
		return promos
	}).then(function (promos) {
		res.status(200).json({data: promos})
	}).catch(function (err) {
		res.json(err)
	})
})

app.get('/getPromoCategories', function (req, res) {
	var url = baseUrl + '/id/Individu/Produk/Kartu-Kredit'
	axios.get(url).then(function (response) {
		var $ = cheerio.load(response.data)
		var categories = []
		$('.iz-promo-icon').children('.item').each(function (i, elm) {
			var catLink = $(elm).children().children().attr('href')
			var catNumber = ''
			if (catLink) {
				catNumber = catLink.match(/\{(.*?)\}/)[1]
			}
			var category = $('.item span', this).text()
			categories.push({
				category: category,
				categoryNumber: catNumber
			})
		})
		return categories
	}).then(function (result) {
		res.status(200).json({data: result})
	}).catch(function (err) {
		res.json(err)
	})
})

module.exports = app