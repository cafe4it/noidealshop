Template.home.onCreated(function () {
    var self = this;
    self.products = new ReactiveVar();
    self.sortItems = new ReactiveVar();
    self.autorun(function(c){
        Meteor.call('getSortItems', function(err, rs){
            self.sortItems.set(rs);
        })
    })
})

Template.home.helpers({
    ae_categories: function () {
        return AECategories.find();
    },
    ae_sortItems : function(){
        return Template.instance().sortItems.get();
    },
    isProductsReady: function () {
        return (Template.instance().products.get());
    },
    products: function () {
        return Template.instance().products.get();
    }
});

Template.home.events({
    'click button#search': function (e, t) {
        e.preventDefault();
        var catId = parseInt(t.$('#sltCat option:selected').val()),
            sort = t.$('#sltSort option:selected').val()
        var keywords = t.$('#keywords').val();
        if (!catId || !keywords) return;
        var params = _.extend({}, {keywords: keywords, sort : sort});
        t.products.set(null);
        Meteor.call('searchProducts',catId, params, function(err, rs){
            if(err) console.error(err);
            if(rs){
                t.products.set(rs.products);
            }
        })
    }
})