if(Meteor.isServer){
    AliClient = new ALI();
    Meteor.startup(function(){
        if(AECategories.find().count() === 0){
            var categories = AliClient.getCategories();
            categories.forEach(function(c){
                AECategories.insert(c);
            })
        }
    });

    Meteor.publish('getAECategories',function(){
        return AECategories.find();
    });

    Meteor.methods({
        searchProducts : function(catId, params){
            //check(catId,Number);
            check(params,{
                keywords : String,
                sort : String
            });
            return AliClient.getProductsByCat2(catId, params);
        },
        getSortItems : function(){
            return AliClient.sortItems;
        }
    })
}