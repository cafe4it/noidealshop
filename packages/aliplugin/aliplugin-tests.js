Tinytest.add('test key and tracking', function (t) {
    var ali = new ALI();
    t.equal('71737', ali.apiKey);
    t.equal('gooogle', ali.trackingId);
});

Tinytest.add('test categories', function(t){
    var ali = new ALI();
    t.isTrue(ali.getCategories().length > 0);
});

Tinytest.add('test getProductsByCat', function(t){
    var ali = new ALI();
    var rs = ali.getProductsByCat(26,{keywords : 'baby sexy'});
    t.equal('Call succeeds', rs.msg);
    t.equal(20, rs.products.length);
    t.isTrue(rs.total > 0);

    var rs1 = ali.getProductsByCat2(26,{keywords : 'baby sexy'});
    var p = rs1.products[0];
    t.equal(true, _.has(p,'promotionUrl'));
    //console.log(rs1);
    //test return params as object
    /*t.equal(true, Match.test(products, {
        categoryId : Number,
        fields : [String],
        trackingId : String
    }));*/

    //test return params as queryString
    /*console.log(products)
    t.isTrue(_.isString(products));*/
});