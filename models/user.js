"use strict";
var bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(10);

module.exports = function(sequelize, DataTypes) {
 var User = sequelize.define("User", {
   firstName: DataTypes.STRING,
   lastName: DataTypes.STRING,
   phoneNum: DataTypes.STRING,
   userName: DataTypes.STRING,
   email: { 
     type: DataTypes.STRING, 
     unique: true, 
     validate: {
       len: [6, 30],
     }
   },
   passwordDigest: {
     type:DataTypes.STRING,
     validate: {
       notEmpty: true
     }
   },
  },
  {
   instanceMethods: {
     checkPassword: function(password) {
       return bcrypt.compareSync(password, this.passwordDigest);
     },
     addToFavs: function(db,LikeUrl) {
       return db.Like
         .create({likeUrl: LikeUrl, UserId: this.id});
     }
   },
   classMethods: {
     encryptPassword: function(password) {
       var hash = bcrypt.hashSync(password, salt);
       return hash;
     },
     createSecure: function(email, password, first,last,phone,usrname) {
       if(password.length < 6) {
         throw new Error("Password too short");
       }
       return this.create({
         email: email,
         passwordDigest: this.encryptPassword(password),
         firstName: first,
         lastName: last,
         phoneNum: phone,
         userName: usrname
       });

     },
     authenticate: function(email, password) {
       // find a user in the DB
       return this.find({
         where: {
           email: email
         }
       }) 
       .then(function(user){
         if (user === null){
           throw new Error("Username does not exist");
         }
         else if (user.checkPassword(password)){
           return user;
         } else {
           return false;
         }

       });
     },
     associate: function(models) {
      this.hasMany(models.Like);
       // associations can be defined here
     }

   } // close classMethods
 }); // close define user
 return User;
}; // close User function