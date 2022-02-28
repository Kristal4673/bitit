const User = require('./User');
const post = require('./post');
const comment=require("./comment");
User.hasMany(post, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE'
});

post.belongsTo(User, {
  foreignKey: 'user_id'
});
User.hasMany(comment,{
  foreignKey : "user_id"
});
comment.belongsTo(User,{
  foreignKey : "user_id"
})
post.hasOne(comment,{
  foreignKey : "blog_id"
})

module.exports = { User, post,comment };
