if(Meteor.isClient){
    BlazeLayout.setRoot('body');
}

FlowRouter.route('/',{
    name : 'home',
    subscriptions : function(p, q){
        this.register('ae_categories', Meteor.subscribe('getAECategories'));
    },
    action : function(){
        BlazeLayout.render('layout',{
            top : 'nav',
            main : 'home'
        })
    }
})