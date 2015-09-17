// Write your package code here!
ALI = function (apiKey, trackingId) {
    this.apiKey = apiKey || null;
    this.trackingId = trackingId || null;
    if (Meteor.settings && Meteor.settings.private && Meteor.settings.private.AliExpress) {
        var aliExpress = Meteor.settings.private.AliExpress;
        if (Match.test(aliExpress, {key: String, tracking: String})) {
            this.apiKey = aliExpress.key;
            this.trackingId = aliExpress.tracking;
        }
    }
}

ALI.prototype.getCategories = function () {
    return [
        {name: 'Apparel & Accessories', id: '3'},
        {name: 'Automobiles & Motorcycles', id: '34'},
        {name: 'Baby Products', id: '1501'},
        {name: 'Beauty & Health', id: '66'},
        {name: 'Computer & Networking', id: '7'},
        {name: 'Construction & Real Estate', id: '13'},
        {name: 'Consumer Electronics', id: '44'},
        {name: 'Customized Products', id: '100008578'},
        {name: 'Electrical Equipment & Supplies', id: '5'},
        {name: 'Electronic Components & Supplies', id: '502'},
        {name: 'Food', id: '2'},
        {name: 'Furniture', id: '1503'},
        {name: 'Hair & Accessories', id: '200003655'},
        {name: 'Hardware', id: '42'},
        {name: 'Home & Garden', id: '15'},
        {name: 'Home Appliances', id: '6'},
        {name: 'Industry & Business', id: '200003590'},
        {name: 'Jewelry & Watch', id: '36'},
        {name: 'Lights & Lighting', id: '39'},
        {name: 'Luggage & Bags', id: '1524'},
        {name: 'Office & School Supplies', id: '21'},
        {name: 'Phones & Telecommunications', id: '509'},
        {name: 'Security & Protection', id: '30'},
        {name: 'Shoes', id: '322'},
        {name: 'Special Category', id: '200001075'},
        {name: 'Sports & Entertainment', id: '18'},
        {name: 'Tools', id: '1420'},
        {name: 'Toys & Hobbies', id: '26'},
        {name: 'Watches', id: '1511'}
    ]
}
var defaultFields = [
    'productId',
    'productTitle',
    'productUrl',
    'imageUrl',
    'originalPrice',
    'salePrice',
    'discount', 'evaluateScore',
    'commission',
    'commissionRate',
    '30daysCommission',
    'volume',
    'packageType',
    'lotNum',
    'validTime'
]
ALI.prototype.getProductsByCat = function (catId, params) {
    check(catId, Number);
    check(params, Object);
    params = _.extend(params, {categoryId: catId, trackingId: this.trackingId});
    if (!_.has(params, 'fields')) {
        params = _.extend(params, {fields: defaultFields});
    }

    try{
        /*var callSync = Meteor.wrapAsync(listPromotionProduct);
        var rs = callSync(this.apiKey, _.toQueryString(params));
        console.log(rs);*/
        //var callSync = Async.wrap(listPromotionProductAsync);
        return listPromotionProduct(this.apiKey, _.toQueryString(params));
    }catch(ex){
        dumpError(ex);
    }
}

ALI.prototype.getProductsByCat2 = function(catId, params){
    params = _.extend(params, {categoryId : catId});
    return listPromotionProductAsync(this.apiKey,this.trackingId, params);
}

ALI.prototype.getProductDetail = function (pId) {

}

var listPromotionProduct = function (apiKey, queryString) {
    var rs = Async.runSync(function(done){
        var url = 'http://gw.api.alibaba.com/openapi/param2/2/portals.open/api.listPromotionProduct/' + apiKey;
        HTTP.call('GET', url, {
            query: queryString
        }, function (err, rs) {
            if (err) console.log(err);
            if (rs) {
                var a = verifyResult(0, rs['data']);
                done(null,a);
            }
        })
    })
    return rs.result;
}
var listPromotionProductAsync = function (apiKey, trackingId, params) {
    try{
        var rs = Async.runSync(function(done){
            async.waterfall([
                Meteor.bindEnvironment(function(cb){
                    var url = 'http://gw.api.alibaba.com/openapi/param2/2/portals.open/api.listPromotionProduct/' + apiKey;
                    if(!_.has(params,'fields')) params = _.extend(params, {fields : defaultFields});
                    HTTP.call('GET', url, {
                        query: _.toQueryString(params)
                    }, function (err, rs) {
                        if (err) console.log(err);
                        if (rs) {
                            var a = verifyResult(0, rs['data']);
                            cb(null ,a);
                        }
                    });
                }),
                Meteor.bindEnvironment(function(rs, cb){
                    var url = 'http://gw.api.alibaba.com/openapi/param2/2/portals.open/api.getPromotionLinks/'+apiKey;
                    var urlProducts  = _.map(rs.products, function(p){
                        return p.productUrl;
                    })
                    var params = {
                        trackingId : trackingId,
                        fields : ['url','promotionUrl'],
                        urls : urlProducts
                    }
                    HTTP.call('GET',url,{
                        query : _.toQueryString(params)
                    },function(err, rs1){
                        if(err) throw new Meteor.Error(err);
                        if(rs1 && rs1.data){
                            var promotionUrls = rs1.data.result.promotionUrls;
                            var products = _.map(rs.products,function(p){
                                var pUrl = _.findWhere(promotionUrls,{url : p.productUrl});
                                return _.extend(p, {promotionUrl : pUrl.promotionUrl});
                            });
                            cb(null, _.extend(rs,{products : products}));
                        }
                    })
                })
            ],Meteor.bindEnvironment(function(err, rs){
                if(err) console.log(err);
                done(null, rs);
            }))
        });
        return rs.result;
    }catch(ex){
        dumpError(ex);
    }
}

var verifyResult = function (type, rs) {
    var isPass = Match.test(rs, {
        errorCode: Number,
        result: {
            totalResults: Number,
            products: [Object]
        }
    });
    var msgCode = function (arr, code) {
        var msg = '';
        arr.some(function (a) {
            msg = a[code];
            if (msg) {
                return true;
            }
        });
        return msg;
    }
    if (isPass) {
        switch (type) {
            case 0:
                return {
                    msg: msgCode(errorCodes1, rs.errorCode),
                    total : rs.result.totalResults,
                    products : rs.result.products
                }
                break;
        }
    }
}

var getPromotionProductDetail = function (apiKey, trackingId) {
    if (apiKey === null || trackingId === null) return;
}

var getPromotionLinks = function () {
    if (apiKey === null || trackingId === null) return;
}

var errorCodes1 = [
    {20010000: 'Call succeeds'},
    {20020000: 'System Error'},
    {20030000: 'Unauthorized transfer request'},
    {20030010: 'Required parameters'},
    {20030020: 'Invalid protocol format'},
    {20030030: 'API version input parameter error'},
    {20030040: 'API name space input parameter error'},
    {20030050: 'API name input parameter error'},
    {20030060: 'Fields input parameter error'},
    {20030070: 'Keyword input parameter error'},
    {20030080: 'Category ID input parameter error'},
    {20030090: 'Tracking ID input parameter error'},
    {20030100: 'Commission rate input parameter error'},
    {20030110: 'Original Price input parameter error'},
    {20030120: 'Discount input parameter error'},
    {20030130: 'Volume input parameter error'},
    {20030140: 'Page number input parameter error'},
    {20030150: 'Page size input parameter error'},
    {20030160: 'Sort input parameter error'},
    {20030170: 'Credit Score input parameter error'},
];

var errorCodes2 = [
    {20010000: 'Call succeeds'},
    {20020000: 'System Error'},
    {20030000: 'Unauthorized transfer request'},
    {20030010: 'Required parameters'},
    {20030020: 'Invalid protocol format'},
    {20030030: 'API version input parameter error'},
    {20030040: 'API name space input parameter error'},
    {20030050: 'API name input parameter error'},
    {20030060: 'Fields input parameter error'},
    {20030070: 'Product ID input parameter error'},
];

var errorCodes3 = [
    {20010000: 'Call succeeds'},
    {20020000: 'System Error'},
    {20030000: 'Unauthorized transfer request'},
    {20030010: 'Required parameters'},
    {20030020: 'Invalid protocol format'},
    {20030030: 'API version input parameter error'},
    {20030040: 'API name space input parameter error'},
    {20030050: 'API name input parameter error'},
    {20030060: 'Fields input parameter error'},
    {20030070: 'Tracking ID input parameter error'},
    {20030080: 'URL input parameter error or beyond the maximum number of the URLs'}
];

_.mixin({
    'toQueryString': function (parameters) {
        var queryString = _.reduce(
            parameters,
            function (components, value, key) {
                components.push(key + '=' + encodeURIComponent(value));
                return components;
            },
            []
        ).join('&');
        /*if (queryString.length > 0) {
            queryString = '?' + queryString;
        }*/
        return queryString;
    },

    'fromQueryString': function (queryString) {
        return _.reduce(
            queryString.replace('?', '').split('&'),
            function (parameters, parameter) {
                if (parameter.length > 0) {
                    _.extend(parameters, _.object([_.map(parameter.split('='), decodeURIComponent)]));
                }
                return parameters;
            },
            {}
        );
    }
});

function dumpError(err) {
    if (typeof err === 'object') {
        if (err.message) {
            console.log('\nMessage: ' + err.message)
        }
        if (err.stack) {
            console.log('\nStacktrace:')
            console.log('====================')
            console.log(err.stack);
        }
    } else {
        console.log('dumpError :: argument is not an object');
    }
}